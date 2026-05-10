import { useAppState } from "../../state/context.js";
import { TaskList } from "../common/task-list.js";

export function UpcomingView() {
  const { state } = useAppState();

  return (
    <TaskList
      items={state.items}
      selectedIndex={state.selectedIndex}
      sectionBoundaries={state.sectionBoundaries}
      groupLabels={state.groupLabels}
      showProject
      emptyMessage="No upcoming tasks"
      emptyHint="Tasks with deadlines in the next 30 days appear here"
    />
  );
}