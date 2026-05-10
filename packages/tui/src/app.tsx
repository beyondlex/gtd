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
import { buildAnytimeRenderPlan, getSectionBoundaries } from "./components/views/anytime-utils.js";
import type { ViewType, Task, AnytimeData } from "@gtd/core";

const keybindings = loadKeybindings();

interface ViewData {
  items: Task[];
  boundaries: number[];
  groupLabels?: string[];
  renderPlanLength?: number;
  anytimeData?: AnytimeData | null;
}

function AppInner() {
  const { state, dispatch } = useAppState();
  const services = useServices();

  const context = state.modal
    ? state.modal.type === "search"
      ? "search"
      : "modal"
    : "global";
  useKeybindings(keybindings, dispatch, context);

  useEffect(() => {
    if (state.shouldQuit) {
      process.exit(0);
    }
  }, [state.shouldQuit]);

  // Main data fetching effect
  useEffect(() => {
    if (!state.isLoading) return;

    try {
      const data = fetchViewData(state.currentView, services);
      dispatch({
        type: "SET_ITEMS",
        items: data.items,
        sectionBoundaries: data.boundaries,
        groupLabels: data.groupLabels,
        renderPlanLength: data.renderPlanLength,
        anytimeData: data.anytimeData,
      });

      const counts = fetchAllCounts(services);
      dispatch({ type: "SET_COUNTS", counts });
    } catch (error) {
      dispatch({
        type: "SET_STATUS",
        message: `Error loading ${state.currentView}: ${(error as Error).message}`,
      });
    }
  }, [state.currentView, state.isLoading, services, dispatch]);

  // Recompute anytime render plan when collapse state changes
  useEffect(() => {
    if (state.currentView !== "anytime" || !state.anytimeData) return;

    const plan = buildAnytimeRenderPlan(state.anytimeData, state.anytimeExpanded);
    const { boundaries, labels } = getSectionBoundaries(plan);

    dispatch({
      type: "SET_ITEMS",
      items: [],
      sectionBoundaries: boundaries,
      groupLabels: labels,
      renderPlanLength: plan.length,
      anytimeData: state.anytimeData,
    });
  }, [state.anytimeData, state.anytimeExpanded, state.currentView, dispatch]);

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
): ViewData {
  switch (view) {
    case "inbox": {
      const items = svc.inboxService.getInboxItems();
      return { items, boundaries: [0], groupLabels: ["Inbox"] };
    }
    case "today": {
      const groups = svc.todayView.getGroups();
      const items = groups.flatMap((g) => g.tasks);
      const boundaries = buildBoundaries(groups.map((g) => g.tasks.length));
      const groupLabels = groups.map((g) => g.label);
      return { items, boundaries, groupLabels };
    }
    case "upcoming": {
      const groups = svc.upcomingView.getGroups();
      const items = groups.flatMap((g) => g.tasks);
      const boundaries = buildBoundaries(groups.map((g) => g.tasks.length));
      const groupLabels = groups.map((g) => g.label);
      return { items, boundaries, groupLabels };
    }
    case "anytime": {
      const data = svc.anytimeView.getData();
      const plan = buildAnytimeRenderPlan(data, {});
      const { boundaries, labels } = getSectionBoundaries(plan);
      return {
        items: [],
        boundaries,
        groupLabels: labels,
        renderPlanLength: plan.length,
        anytimeData: data,
      };
    }
    case "someday": {
      const data = svc.somedayView.getData();
      const items = data.tasks;
      const hasProjects = data.projects.length > 0;
      const boundaries = hasProjects ? [0, items.length] : [0];
      const groupLabels = hasProjects ? ["Tasks", "Projects"] : ["Someday"];
      return {
        items,
        boundaries,
        groupLabels,
        renderPlanLength: hasProjects ? items.length + data.projects.length : items.length,
      };
    }
    case "logbook": {
      const groups = svc.logbookView.getGroups();
      const items = groups.flatMap((g) => g.tasks);
      const boundaries = buildBoundaries(groups.map((g) => g.tasks.length));
      const groupLabels = groups.map((g) => g.label);
      return { items, boundaries, groupLabels };
    }
    case "trash": {
      const trash = svc.trashView.getTrashedItems();
      const items = trash.map((t) => t.task);
      return { items, boundaries: [0], groupLabels: ["Trash"] };
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