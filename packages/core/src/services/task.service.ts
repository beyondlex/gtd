import type { TaskRepository } from "../storage/interfaces.js";
import type { EventBus } from "../events/event-bus.js";
import type { Task } from "../models/types.js";
import type { CreateTaskInput, UpdateTaskInput } from "../models/validation.js";
import { createTaskSchema, updateTaskSchema } from "../models/validation.js";
import { generateId } from "../utils/id.js";
import { getNextSortOrder } from "../utils/sort.js";

export class TaskService {
  constructor(
    private taskRepo: TaskRepository,
    private eventBus: EventBus,
  ) {}

  create(input: CreateTaskInput): Task {
    const valid = createTaskSchema.parse(input);
    const now = new Date();
    const task: Task = {
      id: generateId(),
      title: valid.title,
      notes: valid.notes ?? "",
      projectId: valid.projectId ?? null,
      areaId: valid.areaId ?? null,
      headingId: valid.headingId ?? null,
      isCompleted: false,
      isInInbox: valid.isInInbox ?? true,
      isSomeday: valid.isSomeday ?? false,
      isDeleted: false,
      deadline: valid.deadline ?? null,
      startDate: valid.startDate ?? null,
      reminderDate: valid.reminderDate ?? null,
      repeatRule: valid.repeatRule ?? null,
      completionDate: null,
      sortOrder: valid.sortOrder ?? 0,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
    this.taskRepo.create(task);
    this.eventBus.emit("task:created", { task });
    return task;
  }

  update(id: string, changes: UpdateTaskInput): Task {
    const valid = updateTaskSchema.parse(changes);
    const updated = this.taskRepo.update(id, valid);
    this.eventBus.emit("task:updated", { task: updated });
    return updated;
  }

  complete(id: string): Task {
    const task = this.taskRepo.findById(id);
    if (!task) throw new Error(`Task not found: ${id}`);
    const updated = this.taskRepo.update(id, {
      isCompleted: true,
      completionDate: new Date(),
    });
    this.eventBus.emit("task:completed", { taskId: id });
    return updated;
  }

  uncomplete(id: string): Task {
    const task = this.taskRepo.findById(id);
    if (!task) throw new Error(`Task not found: ${id}`);
    const updated = this.taskRepo.update(id, {
      isCompleted: false,
      completionDate: null,
    });
    return updated;
  }

  toggleComplete(id: string): Task {
    const task = this.taskRepo.findById(id);
    if (!task) throw new Error(`Task not found: ${id}`);
    if (task.isCompleted) {
      return this.uncomplete(id);
    }
    return this.complete(id);
  }

  delete(id: string): void {
    const task = this.taskRepo.findById(id);
    if (!task) throw new Error(`Task not found: ${id}`);
    this.taskRepo.update(id, { isDeleted: true, deletedAt: new Date() });
    this.eventBus.emit("task:deleted", { taskId: id });
  }

  restore(id: string): Task {
    const task = this.taskRepo.findById(id);
    if (!task) throw new Error(`Task not found: ${id}`);
    const updated = this.taskRepo.update(id, {
      isDeleted: false,
      deletedAt: null,
    });
    this.eventBus.emit("task:restored", { task: updated });
    return updated;
  }

  hardDelete(id: string): void {
    this.taskRepo.delete(id);
  }

  moveToInbox(id: string): Task {
    return this.taskRepo.update(id, {
      isInInbox: true,
      isSomeday: false,
      projectId: null,
      headingId: null,
    });
  }

  moveToSomeday(id: string): Task {
    return this.taskRepo.update(id, {
      isSomeday: true,
      isInInbox: false,
    });
  }

  moveToProject(id: string, projectId: string): Task {
    return this.taskRepo.update(id, {
      projectId,
      isInInbox: false,
      isSomeday: false,
    });
  }

  schedule(id: string, startDate: Date | null, deadline: Date | null): Task {
    return this.taskRepo.update(id, { startDate, deadline });
  }

  findById(id: string): Task | null {
    return this.taskRepo.findById(id);
  }

  findAll(): Task[] {
    return this.taskRepo.findAll();
  }
}