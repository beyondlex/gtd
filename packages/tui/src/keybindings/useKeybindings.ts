import { useInput } from "ink";
import { useCallback } from "react";
import type { KeybindingRegistry } from "./registry.js";
import type { AppAction } from "../state/types.js";
import type { ViewType } from "@gtd/core";

export function useKeybindings(
  registry: KeybindingRegistry,
  dispatch: React.Dispatch<AppAction>,
  context = "global",
): void {
  useInput(
    useCallback(
      (input, key) => {
        const result = registry.match(input, key, context);
        if (result && result.consumed && result.action) {
          const action = actionFromString(result.action, input, key);
          dispatch(action);
        }
      },
      [registry, dispatch, context],
    ),
  );
}

const VIEW_KEY_MAP: Record<string, ViewType> = {
  "1": "inbox",
  "2": "today",
  "3": "upcoming",
  "4": "anytime",
  "5": "someday",
  "6": "logbook",
  "7": "trash",
};

function actionFromString(
  action: string,
  input: string,
  key: { ctrl: boolean; shift: boolean; meta: boolean },
): AppAction {
  switch (action) {
    case "moveDown":
      return { type: "MOVE_SELECTION_DOWN" };
    case "moveUp":
      return { type: "MOVE_SELECTION_UP" };
    case "goToTop":
      return { type: "GO_TO_TOP" };
    case "goToBottom":
      return { type: "GO_TO_BOTTOM" };
    case "newTask":
      return { type: "OPEN_MODAL", modal: { type: "newTask" } };
    case "editTask":
      return { type: "OPEN_MODAL", modal: { type: "editTask" } };
    case "toggleComplete":
      return { type: "TOGGLE_COMPLETE" };
    case "deleteTask":
      return { type: "DELETE_TASK" };
    case "openItem":
      return { type: "OPEN_ITEM" };
    case "quit":
      return { type: "QUIT" };
    case "showHelp":
      return { type: "OPEN_MODAL", modal: { type: "help" } };
    case "startSearch":
      return { type: "OPEN_MODAL", modal: { type: "search" } };
    case "closeModal":
      return { type: "CLOSE_MODAL" };
    case "refreshView":
      return { type: "REFRESH_VIEW" };
    case "nextSection":
      return { type: "NEXT_SECTION" };
    case "prevSection":
      return { type: "PREV_SECTION" };
    case "navigateTo": {
      const view = VIEW_KEY_MAP[input];
      if (view) return { type: "NAVIGATE_TO_VIEW", view };
      return { type: "NOOP" };
    }
    default:
      return { type: "NOOP" };
  }
}