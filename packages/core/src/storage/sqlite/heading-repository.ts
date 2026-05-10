import type { Database } from "bun:sqlite";
import type { HeadingRepository } from "../interfaces.js";
import type { Heading } from "../../models/types.js";

interface HeadingRow {
  id: string;
  title: string;
  project_id: string;
  sort_order: number;
}

function rowToHeading(row: HeadingRow): Heading {
  return {
    id: row.id,
    title: row.title,
    projectId: row.project_id,
    sortOrder: row.sort_order,
  };
}

export class SqliteHeadingRepository implements HeadingRepository {
  constructor(private db: Database) {}

  create(data: Heading): Heading {
    this.db.run(`INSERT INTO headings (id, title, project_id, sort_order) VALUES (?, ?, ?, ?)`, [
      data.id,
      data.title,
      data.projectId,
      data.sortOrder,
    ]);
    return data;
  }

  update(id: string, data: Partial<Heading>): Heading {
    const existing = this.findById(id);
    if (!existing) throw new Error(`Heading not found: ${id}`);

    const merged = { ...existing, ...data };
    this.db.run(`UPDATE headings SET title = ?, sort_order = ? WHERE id = ?`, [
      merged.title,
      merged.sortOrder,
      id,
    ]);
    return merged;
  }

  delete(id: string): void {
    this.db.run(`DELETE FROM headings WHERE id = ?`, [id]);
  }

  findById(id: string): Heading | null {
    const row = this.db.query<HeadingRow, string>(`SELECT * FROM headings WHERE id = ?`).get(id);
    return row ? rowToHeading(row) : null;
  }

  findAll(): Heading[] {
    const rows = this.db.query<HeadingRow, []>(`SELECT * FROM headings ORDER BY sort_order`).all();
    return rows.map(rowToHeading);
  }

  findByProject(projectId: string): Heading[] {
    const rows = this.db
      .query<HeadingRow, string>(`SELECT * FROM headings WHERE project_id = ? ORDER BY sort_order`)
      .all(projectId);
    return rows.map(rowToHeading);
  }
}