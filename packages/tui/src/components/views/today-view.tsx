import { useAppState } from "../../state/context.js";
import { TaskList } from "../common/task-list.js";

export function TodayView() {
  const { state } = useAppState();

  return (
    <TaskList
      items={state.items}
      selectedIndex={state.selectedIndex}
      sectionBoundaries={state.sectionBoundaries}
      groupLabels={state.groupLabels}
      showDeadline
      showProject
      emptyMessage="Nothing due today"
      emptyHint="Add tasks with deadlines or defer them to today"
    />
  );
}