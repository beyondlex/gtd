import { Box, Text } from "ink";
import { useTheme } from "../../theme/context.js";

export function Divider() {
  const theme = useTheme();
  return (
    <Box paddingX={1}>
      <Text color={theme.colors.textMuted}>{"─".repeat(80)}</Text>
    </Box>
  );
}