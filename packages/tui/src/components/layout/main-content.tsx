import { Box, Text } from "ink";
import { useAppState } from "../../state/context.js";
import { useTheme } from "../../theme/context.js";
import { EmptyState } from "../common/empty-state.js";
import { SearchView } from "../views/search-view.js";
import { InboxView } from "../views/inbox-view.js";
import { TodayView } from "../views/today-view.js";
import { UpcomingView } from "../views/upcoming-view.js";
import { AnytimeView } from "../views/anytime-view.js";
import { SomedayView } from "../views/someday-view.js";
import { LogbookView } from "../views/logbook-view.js";
import { TrashView } from "../views/trash-view.js";

export function MainContent() {
  const { state } = useAppState();
  const theme = useTheme();

  // Render search modal overlay
  if (state.modal?.type === "search") {
    return <SearchView />;
  }

  if (state.isLoading) {
    return (
      <Box flexGrow={1} justifyContent="center" alignItems="center">
        <Text color={theme.colors.textMuted}>Loading...</Text>
      </Box>
    );
  }

  if (state.items.length === 0 && state.currentView !== "anytime") {
    return (
      <EmptyState
        message="No items"
        hint='Press "n" to create a new task'
      />
    );
  }

  switch (state.currentView) {
    case "inbox":
      return <InboxView />;
    case "today":
      return <TodayView />;
    case "upcoming":
      return <UpcomingView />;
    case "anytime":
      return <AnytimeView />;
    case "someday":
      return <SomedayView />;
    case "logbook":
      return <LogbookView />;
    case "trash":
      return <TrashView />;
    default:
      return (
        <Box>
          <Text color={theme.colors.error}>Unknown view</Text>
        </Box>
      );
  }
}