import { Box, Text } from "ink";
import { useAppState } from "../../state/context.js";
import { useTheme } from "../../theme/context.js";

export function InboxView() {
  const { state } = useAppState();
  const theme = useTheme();

  return (
    <Box flexDirection="column" flexGrow={1}>
      <Box backgroundColor={theme.view.groupHeaderBg} paddingX={1}>
        <Text bold color={theme.view.headerText}>
          Inbox ({state.items.length})
        </Text>
      </Box>
      {state.items.map((task, index) => (
        <Box
          key={task.id}
          paddingX={1}
          backgroundColor={
            index === state.selectedIndex ? theme.view.selectionBg : "transparent"
          }
        >
          <Text
            color={
              index === state.selectedIndex
                ? theme.view.selectionText
                : theme.view.itemText
            }
          >
            {task.isCompleted ? "✓ " : "  "}
            {task.title}
          </Text>
        </Box>
      ))}
    </Box>
  );
}