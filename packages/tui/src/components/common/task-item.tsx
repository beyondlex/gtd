import { Box, Text } from "ink";
import { useTheme } from "../../theme/context.js";
import type { Task } from "@gtd/core";

interface TaskItemProps {
  task: Task;
  isSelected: boolean;
  showProject?: boolean;
  showDeadline?: boolean;
  showArea?: boolean;
  showDeletedAt?: boolean;
  projectTitle?: string;
  depth?: number;
}

export function TaskItem({
  task,
  isSelected,
  showProject,
  showDeadline,
  showArea,
  showDeletedAt,
  projectTitle,
  depth = 0,
}: TaskItemProps) {
  const theme = useTheme();

  const indent = depth > 0 ? "  ".repeat(depth) : "";
  const checkbox = task.isCompleted ? "✓" : " ";
  const isOverdue =
    task.deadline && !task.isCompleted && task.deadline < new Date();

  const titleColor = task.isCompleted
    ? theme.view.itemTextCompleted
    : isSelected
      ? theme.view.selectionText
      : isOverdue
        ? theme.view.itemTextDeadline
        : theme.view.itemText;

  return (
    <Box
      paddingX={1}
      backgroundColor={isSelected ? theme.view.selectionBg : "transparent"}
    >
      <Box flexGrow={1}>
        <Text color={titleColor} strikethrough={task.isCompleted}>
          {indent}[{checkbox}] {task.title}
        </Text>
        {showProject && projectTitle && (
          <Text color={theme.view.itemTextProject}> • {projectTitle}</Text>
        )}
        {showArea && task.areaId && (
          <Text color={theme.view.itemTextProject}> • area</Text>
        )}
      </Box>
      {showDeadline && task.deadline && !task.isCompleted && (
        <Text color={isOverdue ? theme.view.itemTextDeadline : theme.colors.textMuted}>
          {formatShortDate(task.deadline)}
        </Text>
      )}
      {showDeletedAt && task.deletedAt && (
        <Text color={theme.colors.textMuted}>
          {formatShortDate(task.deletedAt)}
        </Text>
      )}
    </Box>
  );
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatShortDate(date: Date): string {
  return `${MONTHS[date.getMonth()]} ${date.getDate()}`;
}