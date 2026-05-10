import type { Area, Project, Task, Heading, ChecklistItem, Tag, TaskTag } from "../models/types.js";

// ── Generic Repository ──

export interface Repository<T> {
  create(data: T): T;
  update(id: string, data: Partial<T>): T;
  delete(id: string): void;
  findById(id: string): T | null;
  findAll(): T[];
}

// ── Area Repository ──

export interface AreaRepository extends Repository<Area> {
  findByTitle(title: string): Area | null;
}

// ── Project Repository ──

export interface ProjectRepository extends Repository<Project> {
  findByArea(areaId: string): Project[];
  findActive(): Project[];
  findCompleted(): Project[];
  findDeleted(): Project[];
}

// ── Task Repository ──

export interface TaskRepository extends Repository<Task> {
  findByProject(projectId: string): Task[];
  findByArea(areaId: string): Task[];
  findByHeading(headingId: string): Task[];
  findInbox(): Task[];
  findToday(): Task[];
  findOverdue(): Task[];
  findUpcoming(days: number): Task[];
  findAnytime(): Task[];
  findSomeday(): Task[];
  findCompleted(): Task[];
  findDeleted(): Task[];
  findByDateRange(start: Date, end: Date): Task[];
  search(query: string): Task[];
  findByTag(tagId: string): Task[];
  findByCompletionDate(date: Date): Task[];
}

// ── Heading Repository ──

export interface HeadingRepository extends Repository<Heading> {
  findByProject(projectId: string): Heading[];
}

// ── ChecklistItem Repository ──

export interface ChecklistItemRepository extends Repository<ChecklistItem> {
  findByTask(taskId: string): ChecklistItem[];
}

// ── Tag Repository ──

export interface TagRepository extends Repository<Tag> {
  findByTitle(title: string): Tag | null;
  findByTask(taskId: string): Tag[];
  addToTask(taskId: string, tagId: string): void;
  removeFromTask(taskId: string, tagId: string): void;
  getTaskTags(taskId: string): TaskTag[];
}