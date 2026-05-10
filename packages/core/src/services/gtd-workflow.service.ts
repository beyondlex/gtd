import type { TaskRepository, ProjectRepository } from "../storage/interfaces.js";

export interface WeeklyReviewData {
  inboxCount: number;
  staleProjects: { id: string; title: string; daysSinceUpdate: number }[];
  projectsWithoutNextAction: { id: string; title: string }[];
  overdueTasks: number;
}

export class GtdWorkflowService {
  constructor(
    private taskRepo: TaskRepository,
    private projectRepo: ProjectRepository,
  ) {}

  getWeeklyReviewData(): WeeklyReviewData {
    const inboxCount = this.taskRepo.findInbox().length;
    const activeProjects = this.projectRepo.findActive();
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const staleProjects = activeProjects
      .filter((p) => p.updatedAt < sevenDaysAgo)
      .map((p) => ({
        id: p.id,
        title: p.title,
        daysSinceUpdate: Math.floor(
          (now.getTime() - p.updatedAt.getTime()) / (24 * 60 * 60 * 1000),
        ),
      }));

    const projectsWithoutNextAction = activeProjects.filter((p) => {
      const tasks = this.taskRepo.findByProject(p.id);
      const activeTasks = tasks.filter((t) => !t.isCompleted);
      return activeTasks.length === 0;
    }).map((p) => ({ id: p.id, title: p.title }));

    const overdueTasks = this.taskRepo.findOverdue().length;

    return {
      inboxCount,
      staleProjects,
      projectsWithoutNextAction,
      overdueTasks,
    };
  }
}