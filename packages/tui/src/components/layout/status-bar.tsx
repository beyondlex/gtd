import { Box, Text } from "ink";
import { useAppState } from "../../state/context.js";
import { useTheme } from "../../theme/context.js";

export function StatusBar() {
  const { state } = useAppState();
  const theme = useTheme();

  const hints = getHints(state);

  return (
    <Box
      height={1}
      backgroundColor={theme.statusBar.background}
      paddingX={1}
    >
      <Box flexGrow={1}>
        <Text color={theme.statusBar.text}>
          {state.statusMessage ?? hints}
        </Text>
      </Box>
      <Text color={theme.statusBar.modeText}>
        {state.currentView}
      </Text>
    </Box>
  );
}

function getHints(state: import("../../state/types.js").AppState): string {
  if (state.modal) {
    if (state.modal.type === "search") {
      return "Esc: Close | j/k: Navigate | Enter: Select";
    }
    return "Esc: Close";
  }

  switch (state.currentView) {
    case "anytime":
      return "j/k: Move | h: Toggle collapse | n: New | Space: Done | d: Delete | q: Quit | ?: Help";
    case "inbox":
    case "today":
    case "upcoming":
    case "someday":
      return "j/k: Move | n: New | Space: Done | d: Delete | q: Quit | ?: Help";
    case "logbook":
    case "trash":
      return "j/k: Move | q: Quit | ?: Help";
    default:
      return "j/k: Move | n: New | Space: Done | d: Delete | q: Quit | ?: Help";
  }
}