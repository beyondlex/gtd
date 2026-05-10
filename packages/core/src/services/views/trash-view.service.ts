import type { TaskRepository } from "../../storage/interfaces.js";
import type { Task } from "../../models/types.js";

export interface TrashItem {
  task: Task;
  deletedAt: Date;
}

export class TrashViewService {
  constructor(private taskRepo: TaskRepository) {}

  getTrashedItems(): TrashItem[] {
    return this.taskRepo
      .findDeleted()
      .filter((t) => t.deletedAt)
      .map((task) => ({
        task,
        deletedAt: task.deletedAt!,
      }))
      .sort((a, b) => b.deletedAt.getTime() - a.deletedAt.getTime());
  }

  getTrashCount(): number {
    return this.taskRepo.findDeleted().length;
  }
}