import { useInput } from "ink";
import { useCallback } from "react";
import type { KeybindingRegistry } from "./registry.js";
import type { AppAction } from "../state/types.js";

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
          dispatch(actionFromString(result.action));
        }
      },
      [registry, dispatch, context],
    ),
  );
}

function actionFromString(action: string): AppAction {
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
    default:
      return { type: "NOOP" };
  }
}