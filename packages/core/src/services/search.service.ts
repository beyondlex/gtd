import type { TaskRepository } from "../storage/interfaces.js";
import type { Task } from "../models/types.js";

export interface SearchResult {
  task: Task;
  matchField: "title" | "notes";
  snippet: string;
}

export class SearchService {
  constructor(private taskRepo: TaskRepository) {}

  search(query: string): SearchResult[] {
    if (!query.trim()) return [];

    const tasks = this.taskRepo.search(query.trim());
    const lowerQuery = query.toLowerCase();

    return tasks.map((task) => {
      const titleMatch = task.title.toLowerCase().includes(lowerQuery);
      return {
        task,
        matchField: titleMatch ? "title" : "notes",
        snippet: titleMatch
          ? task.title
          : task.notes.length > 80
            ? task.notes.slice(0, 80) + "..."
            : task.notes,
      };
    });
  }
}