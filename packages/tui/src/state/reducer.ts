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
        statusMessage: null,
        isLoading: true,
      };

    case "SELECT_ITEM":
      return {
        ...state,
        selectedIndex: Math.max(0, Math.min(action.index, state.items.length - 1)),
      };

    case "MOVE_SELECTION_DOWN":
      return {
        ...state,
        selectedIndex: Math.min(state.selectedIndex + 1, Math.max(0, state.items.length - 1)),
      };

    case "MOVE_SELECTION_UP":
      return {
        ...state,
        selectedIndex: Math.max(state.selectedIndex - 1, 0),
      };

    case "GO_TO_TOP":
      return { ...state, selectedIndex: 0 };

    case "GO_TO_BOTTOM":
      return {
        ...state,
        selectedIndex: Math.max(0, state.items.length - 1),
      };

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
        selectedIndex: Math.min(state.selectedIndex, Math.max(0, action.items.length - 1)),
        isLoading: false,
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

    case "TOGGLE_COMPLETE":
    case "DELETE_TASK":
    case "OPEN_ITEM":
      return state;

    case "QUIT":
      return { ...state, shouldQuit: true };

    case "NOOP":
    default:
      return state;
  }
}