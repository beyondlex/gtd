import { z } from "zod";

// ── ID ──
export const idSchema = z.string().uuid();

// ── Area ──
export const areaSchema = z.object({
  id: idSchema,
  title: z.string().min(1).max(200),
  sortOrder: z.number().int().nonnegative(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createAreaSchema = z.object({
  title: z.string().min(1).max(200),
  sortOrder: z.number().int().nonnegative().optional(),
});

export const updateAreaSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  sortOrder: z.number().int().nonnegative().optional(),
});

// ── Project ──
export const projectSchema = z.object({
  id: idSchema,
  title: z.string().min(1).max(200),
  areaId: idSchema.nullable(),
  isCompleted: z.boolean(),
  isCanceled: z.boolean(),
  isDeleted: z.boolean(),
  deadline: z.date().nullable(),
  sortOrder: z.number().int().nonnegative(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

export const createProjectSchema = z.object({
  title: z.string().min(1).max(200),
  areaId: idSchema.nullable().optional(),
  deadline: z.date().nullable().optional(),
  sortOrder: z.number().int().nonnegative().optional(),
});

export const updateProjectSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  areaId: idSchema.nullable().optional(),
  deadline: z.date().nullable().optional(),
  isCompleted: z.boolean().optional(),
  isCanceled: z.boolean().optional(),
  sortOrder: z.number().int().nonnegative().optional(),
});

// ── Heading ──
export const headingSchema = z.object({
  id: idSchema,
  title: z.string().min(1).max(200),
  projectId: idSchema,
  sortOrder: z.number().int().nonnegative(),
});

export const createHeadingSchema = z.object({
  title: z.string().min(1).max(200),
  projectId: idSchema,
  sortOrder: z.number().int().nonnegative().optional(),
});

// ── Task ──
export const taskSchema = z.object({
  id: idSchema,
  title: z.string().min(1).max(500),
  notes: z.string().max(10000).default(""),
  projectId: idSchema.nullable(),
  areaId: idSchema.nullable(),
  headingId: idSchema.nullable(),
  isCompleted: z.boolean(),
  isInInbox: z.boolean(),
  isSomeday: z.boolean(),
  isDeleted: z.boolean(),
  deadline: z.date().nullable(),
  startDate: z.date().nullable(),
  reminderDate: z.date().nullable(),
  repeatRule: z.string().nullable(),
  completionDate: z.date().nullable(),
  sortOrder: z.number().int().nonnegative(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

export const createTaskSchema = z.object({
  title: z.string().min(1).max(500),
  notes: z.string().max(10000).optional(),
  projectId: idSchema.nullable().optional(),
  areaId: idSchema.nullable().optional(),
  headingId: idSchema.nullable().optional(),
  isInInbox: z.boolean().optional(),
  isSomeday: z.boolean().optional(),
  deadline: z.date().nullable().optional(),
  startDate: z.date().nullable().optional(),
  reminderDate: z.date().nullable().optional(),
  repeatRule: z.string().nullable().optional(),
  sortOrder: z.number().int().nonnegative().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  notes: z.string().max(10000).optional(),
  projectId: idSchema.nullable().optional(),
  areaId: idSchema.nullable().optional(),
  headingId: idSchema.nullable().optional(),
  isCompleted: z.boolean().optional(),
  isInInbox: z.boolean().optional(),
  isSomeday: z.boolean().optional(),
  isDeleted: z.boolean().optional(),
  deadline: z.date().nullable().optional(),
  startDate: z.date().nullable().optional(),
  reminderDate: z.date().nullable().optional(),
  repeatRule: z.string().nullable().optional(),
  completionDate: z.date().nullable().optional(),
  sortOrder: z.number().int().nonnegative().optional(),
});

// ── ChecklistItem ──
export const checklistItemSchema = z.object({
  id: idSchema,
  taskId: idSchema,
  text: z.string().min(1).max(500),
  isCompleted: z.boolean(),
  sortOrder: z.number().int().nonnegative(),
});

export const createChecklistItemSchema = z.object({
  taskId: idSchema,
  text: z.string().min(1).max(500),
  sortOrder: z.number().int().nonnegative().optional(),
});

// ── Tag ──
export const tagSchema = z.object({
  id: idSchema,
  title: z.string().min(1).max(100),
  color: z.string().nullable(),
  sortOrder: z.number().int().nonnegative(),
});

export const createTagSchema = z.object({
  title: z.string().min(1).max(100),
  color: z.string().nullable().optional(),
  sortOrder: z.number().int().nonnegative().optional(),
});

export const updateTagSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  color: z.string().nullable().optional(),
  sortOrder: z.number().int().nonnegative().optional(),
});

// ── TaskTag ──
export const taskTagSchema = z.object({
  taskId: idSchema,
  tagId: idSchema,
});

// ── Type exports ──
export type CreateAreaInput = z.infer<typeof createAreaSchema>;
export type UpdateAreaInput = z.infer<typeof updateAreaSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type CreateHeadingInput = z.infer<typeof createHeadingSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type CreateChecklistItemInput = z.infer<typeof createChecklistItemSchema>;
export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;