import { Box, Text } from "ink";
import { useTheme } from "../../theme/context.js";
import { TaskItem } from "./task-item.js";
import type { Task } from "@gtd/core";

interface TaskListProps {
  items: Task[];
  selectedIndex: number;
  sectionBoundaries: number[];
  groupLabels: string[];
  showProject?: boolean;
  showDeadline?: boolean;
  showArea?: boolean;
  showDeletedAt?: boolean;
  getProjectTitle?: (task: Task) => string | undefined;
  emptyMessage?: string;
  emptyHint?: string;
}

export function TaskList({
  items,
  selectedIndex,
  sectionBoundaries,
  groupLabels,
  showProject,
  showDeadline,
  showArea,
  showDeletedAt,
  getProjectTitle,
  emptyMessage,
  emptyHint,
}: TaskListProps) {
  const theme = useTheme();

  if (items.length === 0) {
    return (
      <Box flexGrow={1} flexDirection="column" justifyContent="center" alignItems="center">
        <Text color={theme.colors.textMuted}>{emptyMessage ?? "No items"}</Text>
        {emptyHint && <Text color={theme.colors.textMuted}>{emptyHint}</Text>}
      </Box>
    );
  }

  const rows: React.ReactNode[] = [];

  // Build a set of boundary indices for quick lookup
  const boundarySet = new Set(sectionBoundaries);

  for (let i = 0; i < items.length; i++) {
    // Render section header if this index is a boundary
    if (boundarySet.has(i)) {
      const labelIdx = sectionBoundaries.indexOf(i);
      const label = groupLabels[labelIdx] ?? "";

      // Count items in this section
      const nextBoundary =
        labelIdx + 1 < sectionBoundaries.length
          ? sectionBoundaries[labelIdx + 1]
          : items.length;
      const sectionCount = nextBoundary - i;

      rows.push(
        <Box key={`header-${i}`} backgroundColor={theme.view.groupHeaderBg} paddingX={1}>
          <Text bold color={theme.view.groupHeader}>
            {label} ({sectionCount})
          </Text>
        </Box>,
      );
    }

    const task = items[i];
    const projectTitle = getProjectTitle?.(task);

    rows.push(
      <TaskItem
        key={task.id}
        task={task}
        isSelected={i === selectedIndex}
        showProject={showProject}
        showDeadline={showDeadline}
        showArea={showArea}
        showDeletedAt={showDeletedAt}
        projectTitle={projectTitle}
      />,
    );
  }

  return <Box flexDirection="column" flexGrow={1}>{rows}</Box>;
}