import type { AppState, AppAction } from "./types.js";
import { buildAnytimeRenderPlan, findTaskInData } from "../components/views/anytime-utils.js";
import type { AnytimeRenderItem } from "../components/views/anytime-utils.js";

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "NAVIGATE_TO_VIEW":
      return {
        ...state,
        currentView: action.view,
        selectedIndex: 0,
        error: null,
        isLoading: true,
      };

    case "SELECT_ITEM": {
      const maxLen = state.renderPlanLength ?? state.items.length;
      return {
        ...state,
        selectedIndex: Math.max(0, Math.min(action.index, maxLen - 1)),
      };
    }

    case "MOVE_SELECTION_DOWN": {
      const maxLen = state.renderPlanLength ?? state.items.length;
      if (maxLen <= 0) return state;
      let next = state.selectedIndex >= maxLen - 1 ? 0 : state.selectedIndex + 1;
      if (state.currentView === "anytime" && state.anytimeData) {
        const plan = buildAnytimeRenderPlan(state.anytimeData, state.anytimeExpanded);
        next = findNextTaskIndex(plan, next, 1);
      }
      return { ...state, selectedIndex: next };
    }

    case "MOVE_SELECTION_UP": {
      const maxLen = state.renderPlanLength ?? state.items.length;
      if (maxLen <= 0) return state;
      let next = state.selectedIndex <= 0 ? maxLen - 1 : state.selectedIndex - 1;
      if (state.currentView === "anytime" && state.anytimeData) {
        const plan = buildAnytimeRenderPlan(state.anytimeData, state.anytimeExpanded);
        next = findNextTaskIndex(plan, next, -1);
      }
      return { ...state, selectedIndex: next };
    }

    case "GO_TO_TOP": {
      if (state.currentView === "anytime" && state.anytimeData) {
        const plan = buildAnytimeRenderPlan(state.anytimeData, state.anytimeExpanded);
        return { ...state, selectedIndex: findNextTaskIndex(plan, 0, 1) };
      }
      return { ...state, selectedIndex: 0 };
    }

    case "GO_TO_BOTTOM": {
      const maxLen = state.renderPlanLength ?? state.items.length;
      let next = Math.max(0, maxLen - 1);
      if (state.currentView === "anytime" && state.anytimeData) {
        const plan = buildAnytimeRenderPlan(state.anytimeData, state.anytimeExpanded);
        next = findNextTaskIndex(plan, next, -1);
      }
      return { ...state, selectedIndex: next };
    }

    case "NEXT_SECTION": {
      const next = state.sectionBoundaries.find((b) => b > state.selectedIndex);
      return {
        ...state,
        selectedIndex: next ?? state.selectedIndex,
      };
    }

    case "PREV_SECTION": {
      const reversed = [...state.sectionBoundaries].reverse();
      const prev = reversed.find((b) => b < state.selectedIndex);
      return {
        ...state,
        selectedIndex: prev ?? 0,
      };
    }

    case "SET_ITEMS": {
      const newAnytimeData = action.anytimeData !== undefined ? action.anytimeData : state.anytimeData;
      let newIndex = Math.min(state.selectedIndex, Math.max(0, (action.renderPlanLength ?? action.items.length) - 1));
      if (newAnytimeData && state.currentView === "anytime") {
        const plan = buildAnytimeRenderPlan(newAnytimeData, state.anytimeExpanded);
        newIndex = findNextTaskIndex(plan, newIndex, 1);
      }
      return {
        ...state,
        items: action.items,
        sectionBoundaries: action.sectionBoundaries,
        groupLabels: action.groupLabels ?? [],
        renderPlanLength: action.renderPlanLength ?? null,
        anytimeData: newAnytimeData,
        selectedIndex: newIndex,
        isLoading: false,
        pendingAction: null,
      };
    }

    case "SET_COUNTS":
      return { ...state, counts: action.counts };

    case "OPEN_MODAL":
      return { ...state, modal: action.modal };

    case "CLOSE_MODAL":
      return { ...state, modal: null, error: null };

    case "SET_STATUS":
      return { ...state, statusMessage: action.message };

    case "SET_ERROR":
      return { ...state, error: action.error };

    case "SET_LOADING":
      return { ...state, isLoading: action.isLoading };

    case "REFRESH_VIEW":
      return { ...state, isLoading: true, error: null };

    case "TOGGLE_COLLAPSE":
      return {
        ...state,
        anytimeExpanded: {
          ...state.anytimeExpanded,
          [action.id]: state.anytimeExpanded[action.id] === false,
        },
      };

    case "TOGGLE_COMPLETE": {
      const task = resolveSelectedTask(state);
      if (!task) return state;
      return {
        ...state,
        pendingAction: { type: "toggleComplete", taskId: task.id },
      };
    }

    case "DELETE_TASK": {
      const task = resolveSelectedTask(state);
      if (!task) return state;
      return {
        ...state,
        modal: { type: "deleteConfirm", payload: { taskId: task.id, title: task.title } },
      };
    }

    case "OPEN_ITEM": {
      const task = resolveSelectedTask(state);
      if (!task) return state;
      return {
        ...state,
        modal: { type: "editTask", payload: { taskId: task.id } },
      };
    }

    case "SET_PENDING_ACTION":
      return { ...state, pendingAction: action.payload };

    case "QUIT":
      return { ...state, shouldQuit: true };

    case "NOOP":
    default:
      return state;
  }
}

function findNextTaskIndex(
  plan: AnytimeRenderItem[],
  startIndex: number,
  direction: 1 | -1,
): number {
  const len = plan.length;
  if (len === 0) return startIndex;
  let idx = startIndex;
  for (let i = 0; i < len; i++) {
    if (plan[idx]?.type === "task") return idx;
    idx = (idx + direction + len) % len;
  }
  return startIndex;
}

function resolveSelectedTask(state: AppState): import("@gtd/core").Task | undefined {
  if (state.currentView === "anytime" && state.anytimeData) {
    const plan = buildAnytimeRenderPlan(state.anytimeData, state.anytimeExpanded);
    const item = plan[state.selectedIndex];
    if (item && item.type === "task") {
      return findTaskInData(state.anytimeData, item.id);
    }
    return undefined;
  }
  return state.items[state.selectedIndex];
}