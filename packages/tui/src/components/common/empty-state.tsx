import { Box, Text } from "ink";
import { useTheme } from "../../theme/context.js";

interface EmptyStateProps {
  message: string;
  hint?: string;
}

export function EmptyState({ message, hint }: EmptyStateProps) {
  const theme = useTheme();
  return (
    <Box flexGrow={1} flexDirection="column" justifyContent="center" alignItems="center">
      <Text color={theme.colors.textMuted}>{message}</Text>
      {hint && <Text color={theme.colors.textMuted}>{hint}</Text>}
    </Box>
  );
}