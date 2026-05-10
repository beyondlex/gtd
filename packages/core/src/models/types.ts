export type ViewType =
  | "inbox"
  | "today"
  | "upcoming"
  | "anytime"
  | "someday"
  | "logbook"
  | "trash";

export interface Area {
  id: string;
  title: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  title: string;
  areaId: string | null;
  isCompleted: boolean;
  isCanceled: boolean;
  isDeleted: boolean;
  deadline: Date | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface Heading {
  id: string;
  title: string;
  projectId: string;
  sortOrder: number;
}

export interface Task {
  id: string;
  title: string;
  notes: string;
  projectId: string | null;
  areaId: string | null;
  headingId: string | null;
  isCompleted: boolean;
  isInInbox: boolean;
  isSomeday: boolean;
  isDeleted: boolean;
  deadline: Date | null;
  startDate: Date | null;
  reminderDate: Date | null;
  repeatRule: string | null;
  completionDate: Date | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface ChecklistItem {
  id: string;
  taskId: string;
  text: string;
  isCompleted: boolean;
  sortOrder: number;
}

export interface Tag {
  id: string;
  title: string;
  color: string | null;
  sortOrder: number;
}

export interface TaskTag {
  taskId: string;
  tagId: string;
}

/** Raw row shapes as stored in SQLite (dates as ISO strings, booleans as 0/1) */
export interface AreaRow {
  id: string;
  title: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectRow {
  id: string;
  title: string;
  area_id: string | null;
  is_completed: number;
  is_canceled: number;
  is_deleted: number;
  deadline: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface TaskRow {
  id: string;
  title: string;
  notes: string;
  project_id: string | null;
  area_id: string | null;
  heading_id: string | null;
  is_completed: number;
  is_in_inbox: number;
  is_someday: number;
  is_deleted: number;
  deadline: string | null;
  start_date: string | null;
  reminder_date: string | null;
  repeat_rule: string | null;
  completion_date: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ChecklistItemRow {
  id: string;
  task_id: string;
  text: string;
  is_completed: number;
  sort_order: number;
}

export interface TagRow {
  id: string;
  title: string;
  color: string | null;
  sort_order: number;
}

export interface TaskTagRow {
  task_id: string;
  tag_id: string;
}