import type { ProjectRepository, TaskRepository } from "../storage/interfaces.js";
import type { EventBus } from "../events/event-bus.js";
import type { Project } from "../models/types.js";
import type { CreateProjectInput, UpdateProjectInput } from "../models/validation.js";
import { createProjectSchema, updateProjectSchema } from "../models/validation.js";
import { generateId } from "../utils/id.js";

export class ProjectService {
  constructor(
    private projectRepo: ProjectRepository,
    private taskRepo: TaskRepository,
    private eventBus: EventBus,
  ) {}

  create(input: CreateProjectInput): Project {
    const valid = createProjectSchema.parse(input);
    const now = new Date();
    const project: Project = {
      id: generateId(),
      title: valid.title,
      areaId: valid.areaId ?? null,
      isCompleted: false,
      isCanceled: false,
      isDeleted: false,
      deadline: valid.deadline ?? null,
      sortOrder: valid.sortOrder ?? 0,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
    this.projectRepo.create(project);
    this.eventBus.emit("project:created", { project });
    return project;
  }

  update(id: string, changes: UpdateProjectInput): Project {
    const valid = updateProjectSchema.parse(changes);
    const updated = this.projectRepo.update(id, valid);
    this.eventBus.emit("project:updated", { project: updated });
    return updated;
  }

  complete(id: string, completeTasks = false): Project {
    const project = this.projectRepo.findById(id);
    if (!project) throw new Error(`Project not found: ${id}`);

    if (completeTasks) {
      const tasks = this.taskRepo.findByProject(id);
      for (const task of tasks) {
        if (!task.isCompleted) {
          this.taskRepo.update(task.id, {
            isCompleted: true,
            completionDate: new Date(),
          });
        }
      }
    }

    const updated = this.projectRepo.update(id, {
      isCompleted: true,
    });
    this.eventBus.emit("project:completed", { projectId: id });
    return updated;
  }

  cancel(id: string, moveTasksToInbox = false): Project {
    if (moveTasksToInbox) {
      const tasks = this.taskRepo.findByProject(id);
      for (const task of tasks) {
        this.taskRepo.update(task.id, {
          isInInbox: true,
          projectId: null,
          headingId: null,
        });
      }
    }

    return this.projectRepo.update(id, {
      isCanceled: true,
    });
  }

  delete(id: string): void {
    this.projectRepo.update(id, { isDeleted: true, deletedAt: new Date() });
    this.eventBus.emit("project:deleted", { projectId: id });
  }

  getProgress(id: string): { completed: number; total: number } {
    const tasks = this.taskRepo.findByProject(id);
    const total = tasks.length;
    const completed = tasks.filter((t) => t.isCompleted).length;
    return { completed, total };
  }

  findById(id: string): Project | null {
    return this.projectRepo.findById(id);
  }

  findActive(): Project[] {
    return this.projectRepo.findActive();
  }

  findByArea(areaId: string): Project[] {
    return this.projectRepo.findByArea(areaId);
  }
}