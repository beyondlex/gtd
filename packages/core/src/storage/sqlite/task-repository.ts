import { type Database } from "bun:sqlite";
import type { TaskRepository } from "../interfaces.js";
import type { Task, TaskRow } from "../../models/types.js";
import { taskSchema } from "../../models/validation.js";
import { startOfDay, endOfDay, addDays } from "../../utils/date-parser.js";

function rowToTask(row: TaskRow): Task {
  return taskSchema.parse({
    id: row.id,
    title: row.title,
    notes: row.notes,
    projectId: row.project_id,
    areaId: row.area_id,
    headingId: row.heading_id,
    isCompleted: Boolean(row.is_completed),
    isInInbox: Boolean(row.is_in_inbox),
    isSomeday: Boolean(row.is_someday),
    isDeleted: Boolean(row.is_deleted),
    deadline: row.deadline ? new Date(row.deadline) : null,
    startDate: row.start_date ? new Date(row.start_date) : null,
    reminderDate: row.reminder_date ? new Date(row.reminder_date) : null,
    repeatRule: row.repeat_rule,
    completionDate: row.completion_date ? new Date(row.completion_date) : null,
    sortOrder: row.sort_order,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    deletedAt: row.deleted_at ? new Date(row.deleted_at) : null,
  });
}

const ACTIVE_FILTER = `is_completed = 0 AND is_deleted = 0`;

export class SqliteTaskRepository implements TaskRepository {
  constructor(private db: Database) {}

  create(data: Task): Task {
    this.db.run(
      `INSERT INTO tasks (id, title, notes, project_id, area_id, heading_id, is_completed, is_in_inbox, is_someday, is_deleted,
        deadline, start_date, reminder_date, repeat_rule, completion_date, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.id,
        data.title,
        data.notes,
        data.projectId,
        data.areaId,
        data.headingId,
        data.isCompleted ? 1 : 0,
        data.isInInbox ? 1 : 0,
        data.isSomeday ? 1 : 0,
        data.isDeleted ? 1 : 0,
        data.deadline?.toISOString() ?? null,
        data.startDate?.toISOString() ?? null,
        data.reminderDate?.toISOString() ?? null,
        data.repeatRule,
        data.completionDate?.toISOString() ?? null,
        data.sortOrder,
        data.createdAt.toISOString(),
        data.updatedAt.toISOString(),
      ]
    );
    return data;
  }

  update(id: string, data: Partial<Task>): Task {
    const existing = this.findById(id);
    if (!existing) throw new Error(`Task not found: ${id}`);

    const merged = { ...existing, ...data, updatedAt: new Date() };
    this.db.run(
      `UPDATE tasks SET title = ?, notes = ?, project_id = ?, area_id = ?, heading_id = ?,
        is_completed = ?, is_in_inbox = ?, is_someday = ?, is_deleted = ?,
        deadline = ?, start_date = ?, reminder_date = ?, repeat_rule = ?,
        completion_date = ?, sort_order = ?, updated_at = ?
       WHERE id = ?`,
      [
        merged.title,
        merged.notes,
        merged.projectId,
        merged.areaId,
        merged.headingId,
        merged.isCompleted ? 1 : 0,
        merged.isInInbox ? 1 : 0,
        merged.isSomeday ? 1 : 0,
        merged.isDeleted ? 1 : 0,
        merged.deadline?.toISOString() ?? null,
        merged.startDate?.toISOString() ?? null,
        merged.reminderDate?.toISOString() ?? null,
        merged.repeatRule,
        merged.completionDate?.toISOString() ?? null,
        merged.sortOrder,
        merged.updatedAt.toISOString(),
        id,
      ]
    );
    return merged;
  }

  delete(id: string): void {
    this.db.run(`DELETE FROM tasks WHERE id = ?`, [id]);
  }

  findById(id: string): Task | null {
    const row = this.db.query<TaskRow, string>(`SELECT * FROM tasks WHERE id = ?`).get(id);
    return row ? rowToTask(row) : null;
  }

  findAll(): Task[] {
    const rows = this.db.query<TaskRow, []>(`SELECT * FROM tasks ORDER BY sort_order`).all();
    return rows.map(rowToTask);
  }

  findByProject(projectId: string): Task[] {
    const rows = this.db
      .query<TaskRow, string>(`SELECT * FROM tasks WHERE project_id = ? AND is_deleted = 0 ORDER BY sort_order`)
      .all(projectId);
    return rows.map(rowToTask);
  }

  findByArea(areaId: string): Task[] {
    const rows = this.db
      .query<TaskRow, string>(`SELECT * FROM tasks WHERE area_id = ? AND is_deleted = 0 ORDER BY sort_order`)
      .all(areaId);
    return rows.map(rowToTask);
  }

  findByHeading(headingId: string): Task[] {
    const rows = this.db
      .query<TaskRow, string>(`SELECT * FROM tasks WHERE heading_id = ? AND is_deleted = 0 ORDER BY sort_order`)
      .all(headingId);
    return rows.map(rowToTask);
  }

  findInbox(): Task[] {
    const rows = this.db
      .query<TaskRow, []>(`SELECT * FROM tasks WHERE is_in_inbox = 1 AND ${ACTIVE_FILTER} ORDER BY created_at DESC`)
      .all();
    return rows.map(rowToTask);
  }

  findToday(): Task[] {
    const todayStart = startOfDay(new Date()).toISOString();
    const todayEnd = endOfDay(new Date()).toISOString();
    const rows = this.db
      .query<TaskRow, [string, string, string]>(`SELECT * FROM tasks WHERE ${ACTIVE_FILTER} AND is_in_inbox = 0 AND is_someday = 0
        AND ((deadline IS NOT NULL AND deadline >= ? AND deadline <= ?) OR (start_date IS NOT NULL AND start_date <= ?))
        ORDER BY deadline ASC, sort_order ASC`)
      .all(todayStart, todayEnd, todayEnd);
    return rows.map(rowToTask);
  }

  findOverdue(): Task[] {
    const todayStart = startOfDay(new Date()).toISOString();
    const rows = this.db
      .query<TaskRow, string>(`SELECT * FROM tasks WHERE ${ACTIVE_FILTER} AND is_in_inbox = 0 AND is_someday = 0
        AND deadline IS NOT NULL AND deadline < ?
        ORDER BY deadline ASC`)
      .all(todayStart);
    return rows.map(rowToTask);
  }

  findUpcoming(days: number): Task[] {
    const now = new Date();
    const future = addDays(now, days);
    const rows = this.db
      .query<TaskRow, [string, string, string, string]>(`SELECT * FROM tasks WHERE ${ACTIVE_FILTER} AND is_in_inbox = 0 AND is_someday = 0
        AND ((deadline IS NOT NULL AND deadline >= ? AND deadline <= ?) OR (start_date IS NOT NULL AND start_date >= ? AND start_date <= ?))
        ORDER BY COALESCE(deadline, start_date) ASC, sort_order ASC`)
      .all(now.toISOString(), future.toISOString(), now.toISOString(), future.toISOString());
    return rows.map(rowToTask);
  }

  findAnytime(): Task[] {
    const rows = this.db
      .query<TaskRow, []>(`SELECT * FROM tasks WHERE ${ACTIVE_FILTER} AND is_in_inbox = 0 AND is_someday = 0
        AND deadline IS NULL AND start_date IS NULL
        ORDER BY sort_order ASC`)
      .all();
    return rows.map(rowToTask);
  }

  findSomeday(): Task[] {
    const rows = this.db
      .query<TaskRow, []>(`SELECT * FROM tasks WHERE ${ACTIVE_FILTER} AND is_someday = 1 ORDER BY sort_order ASC`)
      .all();
    return rows.map(rowToTask);
  }

  findCompleted(): Task[] {
    const rows = this.db
      .query<TaskRow, []>(`SELECT * FROM tasks WHERE is_completed = 1 AND is_deleted = 0 ORDER BY completion_date DESC`)
      .all();
    return rows.map(rowToTask);
  }

  findDeleted(): Task[] {
    const rows = this.db
      .query<TaskRow, []>(`SELECT * FROM tasks WHERE is_deleted = 1 ORDER BY deleted_at DESC`)
      .all();
    return rows.map(rowToTask);
  }

  findByDateRange(start: Date, end: Date): Task[] {
    const rows = this.db
      .query<TaskRow, [string, string, string, string]>(`SELECT * FROM tasks WHERE ${ACTIVE_FILTER}
        AND ((deadline IS NOT NULL AND deadline >= ? AND deadline <= ?) OR (start_date IS NOT NULL AND start_date >= ? AND start_date <= ?))
        ORDER BY COALESCE(deadline, start_date) ASC`)
      .all(start.toISOString(), end.toISOString(), start.toISOString(), end.toISOString());
    return rows.map(rowToTask);
  }

  search(query: string): Task[] {
    const pattern = `%${query}%`;
    const rows = this.db
      .query<TaskRow, [string, string]>(`SELECT * FROM tasks WHERE is_deleted = 0 AND (title LIKE ? OR notes LIKE ?) ORDER BY sort_order ASC`)
      .all(pattern, pattern);
    return rows.map(rowToTask);
  }

  findByTag(tagId: string): Task[] {
    const rows = this.db
      .query<TaskRow, string>(`SELECT t.* FROM tasks t JOIN task_tags tt ON t.id = tt.task_id
        WHERE tt.tag_id = ? AND t.is_deleted = 0 ORDER BY t.sort_order ASC`)
      .all(tagId);
    return rows.map(rowToTask);
  }

  findByCompletionDate(date: Date): Task[] {
    const dayStart = startOfDay(date).toISOString();
    const dayEnd = endOfDay(date).toISOString();
    const rows = this.db
      .query<TaskRow, [string, string]>(`SELECT * FROM tasks WHERE is_completed = 1 AND completion_date >= ? AND completion_date <= ?
        ORDER BY completion_date DESC`)
      .all(dayStart, dayEnd);
    return rows.map(rowToTask);
  }
}