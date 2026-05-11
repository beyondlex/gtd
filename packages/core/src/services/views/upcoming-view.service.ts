import type { TaskRepository } from "../../storage/interfaces.js";
import type { Task } from "../../models/types.js";
import { formatDate, formatDateFull, addDays, startOfDay } from "../../utils/date-parser.js";

export interface UpcomingDayGroup {
  date: Date;
  label: string;
  tasks: Task[];
}

export class UpcomingViewService {
  constructor(private taskRepo: TaskRepository) {}

  getGroups(days = 30): UpcomingDayGroup[] {
    const tasks = this.taskRepo.findUpcoming(days);
    const groups: Map<string, { date: Date; tasks: Task[] }> = new Map();

    for (const task of tasks) {
      const key = task.deadline
        ? formatDateFull(task.deadline)
        : task.startDate
          ? formatDateFull(task.startDate)
          : null;
      if (!key) continue;

      const date = task.deadline ?? task.startDate!;
      if (!groups.has(key)) {
        groups.set(key, { date, tasks: [] });
      }
      groups.get(key)!.tasks.push(task);
    }

    return Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, group]) => ({
        date: group.date,
        label: formatDate(group.date),
        tasks: group.tasks,
      }));
  }

  getUpcomingCount(days = 30): number {
    return this.taskRepo.findUpcoming(days).length;
  }
}