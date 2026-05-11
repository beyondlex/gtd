import type { AnytimeData, Task } from "@gtd/core";

export interface AnytimeRenderItem {
  type: "areaHeader" | "projectHeader" | "task" | "ungroupedHeader";
  id: string;
  label?: string;
  depth: number;
  isCollapsed?: boolean;
}

export function buildAnytimeRenderPlan(
  data: AnytimeData,
  expanded: Record<string, boolean>,
): AnytimeRenderItem[] {
  const plan: AnytimeRenderItem[] = [];

  for (const areaGroup of data.areaGroups) {
    const areaExpanded = expanded[areaGroup.area.id] !== false;
    plan.push({
      type: "areaHeader",
      id: areaGroup.area.id,
      label: areaGroup.area.title,
      depth: 0,
      isCollapsed: !areaExpanded,
    });

    if (areaExpanded) {
      for (const task of areaGroup.tasks) {
        plan.push({ type: "task", id: task.id, depth: 1 });
      }

      for (const projectGroup of areaGroup.projects) {
        const projectExpanded = expanded[projectGroup.project.id] !== false;
        plan.push({
          type: "projectHeader",
          id: projectGroup.project.id,
          label: projectGroup.project.title,
          depth: 1,
          isCollapsed: !projectExpanded,
        });

        if (projectExpanded) {
          for (const task of projectGroup.tasks) {
            plan.push({ type: "task", id: task.id, depth: 2 });
          }
        }
      }
    }
  }

  if (data.ungrouped.tasks.length > 0) {
    plan.push({
      type: "ungroupedHeader",
      id: "ungrouped",
      label: data.ungrouped.label,
      depth: 0,
    });

    const ungroupedExpanded = expanded["ungrouped"] !== false;
    if (ungroupedExpanded) {
      for (const task of data.ungrouped.tasks) {
        plan.push({ type: "task", id: task.id, depth: 1 });
      }
    }
  }

  return plan;
}

export function getSectionBoundaries(plan: AnytimeRenderItem[]): {
  boundaries: number[];
  labels: string[];
} {
  const boundaries: number[] = [];
  const labels: string[] = [];

  for (let i = 0; i < plan.length; i++) {
    const item = plan[i];
    if (item.type === "areaHeader" || item.type === "ungroupedHeader") {
      boundaries.push(i);
      labels.push(item.label ?? "");
    }
  }

  return { boundaries, labels };
}

export function findTaskInData(
  data: AnytimeData,
  taskId: string,
): Task | undefined {
  for (const ag of data.areaGroups) {
    const found = ag.tasks.find((t) => t.id === taskId);
    if (found) return found;
    for (const pg of ag.projects) {
      const found2 = pg.tasks.find((t) => t.id === taskId);
      if (found2) return found2;
    }
  }
  return data.ungrouped.tasks.find((t) => t.id === taskId);
}