import type { TaskRepository, ProjectRepository } from "../../storage/interfaces.js";
import type { Task, Project } from "../../models/types.js";

export interface SomedayData {
  tasks: Task[];
  projects: Project[];
}

export class SomedayViewService {
  constructor(
    private taskRepo: TaskRepository,
    private projectRepo: ProjectRepository,
  ) {}

  getData(): SomedayData {
    return {
      tasks: this.taskRepo.findSomeday(),
      projects: this.projectRepo.findActive().filter((p) => p.isDeleted === false),
    };
  }
}