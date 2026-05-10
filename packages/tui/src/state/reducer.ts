import type { AppState, AppAction } from "./types.js";

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "NAVIGATE_TO_VIEW":
      return {
        ...state,
        currentView: action.view,
        selectedIndex: 0,
        items: [],
        sectionBoundaries: [],
        groupLabels: [],
        renderPlanLength: null,
        anytimeData: null,
        anytimeExpanded: {},
        statusMessage: null,
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
      return {
        ...state,
        selectedIndex: Math.min(state.selectedIndex + 1, Math.max(0, maxLen - 1)),
      };
    }

    case "MOVE_SELECTION_UP":
      return {
        ...state,
        selectedIndex: Math.max(state.selectedIndex - 1, 0),
      };

    case "GO_TO_TOP":
      return { ...state, selectedIndex: 0 };

    case "GO_TO_BOTTOM": {
      const maxLen = state.renderPlanLength ?? state.items.length;
      return {
        ...state,
        selectedIndex: Math.max(0, maxLen - 1),
      };
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

    case "SET_ITEMS":
      return {
        ...state,
        items: action.items,
        sectionBoundaries: action.sectionBoundaries,
        groupLabels: action.groupLabels ?? [],
        renderPlanLength: action.renderPlanLength ?? null,
        anytimeData: action.anytimeData !== undefined ? action.anytimeData : state.anytimeData,
        selectedIndex: Math.min(state.selectedIndex, Math.max(0, (action.renderPlanLength ?? action.items.length) - 1)),
        isLoading: false,
        pendingAction: null,
      };

    case "SET_COUNTS":
      return { ...state, counts: action.counts };

    case "OPEN_MODAL":
      return { ...state, modal: action.modal };

    case "CLOSE_MODAL":
      return { ...state, modal: null };

    case "SET_STATUS":
      return { ...state, statusMessage: action.message };

    case "SET_LOADING":
      return { ...state, isLoading: action.isLoading };

    case "REFRESH_VIEW":
      return { ...state, isLoading: true };

    case "TOGGLE_COLLAPSE":
      return {
        ...state,
        anytimeExpanded: {
          ...state.anytimeExpanded,
          [action.id]: state.anytimeExpanded[action.id] === false,
        },
      };

    case "TOGGLE_COMPLETE": {
      const task = state.items[state.selectedIndex];
      if (!task) return state;
      return {
        ...state,
        pendingAction: { type: "toggleComplete", taskId: task.id },
      };
    }

    case "DELETE_TASK": {
      const task = state.items[state.selectedIndex];
      if (!task) return state;
      return {
        ...state,
        modal: { type: "deleteConfirm", payload: { taskId: task.id, title: task.title } },
      };
    }

    case "OPEN_ITEM": {
      const task = state.items[state.selectedIndex];
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