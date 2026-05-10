import { useEffect } from "react";
import { Box } from "ink";
import { AppStateProvider, useAppState } from "./state/context.js";
import { ThemeProvider } from "./theme/context.js";
import { ServicesProvider, useServices } from "./services/service-context.js";
import { loadKeybindings } from "./keybindings/load.js";
import { useKeybindings } from "./keybindings/useKeybindings.js";
import { Sidebar } from "./components/layout/sidebar.js";
import { MainContent } from "./components/layout/main-content.js";
import { StatusBar } from "./components/layout/status-bar.js";
import type { ViewType, Task } from "@gtd/core";

const keybindings = loadKeybindings();

function AppInner() {
  const { state, dispatch } = useAppState();
  const services = useServices();

  useKeybindings(keybindings, dispatch, state.modal ? "modal" : "global");

  useEffect(() => {
    if (state.shouldQuit) {
      process.exit(0);
    }
  }, [state.shouldQuit]);

  useEffect(() => {
    if (!state.isLoading) return;

    try {
      const { items, boundaries } = fetchViewData(state.currentView, services);
      dispatch({ type: "SET_ITEMS", items, sectionBoundaries: boundaries });

      const counts = fetchAllCounts(services);
      dispatch({ type: "SET_COUNTS", counts });
    } catch (error) {
      dispatch({
        type: "SET_STATUS",
        message: `Error loading ${state.currentView}: ${(error as Error).message}`,
      });
    }
  }, [state.currentView, state.isLoading, services, dispatch]);

  return (
    <Box flexDirection="row" height="100%">
      <Sidebar />
      <Box flexDirection="column" flexGrow={1}>
        <Box flexGrow={1}>
          <MainContent />
        </Box>
        <StatusBar />
      </Box>
    </Box>
  );
}

export function App() {
  return (
    <ServicesProvider>
      <ThemeProvider>
        <AppStateProvider>
          <AppInner />
        </AppStateProvider>
      </ThemeProvider>
    </ServicesProvider>
  );
}

function buildBoundaries(groupLengths: number[]): number[] {
  const boundaries: number[] = [];
  let offset = 0;
  for (const len of groupLengths) {
    boundaries.push(offset);
    offset += len;
  }
  return boundaries;
}

function fetchViewData(
  view: ViewType,
  svc: ReturnType<typeof useServices>,
): { items: Task[]; boundaries: number[] } {
  switch (view) {
    case "inbox":
      return { items: svc.inboxService.getInboxItems(), boundaries: [0] };
    case "today": {
      const groups = svc.todayView.getGroups();
      const items = groups.flatMap((g) => g.tasks);
      const boundaries = buildBoundaries(groups.map((g) => g.tasks.length));
      return { items, boundaries };
    }
    case "upcoming": {
      const groups = svc.upcomingView.getGroups();
      const items = groups.flatMap((g) => g.tasks);
      const boundaries = buildBoundaries(groups.map((g) => g.tasks.length));
      return { items, boundaries };
    }
    case "anytime": {
      const data = svc.anytimeView.getData();
      const items = [
        ...data.ungrouped.tasks,
        ...data.areaGroups.flatMap((ag) => [
          ...ag.tasks,
          ...ag.projects.flatMap((pg) => pg.tasks),
        ]),
      ];
      return { items, boundaries: [0] };
    }
    case "someday": {
      const data = svc.somedayView.getData();
      return { items: data.tasks, boundaries: [0] };
    }
    case "logbook": {
      const groups = svc.logbookView.getGroups();
      const items = groups.flatMap((g) => g.tasks);
      const boundaries = buildBoundaries(groups.map((g) => g.tasks.length));
      return { items, boundaries };
    }
    case "trash": {
      const trash = svc.trashView.getTrashedItems();
      return {
        items: trash.map((t) => t.task),
        boundaries: [0],
      };
    }
  }
}

function fetchAllCounts(
  svc: ReturnType<typeof useServices>,
): Record<ViewType, number> {
  return {
    inbox: svc.inboxService.getInboxCount(),
    today: svc.todayView.getTodayCount(),
    upcoming: 0,
    anytime: 0,
    someday: svc.somedayView.getData().tasks.length,
    logbook: 0,
    trash: svc.trashView.getTrashCount(),
  };
}