import { Box, Text } from "ink";
import { useAppState } from "../../state/context.js";
import { useTheme } from "../../theme/context.js";
import type { ViewType } from "@gtd/core";

const VIEW_ORDER: { key: ViewType; label: string }[] = [
  { key: "inbox", label: "Inbox" },
  { key: "today", label: "Today" },
  { key: "upcoming", label: "Upcoming" },
  { key: "anytime", label: "Anytime" },
  { key: "someday", label: "Someday" },
  { key: "logbook", label: "Logbook" },
  { key: "trash", label: "Trash" },
];

export function Sidebar() {
  const { state, dispatch } = useAppState();
  const theme = useTheme();

  return (
    <Box
      width={20}
      flexDirection="column"
      borderStyle="single"
      borderColor={theme.sidebar.background}
      backgroundColor={theme.sidebar.background}
    >
      <Box paddingX={1} paddingY={1}>
        <Text bold color={theme.sidebar.textActive}>
          GTD
        </Text>
      </Box>
      {VIEW_ORDER.map((view) => {
        const isActive = state.currentView === view.key;
        const count = state.counts[view.key];

        return (
          <Box
            key={view.key}
            paddingX={1}
            paddingY={0}
            backgroundColor={
              isActive ? theme.sidebar.activeItemBg : "transparent"
            }
          >
            <Box flexGrow={1}>
              <Text
                color={isActive ? theme.sidebar.textActive : theme.sidebar.text}
                bold={isActive}
              >
                {view.label}
              </Text>
            </Box>
            {count > 0 && (
              <Box
                backgroundColor={theme.sidebar.countBadgeBg}
                paddingX={1}
              >
                <Text color={theme.sidebar.countBadgeText}>{count}</Text>
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
}