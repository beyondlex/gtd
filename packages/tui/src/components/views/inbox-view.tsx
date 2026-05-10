import { useAppState } from "../../state/context.js";
import { TaskList } from "../common/task-list.js";

export function InboxView() {
  const { state } = useAppState();

  return (
    <TaskList
      items={state.items}
      selectedIndex={state.selectedIndex}
      sectionBoundaries={state.sectionBoundaries}
      groupLabels={state.groupLabels}
      showProject
      showDeadline
      emptyMessage="Inbox is clear"
      emptyHint='Press "n" to capture a new task'
    />
  );
}