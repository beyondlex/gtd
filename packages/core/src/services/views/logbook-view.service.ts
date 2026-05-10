import type { TaskRepository } from "../../storage/interfaces.js";
import type { Task } from "../../models/types.js";
import { isToday, isThisWeek, formatDateFull } from "../../utils/date-parser.js";

export interface LogbookGroup {
  label: string;
  tasks: Task[];
}

export class LogbookViewService {
  constructor(private taskRepo: TaskRepository) {}

  getGroups(): LogbookGroup[] {
    const completed = this.taskRepo.findCompleted();
    const groups: Map<string, Task[]> = new Map();

    for (const task of completed) {
      if (!task.completionDate) continue;
      const key = formatDateFull(task.completionDate);
      const existing = groups.get(key) ?? [];
      existing.push(task);
      groups.set(key, existing);
    }

    return Array.from(groups.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, tasks]) => {
        const date = new Date(key);
        let label: string;
        if (isToday(date)) {
          label = "Today";
        } else if (isThisWeek(date)) {
          label = "This Week";
        } else {
          label = key;
        }
        return { label, tasks };
      });
  }
}