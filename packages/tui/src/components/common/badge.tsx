import { Box, Text } from "ink";
import { useTheme } from "../../theme/context.js";

interface BadgeProps {
  count: number;
  variant?: "default" | "warning";
}

export function Badge({ count, variant = "default" }: BadgeProps) {
  if (count <= 0) return null;

  const theme = useTheme();
  const bg = variant === "warning" ? theme.badge.warningBg : theme.badge.background;
  const fg = variant === "warning" ? theme.badge.warningText : theme.badge.text;

  return (
    <Box backgroundColor={bg} paddingX={1}>
      <Text color={fg}>{count}</Text>
    </Box>
  );
}