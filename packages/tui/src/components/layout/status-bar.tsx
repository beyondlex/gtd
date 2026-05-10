import { Box, Text } from "ink";
import { useAppState } from "../../state/context.js";
import { useTheme } from "../../theme/context.js";

export function StatusBar() {
  const { state } = useAppState();
  const theme = useTheme();

  const hints = state.modal
    ? "Esc: Close"
    : "j/k: Move | n: New | Space: Done | d: Delete | q: Quit | ?: Help";

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