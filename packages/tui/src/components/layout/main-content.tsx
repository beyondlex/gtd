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
import { QuickCapture } from "../modals/quick-capture.js";
import { TaskDetail } from "../modals/task-detail.js";
import { ConfirmDialog } from "../modals/confirm-dialog.js";
import { HelpOverlay } from "../modals/help-overlay.js";

export function MainContent() {
  const { state } = useAppState();
  const theme = useTheme();

  // Render modal overlays
  if (state.modal) {
    switch (state.modal.type) {
      case "search":
        return <SearchView />;
      case "newTask":
        return <QuickCapture />;
      case "editTask":
        return <TaskDetail taskId={state.modal.payload.taskId} />;
      case "deleteConfirm":
        return <ConfirmDialog taskId={state.modal.payload.taskId} title={state.modal.payload.title} />;
      case "help":
        return <HelpOverlay />;
    }
  }

  // Priority: loading -> empty -> normal view
  if (state.isLoading) {
    return (
      <Box flexGrow={1} justifyContent="center" alignItems="center">
        <Text color={theme.colors.textMuted}>Loading…</Text>
      </Box>
    );
  }

  const shouldShowEmptyState = state.items.length === 0 && state.currentView !== "anytime";

  if (shouldShowEmptyState) {
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
