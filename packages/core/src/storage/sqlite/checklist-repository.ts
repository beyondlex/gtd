import type { Database } from "bun:sqlite";
import type { ChecklistItemRepository } from "../interfaces.js";
import type { ChecklistItem } from "../../models/types.js";

interface ChecklistItemRow {
  id: string;
  task_id: string;
  text: string;
  is_completed: number;
  sort_order: number;
}

function rowToChecklistItem(row: ChecklistItemRow): ChecklistItem {
  return {
    id: row.id,
    taskId: row.task_id,
    text: row.text,
    isCompleted: Boolean(row.is_completed),
    sortOrder: row.sort_order,
  };
}

export class SqliteChecklistItemRepository implements ChecklistItemRepository {
  constructor(private db: Database) {}

  create(data: ChecklistItem): ChecklistItem {
    this.db.run(
      `INSERT INTO checklist_items (id, task_id, text, is_completed, sort_order) VALUES (?, ?, ?, ?, ?)`,
      [data.id, data.taskId, data.text, data.isCompleted ? 1 : 0, data.sortOrder]
    );
    return data;
  }

  update(id: string, data: Partial<ChecklistItem>): ChecklistItem {
    const existing = this.findById(id);
    if (!existing) throw new Error(`ChecklistItem not found: ${id}`);

    const merged = { ...existing, ...data };
    this.db.run(`UPDATE checklist_items SET text = ?, is_completed = ?, sort_order = ? WHERE id = ?`, [
      merged.text,
      merged.isCompleted ? 1 : 0,
      merged.sortOrder,
      id,
    ]);
    return merged;
  }

  delete(id: string): void {
    this.db.run(`DELETE FROM checklist_items WHERE id = ?`, [id]);
  }

  findById(id: string): ChecklistItem | null {
    const row = this.db.query<ChecklistItemRow, string>(`SELECT * FROM checklist_items WHERE id = ?`).get(id);
    return row ? rowToChecklistItem(row) : null;
  }

  findAll(): ChecklistItem[] {
    const rows = this.db.query<ChecklistItemRow, []>(`SELECT * FROM checklist_items ORDER BY sort_order`).all();
    return rows.map(rowToChecklistItem);
  }

  findByTask(taskId: string): ChecklistItem[] {
    const rows = this.db
      .query<ChecklistItemRow, string>(`SELECT * FROM checklist_items WHERE task_id = ? ORDER BY sort_order`)
      .all(taskId);
    return rows.map(rowToChecklistItem);
  }
}