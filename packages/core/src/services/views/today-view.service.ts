import type { TaskRepository } from "../../storage/interfaces.js";
import type { Task } from "../../models/types.js";
import { isOverdue, isToday } from "../../utils/date-parser.js";

export interface TodayGroup {
  label: string;
  tasks: Task[];
}

export class TodayViewService {
  constructor(private taskRepo: TaskRepository) {}

  getGroups(): TodayGroup[] {
    const overdue = this.taskRepo.findOverdue();
    const today = this.taskRepo.findToday();

    const groups: TodayGroup[] = [];

    if (overdue.length > 0) {
      groups.push({ label: "Overdue", tasks: overdue });
    }

    if (today.length > 0) {
      groups.push({ label: "Today", tasks: today });
    }

    return groups;
  }

  getTodayCount(): number {
    return this.taskRepo.findToday().length;
  }

  getOverdueCount(): number {
    return this.taskRepo.findOverdue().length;
  }
}