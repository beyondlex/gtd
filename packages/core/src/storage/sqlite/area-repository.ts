import type { Database } from "bun:sqlite";
import type { AreaRepository } from "../interfaces.js";
import type { Area, AreaRow } from "../../models/types.js";
import { areaSchema } from "../../models/validation.js";

function rowToArea(row: AreaRow): Area {
  return areaSchema.parse({
    id: row.id,
    title: row.title,
    sortOrder: row.sort_order,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  });
}

export class SqliteAreaRepository implements AreaRepository {
  constructor(private db: Database) {}

  create(data: Area): Area {
    this.db.run(
      `INSERT INTO areas (id, title, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`,
      [data.id, data.title, data.sortOrder, data.createdAt.toISOString(), data.updatedAt.toISOString()]
    );
    return data;
  }

  update(id: string, data: Partial<Area>): Area {
    const existing = this.findById(id);
    if (!existing) throw new Error(`Area not found: ${id}`);

    const merged = { ...existing, ...data, updatedAt: new Date() };
    this.db.run(
      `UPDATE areas SET title = ?, sort_order = ?, updated_at = ? WHERE id = ?`,
      [merged.title, merged.sortOrder, merged.updatedAt.toISOString(), id]
    );
    return merged;
  }

  delete(id: string): void {
    this.db.run(`DELETE FROM areas WHERE id = ?`, [id]);
  }

  findById(id: string): Area | null {
    const row = this.db.query<AreaRow, string>(`SELECT * FROM areas WHERE id = ?`).get(id);
    return row ? rowToArea(row) : null;
  }

  findAll(): Area[] {
    const rows = this.db.query<AreaRow, []>(`SELECT * FROM areas ORDER BY sort_order`).all();
    return rows.map(rowToArea);
  }

  findByTitle(title: string): Area | null {
    const row = this.db.query<AreaRow, string>(`SELECT * FROM areas WHERE title = ?`).get(title);
    return row ? rowToArea(row) : null;
  }
}