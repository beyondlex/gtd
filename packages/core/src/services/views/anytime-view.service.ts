import type { TaskRepository, ProjectRepository, AreaRepository } from "../../storage/interfaces.js";
import type { Task, Project, Area } from "../../models/types.js";

export interface ProjectGroup {
  project: Project;
  area: Area | null;
  tasks: Task[];
}

export interface AreaGroup {
  area: Area;
  projects: ProjectGroup[];
  tasks: Task[];
}

export interface UngroupedSection {
  label: string;
  tasks: Task[];
}

export interface AnytimeData {
  areaGroups: AreaGroup[];
  ungrouped: UngroupedSection;
}

export class AnytimeViewService {
  constructor(
    private taskRepo: TaskRepository,
    private projectRepo: ProjectRepository,
    private areaRepo: AreaRepository,
  ) {}

  getData(): AnytimeData {
    const tasks = this.taskRepo.findAnytime();
    const activeProjects = this.projectRepo.findActive();

    // Tasks grouped by project
    const projectTasks = new Map<string, Task[]>();
    const ungroupedTasks: Task[] = [];

    for (const task of tasks) {
      if (task.projectId) {
        const existing = projectTasks.get(task.projectId) ?? [];
        existing.push(task);
        projectTasks.set(task.projectId, existing);
      } else {
        ungroupedTasks.push(task);
      }
    }

    // Build area groups
    const areas = this.areaRepo.findAll();
    const areaGroups: AreaGroup[] = [];

    for (const area of areas) {
      const areaProjects = activeProjects.filter((p) => p.areaId === area.id);
      const projects: ProjectGroup[] = areaProjects.map((project) => ({
        project,
        area,
        tasks: projectTasks.get(project.id) ?? [],
      }));
      const areaStandaloneTasks = ungroupedTasks.filter((t) => t.areaId === area.id);

      if (projects.length > 0 || areaStandaloneTasks.length > 0) {
        areaGroups.push({
          area,
          projects,
          tasks: areaStandaloneTasks,
        });
      }
    }

    // Ungrouped projects (no area)
    const ungroupedProjects = activeProjects.filter((p) => !p.areaId);
    const ungroupedProjectTasks: Task[] = [];
    for (const project of ungroupedProjects) {
      ungroupedProjectTasks.push(...(projectTasks.get(project.id) ?? []));
    }

    // Ungrouped tasks (no project, no area)
    const trulyUngrouped = ungroupedTasks.filter((t) => !t.areaId);

    return {
      areaGroups,
      ungrouped: {
        label: "No Project",
        tasks: [...ungroupedProjectTasks, ...trulyUngrouped],
      },
    };
  }

  getCount(): number {
    return this.taskRepo.findAnytime().length;
  }
}