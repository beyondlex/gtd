import type { Database } from "bun:sqlite";

const MIGRATIONS_TABLE = "migrations";

const migrations: { version: number; sql: string }[] = [
  {
    version: 1,
    sql: `
      CREATE TABLE IF NOT EXISTS areas (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        area_id TEXT REFERENCES areas(id) ON DELETE SET NULL,
        is_completed INTEGER NOT NULL DEFAULT 0,
        is_canceled INTEGER NOT NULL DEFAULT 0,
        is_deleted INTEGER NOT NULL DEFAULT 0,
        deadline TEXT,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT
      );

      CREATE TABLE IF NOT EXISTS headings (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        sort_order INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        notes TEXT NOT NULL DEFAULT '',
        project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
        area_id TEXT REFERENCES areas(id) ON DELETE SET NULL,
        heading_id TEXT REFERENCES headings(id) ON DELETE SET NULL,
        is_completed INTEGER NOT NULL DEFAULT 0,
        is_in_inbox INTEGER NOT NULL DEFAULT 0,
        is_someday INTEGER NOT NULL DEFAULT 0,
        is_deleted INTEGER NOT NULL DEFAULT 0,
        deadline TEXT,
        start_date TEXT,
        reminder_date TEXT,
        repeat_rule TEXT,
        completion_date TEXT,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT
      );

      CREATE TABLE IF NOT EXISTS checklist_items (
        id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        text TEXT NOT NULL,
        is_completed INTEGER NOT NULL DEFAULT 0,
        sort_order INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS tags (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        color TEXT,
        sort_order INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS task_tags (
        task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
        PRIMARY KEY (task_id, tag_id)
      );

      CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
      CREATE INDEX IF NOT EXISTS idx_tasks_area_id ON tasks(area_id);
      CREATE INDEX IF NOT EXISTS idx_tasks_heading_id ON tasks(heading_id);
      CREATE INDEX IF NOT EXISTS idx_tasks_is_completed ON tasks(is_completed);
      CREATE INDEX IF NOT EXISTS idx_tasks_is_in_inbox ON tasks(is_in_inbox);
      CREATE INDEX IF NOT EXISTS idx_tasks_is_someday ON tasks(is_someday);
      CREATE INDEX IF NOT EXISTS idx_tasks_is_deleted ON tasks(is_deleted);
      CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON tasks(deadline);
      CREATE INDEX IF NOT EXISTS idx_tasks_start_date ON tasks(start_date);
      CREATE INDEX IF NOT EXISTS idx_tasks_completion_date ON tasks(completion_date);
      CREATE INDEX IF NOT EXISTS idx_projects_area_id ON projects(area_id);
      CREATE INDEX IF NOT EXISTS idx_headings_project_id ON headings(project_id);
      CREATE INDEX IF NOT EXISTS idx_checklist_items_task_id ON checklist_items(task_id);
      CREATE INDEX IF NOT EXISTS idx_task_tags_tag_id ON task_tags(tag_id);
    `,
  },
];

export function runMigrations(db: Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
      version INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL
    );
  `);

  const currentVersion = db
    .query<{ version: number }, []>(`SELECT COALESCE(MAX(version), 0) as version FROM ${MIGRATIONS_TABLE}`)
    .get()!.version;

  for (const migration of migrations) {
    if (migration.version > currentVersion) {
      db.exec(migration.sql);
      db.run(`INSERT INTO ${MIGRATIONS_TABLE} (version, applied_at) VALUES (?, ?)`, [
        migration.version,
        new Date().toISOString(),
      ]);
    }
  }
}

export function getMigrationVersion(db: Database): number {
  return db
    .query<{ version: number }, []>(`SELECT COALESCE(MAX(version), 0) as version FROM ${MIGRATIONS_TABLE}`)
    .get()!.version;
}