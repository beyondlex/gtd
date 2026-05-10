import type { AreaRepository, ProjectRepository, TaskRepository } from "../storage/interfaces.js";
import type { EventBus } from "../events/event-bus.js";
import type { Area } from "../models/types.js";
import type { CreateAreaInput, UpdateAreaInput } from "../models/validation.js";
import { createAreaSchema, updateAreaSchema } from "../models/validation.js";
import { generateId } from "../utils/id.js";

export interface AreaTree {
  area: Area;
  projects: { project: import("../models/types.js").Project; tasks: import("../models/types.js").Task[] }[];
  tasks: import("../models/types.js").Task[];
}

export class AreaService {
  constructor(
    private areaRepo: AreaRepository,
    private projectRepo: ProjectRepository,
    private taskRepo: TaskRepository,
    private eventBus: EventBus,
  ) {}

  create(input: CreateAreaInput): Area {
    const valid = createAreaSchema.parse(input);
    const now = new Date();
    const area: Area = {
      id: generateId(),
      title: valid.title,
      sortOrder: valid.sortOrder ?? 0,
      createdAt: now,
      updatedAt: now,
    };
    this.areaRepo.create(area);
    this.eventBus.emit("area:created", { area });
    return area;
  }

  update(id: string, changes: UpdateAreaInput): Area {
    const valid = updateAreaSchema.parse(changes);
    const updated = this.areaRepo.update(id, valid);
    this.eventBus.emit("area:updated", { area: updated });
    return updated;
  }

  delete(id: string): void {
    this.areaRepo.delete(id);
    this.eventBus.emit("area:deleted", { areaId: id });
  }

  findById(id: string): Area | null {
    return this.areaRepo.findById(id);
  }

  findAll(): Area[] {
    return this.areaRepo.findAll();
  }

  getTree(): AreaTree[] {
    const areas = this.areaRepo.findAll();
    return areas.map((area) => {
      const projects = this.projectRepo.findByArea(area.id).filter((p) => !p.isDeleted);
      return {
        area,
        projects: projects.map((project) => ({
          project,
          tasks: this.taskRepo.findByProject(project.id).filter((t) => !t.isDeleted && !t.isCompleted),
        })),
        tasks: this.taskRepo.findByArea(area.id).filter(
          (t) => !t.isDeleted && !t.isCompleted && !t.projectId,
        ),
      };
    });
  }
}