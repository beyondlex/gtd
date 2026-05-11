import { useCallback } from "react";
import { useInput, Box, Text } from "ink";
import { useAppState } from "../../state/context.js";
import { useTheme } from "../../theme/context.js";
import { buildAnytimeRenderPlan, findTaskInData } from "./anytime-utils.js";

export function AnytimeView() {
  const { state, dispatch } = useAppState();
  const theme = useTheme();

  useInput(
    useCallback(
      (input) => {
        if (input === "h" || input === "H") {
          const currentPlan = buildAnytimeRenderPlan(
            state.anytimeData!,
            state.anytimeExpanded,
          );
          const item = currentPlan[state.selectedIndex];
          if (item) {
            // If on a header, toggle directly; if on a task, find the nearest parent header
            let targetId: string | null = null;
            if (
              item.type === "areaHeader" ||
              item.type === "projectHeader" ||
              item.type === "ungroupedHeader"
            ) {
              targetId = item.id;
            } else if (item.type === "task") {
              for (let i = state.selectedIndex - 1; i >= 0; i--) {
                const prev = currentPlan[i];
                if (
                  prev.type === "areaHeader" ||
                  prev.type === "projectHeader" ||
                  prev.type === "ungroupedHeader"
                ) {
                  targetId = prev.id;
                  break;
                }
              }
            }
            if (targetId) {
              dispatch({ type: "TOGGLE_COLLAPSE", id: targetId });
            }
          }
        }
      },
      [state.anytimeData, state.anytimeExpanded, state.selectedIndex, dispatch],
    ),
  );

  const data = state.anytimeData;
  if (!data) {
    return null;
  }

  const plan = buildAnytimeRenderPlan(data, state.anytimeExpanded);

  if (plan.length === 0) {
    return (
      <Box flexGrow={1} flexDirection="column" justifyContent="center" alignItems="center">
        <Text color={theme.colors.textMuted}>No tasks</Text>
        <Text color={theme.colors.textMuted}>
          Press "n" to create a new task
        </Text>
      </Box>
    );
  }

  const rows = plan.map((item, index) => {
    const isSelected = index === state.selectedIndex;
    const bgColor = isSelected ? theme.view.selectionBg : "transparent";

    switch (item.type) {
      case "areaHeader":
      case "ungroupedHeader": {
        const toggleIcon = item.isCollapsed ? "▶" : "▼";
        return (
          <Box
            key={item.id}
            backgroundColor={theme.view.groupHeaderBg}
            paddingX={1}
          >
            <Text bold color={theme.view.groupHeader}>
              {toggleIcon} {item.label}
            </Text>
          </Box>
        );
      }

      case "projectHeader": {
        const indent = "  ".repeat(item.depth);
        const toggleIcon = item.isCollapsed ? "▶" : "▼";
        return (
          <Box
            key={item.id}
            paddingX={1}
            backgroundColor={bgColor}
          >
            <Text
              color={isSelected ? theme.view.selectionText : theme.view.itemText}
            >
              {indent}{toggleIcon} {item.label}
            </Text>
          </Box>
        );
      }

      case "task": {
        const indent = "  ".repeat(item.depth);
        const task = findTaskInData(data, item.id);
        if (!task) return null;

        const checkbox = task.isCompleted ? "✓" : " ";
        const titleColor = task.isCompleted
          ? theme.view.itemTextCompleted
          : isSelected
            ? theme.view.selectionText
            : theme.view.itemText;

        return (
          <Box
            key={task.id}
            paddingX={1}
            backgroundColor={bgColor}
          >
            <Box flexGrow={1}>
              <Text color={titleColor} strikethrough={task.isCompleted}>
                {indent}[{checkbox}] {task.title}
              </Text>
            </Box>
          </Box>
        );
      }

      default:
        return null;
    }
  });

  return <Box flexDirection="column" flexGrow={1}>{rows}</Box>;
}