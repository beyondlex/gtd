import type { ViewType } from "@gtd/core";

export interface ModalState {
  type: "newTask" | "editTask" | "deleteConfirm" | "help" | "search";
  payload?: Record<string, unknown>;
}

export interface AppState {
  currentView: ViewType;
  selectedIndex: number;
  items: import("@gtd/core").Task[];
  sectionBoundaries: number[];
  counts: Record<ViewType, number>;
  modal: ModalState | null;
  statusMessage: string | null;
  isLoading: boolean;
  shouldQuit: boolean;
}

export type AppAction =
  | { type: "NAVIGATE_TO_VIEW"; view: ViewType }
  | { type: "SELECT_ITEM"; index: number }
  | { type: "MOVE_SELECTION_DOWN" }
  | { type: "MOVE_SELECTION_UP" }
  | { type: "GO_TO_TOP" }
  | { type: "GO_TO_BOTTOM" }
  | { type: "NEXT_SECTION" }
  | { type: "PREV_SECTION" }
  | { type: "SET_ITEMS"; items: import("@gtd/core").Task[]; sectionBoundaries: number[] }
  | { type: "SET_COUNTS"; counts: Record<ViewType, number> }
  | { type: "OPEN_MODAL"; modal: ModalState }
  | { type: "CLOSE_MODAL" }
  | { type: "SET_STATUS"; message: string | null }
  | { type: "SET_LOADING"; isLoading: boolean }
  | { type: "REFRESH_VIEW" }
  | { type: "TOGGLE_COMPLETE" }
  | { type: "DELETE_TASK" }
  | { type: "OPEN_ITEM" }
  | { type: "QUIT" }
  | { type: "NOOP" };

export const INITIAL_STATE: AppState = {
  currentView: "inbox",
  selectedIndex: 0,
  items: [],
  sectionBoundaries: [],
  counts: {
    inbox: 0,
    today: 0,
    upcoming: 0,
    anytime: 0,
    someday: 0,
    logbook: 0,
    trash: 0,
  },
  modal: null,
  statusMessage: null,
  isLoading: false,
  shouldQuit: false,
};