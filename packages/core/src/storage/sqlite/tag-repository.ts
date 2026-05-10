import type { Database } from "bun:sqlite";
import type { TagRepository } from "../interfaces.js";
import type { Tag, TaskTag } from "../../models/types.js";

interface TagRow {
  id: string;
  title: string;
  color: string | null;
  sort_order: number;
}

interface TaskTagRow {
  task_id: string;
  tag_id: string;
}

function rowToTag(row: TagRow): Tag {
  return {
    id: row.id,
    title: row.title,
    color: row.color,
    sortOrder: row.sort_order,
  };
}

export class SqliteTagRepository implements TagRepository {
  constructor(private db: Database) {}

  create(data: Tag): Tag {
    this.db.run(`INSERT INTO tags (id, title, color, sort_order) VALUES (?, ?, ?, ?)`, [
      data.id,
      data.title,
      data.color,
      data.sortOrder,
    ]);
    return data;
  }

  update(id: string, data: Partial<Tag>): Tag {
    const existing = this.findById(id);
    if (!existing) throw new Error(`Tag not found: ${id}`);

    const merged = { ...existing, ...data };
    this.db.run(`UPDATE tags SET title = ?, color = ?, sort_order = ? WHERE id = ?`, [
      merged.title,
      merged.color,
      merged.sortOrder,
      id,
    ]);
    return merged;
  }

  delete(id: string): void {
    this.db.run(`DELETE FROM tags WHERE id = ?`, [id]);
  }

  findById(id: string): Tag | null {
    const row = this.db.query<TagRow, string>(`SELECT * FROM tags WHERE id = ?`).get(id);
    return row ? rowToTag(row) : null;
  }

  findAll(): Tag[] {
    const rows = this.db.query<TagRow, []>(`SELECT * FROM tags ORDER BY sort_order`).all();
    return rows.map(rowToTag);
  }

  findByTitle(title: string): Tag | null {
    const row = this.db.query<TagRow, string>(`SELECT * FROM tags WHERE title = ?`).get(title);
    return row ? rowToTag(row) : null;
  }

  findByTask(taskId: string): Tag[] {
    const rows = this.db
      .query<TagRow, string>(`SELECT t.* FROM tags t JOIN task_tags tt ON t.id = tt.tag_id WHERE tt.task_id = ? ORDER BY t.sort_order`)
      .all(taskId);
    return rows.map(rowToTag);
  }

  addToTask(taskId: string, tagId: string): void {
    this.db.run(`INSERT OR IGNORE INTO task_tags (task_id, tag_id) VALUES (?, ?)`, [taskId, tagId]);
  }

  removeFromTask(taskId: string, tagId: string): void {
    this.db.run(`DELETE FROM task_tags WHERE task_id = ? AND tag_id = ?`, [taskId, tagId]);
  }

  getTaskTags(taskId: string): TaskTag[] {
    return this.db
      .query<TaskTagRow, string>(`SELECT * FROM task_tags WHERE task_id = ?`,)
      .all(taskId)
      .map((row) => ({ taskId: row.task_id, tagId: row.tag_id }));
  }
}