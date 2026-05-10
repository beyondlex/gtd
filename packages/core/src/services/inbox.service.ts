import type { TaskRepository } from "../storage/interfaces.js";
import type { EventBus } from "../events/event-bus.js";
import type { Task } from "../models/types.js";

export interface ProcessInboxAction {
  type: "delete" | "someday" | "trash";
}

export interface ProcessInboxMoveAction {
  type: "move";
  projectId?: string | null;
  areaId?: string | null;
}

export type InboxAction = ProcessInboxAction | ProcessInboxMoveAction;

export class InboxService {
  constructor(
    private taskRepo: TaskRepository,
    private eventBus: EventBus,
  ) {}

  getInboxItems(): Task[] {
    return this.taskRepo.findInbox();
  }

  getInboxCount(): number {
    return this.getInboxItems().length;
  }

  processItem(taskId: string, action: InboxAction): Task {
    const task = this.taskRepo.findById(taskId);
    if (!task) throw new Error(`Task not found: ${taskId}`);

    switch (action.type) {
      case "delete":
        this.taskRepo.update(taskId, { isDeleted: true, deletedAt: new Date() });
        this.eventBus.emit("task:deleted", { taskId });
        return this.taskRepo.findById(taskId)!;
      case "someday":
        return this.taskRepo.update(taskId, {
          isInInbox: false,
          isSomeday: true,
        });
      case "trash":
        this.taskRepo.update(taskId, { isDeleted: true, deletedAt: new Date() });
        this.eventBus.emit("task:deleted", { taskId });
        return this.taskRepo.findById(taskId)!;
      case "move":
        return this.taskRepo.update(taskId, {
          isInInbox: false,
          projectId: action.projectId ?? null,
          areaId: action.areaId ?? null,
        });
    }
  }

  clearInbox(): number {
    const items = this.getInboxItems();
    for (const item of items) {
      this.taskRepo.update(item.id, { isDeleted: true, deletedAt: new Date() });
      this.eventBus.emit("task:deleted", { taskId: item.id });
    }
    return items.length;
  }
}