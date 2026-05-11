import type { ViewType, AnytimeData, Task } from "@gtd/core";

export interface NewTaskModal {
  type: "newTask";
}

export interface EditTaskModal {
  type: "editTask";
  payload: { taskId: string };
}

export interface DeleteConfirmModal {
  type: "deleteConfirm";
  payload: { taskId: string; title: string };
}

export interface HelpModal {
  type: "help";
}

export type ModalState = NewTaskModal | EditTaskModal | DeleteConfirmModal | HelpModal;

export interface SearchModalState {
  type: "search";
  query?: string;
  results?: Task[];
}

export interface PendingAction {
  type: "toggleComplete";
  taskId: string;
}

export interface AppState {
  currentView: ViewType;
  selectedIndex: number;
  items: Task[];
  sectionBoundaries: number[];
  groupLabels: string[];
  renderPlanLength: number | null;
  counts: Record<ViewType, number>;
  modal: ModalState | SearchModalState | null;
  statusMessage: string | null;
  error: string | null;
  isLoading: boolean;
  shouldQuit: boolean;
  anytimeData: AnytimeData | null;
  anytimeExpanded: Record<string, boolean>;
  pendingAction: PendingAction | null;
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
  | { type: "SET_ITEMS"; items: Task[]; sectionBoundaries: number[]; groupLabels?: string[]; renderPlanLength?: number; anytimeData?: AnytimeData | null }
  | { type: "SET_COUNTS"; counts: Record<ViewType, number> }
  | { type: "OPEN_MODAL"; modal: ModalState | SearchModalState }
  | { type: "CLOSE_MODAL" }
  | { type: "SET_STATUS"; message: string | null }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "SET_LOADING"; isLoading: boolean }
  | { type: "REFRESH_VIEW" }
  | { type: "TOGGLE_COMPLETE" }
  | { type: "DELETE_TASK" }
  | { type: "OPEN_ITEM" }
  | { type: "TOGGLE_COLLAPSE"; id: string }
  | { type: "SET_PENDING_ACTION"; payload: PendingAction | null }
  | { type: "QUIT" }
  | { type: "NOOP" };

export const INITIAL_STATE: AppState = {
  currentView: "inbox",
  selectedIndex: 0,
  items: [],
  sectionBoundaries: [],
  groupLabels: [],
  renderPlanLength: null,
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
  error: null,
  isLoading: true,
  shouldQuit: false,
  anytimeData: null,
  anytimeExpanded: {},
  pendingAction: null,
};
