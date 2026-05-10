import type { Database } from "bun:sqlite";
import type { ProjectRepository } from "../interfaces.js";
import type { Project, ProjectRow } from "../../models/types.js";
import { projectSchema } from "../../models/validation.js";

function rowToProject(row: ProjectRow): Project {
  return projectSchema.parse({
    id: row.id,
    title: row.title,
    areaId: row.area_id,
    isCompleted: Boolean(row.is_completed),
    isCanceled: Boolean(row.is_canceled),
    isDeleted: Boolean(row.is_deleted),
    deadline: row.deadline ? new Date(row.deadline) : null,
    sortOrder: row.sort_order,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    deletedAt: row.deleted_at ? new Date(row.deleted_at) : null,
  });
}

export class SqliteProjectRepository implements ProjectRepository {
  constructor(private db: Database) {}

  create(data: Project): Project {
    this.db.run(
      `INSERT INTO projects (id, title, area_id, is_completed, is_canceled, is_deleted, deadline, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.id,
        data.title,
        data.areaId,
        data.isCompleted ? 1 : 0,
        data.isCanceled ? 1 : 0,
        data.isDeleted ? 1 : 0,
        data.deadline?.toISOString() ?? null,
        data.sortOrder,
        data.createdAt.toISOString(),
        data.updatedAt.toISOString(),
      ]
    );
    return data;
  }

  update(id: string, data: Partial<Project>): Project {
    const existing = this.findById(id);
    if (!existing) throw new Error(`Project not found: ${id}`);

    const merged = { ...existing, ...data, updatedAt: new Date() };
    this.db.run(
      `UPDATE projects SET title = ?, area_id = ?, is_completed = ?, is_canceled = ?, is_deleted = ?, deadline = ?, sort_order = ?, updated_at = ?
       WHERE id = ?`,
      [
        merged.title,
        merged.areaId,
        merged.isCompleted ? 1 : 0,
        merged.isCanceled ? 1 : 0,
        merged.isDeleted ? 1 : 0,
        merged.deadline?.toISOString() ?? null,
        merged.sortOrder,
        merged.updatedAt.toISOString(),
        id,
      ]
    );
    return merged;
  }

  delete(id: string): void {
    this.db.run(`DELETE FROM projects WHERE id = ?`, [id]);
  }

  findById(id: string): Project | null {
    const row = this.db.query<ProjectRow, string>(`SELECT * FROM projects WHERE id = ?`).get(id);
    return row ? rowToProject(row) : null;
  }

  findAll(): Project[] {
    const rows = this.db.query<ProjectRow, []>(`SELECT * FROM projects ORDER BY sort_order`).all();
    return rows.map(rowToProject);
  }

  findByArea(areaId: string): Project[] {
    const rows = this.db.query<ProjectRow, string>(`SELECT * FROM projects WHERE area_id = ? ORDER BY sort_order`).all(areaId);
    return rows.map(rowToProject);
  }

  findActive(): Project[] {
    const rows = this.db
      .query<ProjectRow, []>(`SELECT * FROM projects WHERE is_completed = 0 AND is_canceled = 0 AND is_deleted = 0 ORDER BY sort_order`)
      .all();
    return rows.map(rowToProject);
  }

  findCompleted(): Project[] {
    const rows = this.db
      .query<ProjectRow, []>(`SELECT * FROM projects WHERE is_completed = 1 AND is_deleted = 0 ORDER BY updated_at DESC`)
      .all();
    return rows.map(rowToProject);
  }

  findDeleted(): Project[] {
    const rows = this.db
      .query<ProjectRow, []>(`SELECT * FROM projects WHERE is_deleted = 1 ORDER BY deleted_at DESC`)
      .all();
    return rows.map(rowToProject);
  }
}