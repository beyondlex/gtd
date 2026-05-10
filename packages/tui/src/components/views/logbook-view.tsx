import { useAppState } from "../../state/context.js";
import { TaskList } from "../common/task-list.js";

export function LogbookView() {
  const { state } = useAppState();

  return (
    <TaskList
      items={state.items}
      selectedIndex={state.selectedIndex}
      sectionBoundaries={state.sectionBoundaries}
      groupLabels={state.groupLabels}
      emptyMessage="No completed tasks yet"
      emptyHint="Complete tasks to see them here"
    />
  );
}