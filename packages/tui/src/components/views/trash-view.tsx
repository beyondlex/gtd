import { useAppState } from "../../state/context.js";
import { TaskList } from "../common/task-list.js";

export function TrashView() {
  const { state } = useAppState();

  return (
    <TaskList
      items={state.items}
      selectedIndex={state.selectedIndex}
      sectionBoundaries={state.sectionBoundaries}
      groupLabels={state.groupLabels}
      showDeletedAt
      emptyMessage="Trash is empty"
      emptyHint="Deleted tasks appear here"
    />
  );
}