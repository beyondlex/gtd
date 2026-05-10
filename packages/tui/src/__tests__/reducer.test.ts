import { test, expect, describe } from "bun:test";
import { appReducer } from "../state/reducer.js";
import type { AppState, AppAction } from "../state/types.js";
import { INITIAL_STATE } from "../state/types.js";

function createState(overrides: Partial<AppState> = {}): AppState {
  return { ...INITIAL_STATE, ...overrides };
}

describe("appReducer", () => {
  test("NAVIGATE_TO_VIEW switches view and resets selection", () => {
    const state = createState({ selectedIndex: 5, items: [{ id: "1", title: "test" } as any] });
    const next = appReducer(state, { type: "NAVIGATE_TO_VIEW", view: "today" });
    expect(next.currentView).toBe("today");
    expect(next.selectedIndex).toBe(0);
    expect(next.items).toEqual([]);
    expect(next.isLoading).toBe(true);
  });

  test("MOVE_SELECTION_DOWN increments selection", () => {
    const state = createState({ items: [{ id: "1" } as any, { id: "2" } as any], selectedIndex: 0 });
    const next = appReducer(state, { type: "MOVE_SELECTION_DOWN" });
    expect(next.selectedIndex).toBe(1);
  });

  test("MOVE_SELECTION_DOWN clamps at max", () => {
    const state = createState({ items: [{ id: "1" } as any], selectedIndex: 0 });
    const next = appReducer(state, { type: "MOVE_SELECTION_DOWN" });
    expect(next.selectedIndex).toBe(0);
  });

  test("MOVE_SELECTION_UP decrements selection", () => {
    const state = createState({ items: [{ id: "1" } as any, { id: "2" } as any], selectedIndex: 1 });
    const next = appReducer(state, { type: "MOVE_SELECTION_UP" });
    expect(next.selectedIndex).toBe(0);
  });

  test("MOVE_SELECTION_UP clamps at 0", () => {
    const state = createState({ selectedIndex: 0 });
    const next = appReducer(state, { type: "MOVE_SELECTION_UP" });
    expect(next.selectedIndex).toBe(0);
  });

  test("GO_TO_TOP sets selection to 0", () => {
    const state = createState({ selectedIndex: 10, items: [{ id: "1" } as any] });
    const next = appReducer(state, { type: "GO_TO_TOP" });
    expect(next.selectedIndex).toBe(0);
  });

  test("GO_TO_BOTTOM sets selection to last index", () => {
    const state = createState({ items: [{ id: "1" } as any, { id: "2" } as any, { id: "3" } as any], selectedIndex: 0 });
    const next = appReducer(state, { type: "GO_TO_BOTTOM" });
    expect(next.selectedIndex).toBe(2);
  });

  test("GO_TO_BOTTOM handles empty list", () => {
    const state = createState({ items: [], selectedIndex: 0 });
    const next = appReducer(state, { type: "GO_TO_BOTTOM" });
    expect(next.selectedIndex).toBe(0);
  });

  test("NEXT_SECTION jumps to next section boundary", () => {
    const state = createState({
      items: [{ id: "1" } as any, { id: "2" } as any, { id: "3" } as any],
      sectionBoundaries: [0, 2],
      selectedIndex: 0,
    });
    const next = appReducer(state, { type: "NEXT_SECTION" });
    expect(next.selectedIndex).toBe(2);
  });

  test("PREV_SECTION jumps to previous section boundary", () => {
    const state = createState({
      items: [{ id: "1" } as any, { id: "2" } as any, { id: "3" } as any],
      sectionBoundaries: [0, 2],
      selectedIndex: 2,
    });
    const next = appReducer(state, { type: "PREV_SECTION" });
    expect(next.selectedIndex).toBe(0);
  });

  test("SET_ITEMS updates items and clears loading", () => {
    const state = createState({ isLoading: true });
    const items = [{ id: "1", title: "Test" } as any];
    const next = appReducer(state, { type: "SET_ITEMS", items, sectionBoundaries: [0] });
    expect(next.items).toBe(items);
    expect(next.isLoading).toBe(false);
    expect(next.sectionBoundaries).toEqual([0]);
  });

  test("SET_COUNTS updates counts", () => {
    const state = createState();
    const counts = { inbox: 5, today: 3, upcoming: 0, anytime: 0, someday: 1, logbook: 0, trash: 0 };
    const next = appReducer(state, { type: "SET_COUNTS", counts });
    expect(next.counts).toBe(counts);
  });

  test("OPEN_MODAL sets modal", () => {
    const state = createState();
    const modal = { type: "help" as const };
    const next = appReducer(state, { type: "OPEN_MODAL", modal });
    expect(next.modal).toBe(modal);
  });

  test("CLOSE_MODAL clears modal", () => {
    const state = createState({ modal: { type: "help" } });
    const next = appReducer(state, { type: "CLOSE_MODAL" });
    expect(next.modal).toBeNull();
  });

  test("SET_STATUS sets status message", () => {
    const state = createState();
    const next = appReducer(state, { type: "SET_STATUS", message: "Task created" });
    expect(next.statusMessage).toBe("Task created");
  });

  test("SET_LOADING sets loading state", () => {
    const state = createState();
    const next = appReducer(state, { type: "SET_LOADING", isLoading: true });
    expect(next.isLoading).toBe(true);
  });

  test("REFRESH_VIEW sets loading", () => {
    const state = createState();
    const next = appReducer(state, { type: "REFRESH_VIEW" });
    expect(next.isLoading).toBe(true);
  });

  test("QUIT sets shouldQuit", () => {
    const state = createState();
    const next = appReducer(state, { type: "QUIT" });
    expect(next.shouldQuit).toBe(true);
  });

  test("NOOP returns state unchanged", () => {
    const state = createState({ selectedIndex: 3 });
    const next = appReducer(state, { type: "NOOP" });
    expect(next).toBe(state);
  });

  test("TOGGLE_COMPLETE sets pendingAction with selected item ID", () => {
    const state = createState({
      items: [{ id: "task-1", title: "Test" } as any, { id: "task-2", title: "Test 2" } as any],
      selectedIndex: 0,
    });
    const next = appReducer(state, { type: "TOGGLE_COMPLETE" });
    expect(next.pendingAction).toEqual({ type: "toggleComplete", taskId: "task-1" });
  });

  test("TOGGLE_COMPLETE returns state unchanged when items is empty", () => {
    const state = createState({ items: [], selectedIndex: 0 });
    const next = appReducer(state, { type: "TOGGLE_COMPLETE" });
    expect(next).toBe(state);
  });

  test("DELETE_TASK opens deleteConfirm modal", () => {
    const state = createState({
      items: [{ id: "task-1", title: "Buy milk" } as any],
      selectedIndex: 0,
    });
    const next = appReducer(state, { type: "DELETE_TASK" });
    expect(next.modal).toEqual({
      type: "deleteConfirm",
      payload: { taskId: "task-1", title: "Buy milk" },
    });
  });

  test("DELETE_TASK returns state unchanged when items is empty", () => {
    const state = createState({ items: [], selectedIndex: 0 });
    const next = appReducer(state, { type: "DELETE_TASK" });
    expect(next).toBe(state);
  });

  test("OPEN_ITEM opens editTask modal", () => {
    const state = createState({
      items: [{ id: "task-1", title: "Test" } as any],
      selectedIndex: 0,
    });
    const next = appReducer(state, { type: "OPEN_ITEM" });
    expect(next.modal).toEqual({
      type: "editTask",
      payload: { taskId: "task-1" },
    });
  });

  test("OPEN_ITEM returns state unchanged when items is empty", () => {
    const state = createState({ items: [], selectedIndex: 0 });
    const next = appReducer(state, { type: "OPEN_ITEM" });
    expect(next).toBe(state);
  });

  test("SET_ITEMS clears pendingAction", () => {
    const state = createState({
      pendingAction: { type: "toggleComplete", taskId: "task-1" },
    });
    const next = appReducer(state, {
      type: "SET_ITEMS",
      items: [],
      sectionBoundaries: [0],
    });
    expect(next.pendingAction).toBeNull();
  });

  test("SET_PENDING_ACTION sets the payload", () => {
    const state = createState();
    const next = appReducer(state, {
      type: "SET_PENDING_ACTION",
      payload: { type: "toggleComplete", taskId: "abc" },
    });
    expect(next.pendingAction).toEqual({ type: "toggleComplete", taskId: "abc" });
  });

  test("NAVIGATE_TO_VIEW resets groupLabels, anytimeData, and renderPlanLength", () => {
    const state = createState({
      groupLabels: ["Inbox"],
      anytimeData: {} as any,
      renderPlanLength: 10,
      selectedIndex: 5,
    });
    const next = appReducer(state, { type: "NAVIGATE_TO_VIEW", view: "today" });
    expect(next.groupLabels).toEqual([]);
    expect(next.anytimeData).toBeNull();
    expect(next.renderPlanLength).toBeNull();
  });

  test("SET_ITEMS stores groupLabels and renderPlanLength", () => {
    const state = createState();
    const next = appReducer(state, {
      type: "SET_ITEMS",
      items: [],
      sectionBoundaries: [0],
      groupLabels: ["Inbox"],
      renderPlanLength: 5,
    });
    expect(next.groupLabels).toEqual(["Inbox"]);
    expect(next.renderPlanLength).toBe(5);
  });

  test("SET_ITEMS stores anytimeData", () => {
    const state = createState();
    const anytimeData = { areaGroups: [], ungrouped: { label: "test", tasks: [] } };
    const next = appReducer(state, {
      type: "SET_ITEMS",
      items: [],
      sectionBoundaries: [],
      anytimeData,
    });
    expect(next.anytimeData).toBe(anytimeData);
  });

  test("TOGGLE_COLLAPSE toggles expanded state from true to false", () => {
    const state = createState({ anytimeExpanded: { "area-1": true } });
    const next = appReducer(state, { type: "TOGGLE_COLLAPSE", id: "area-1" });
    expect(next.anytimeExpanded["area-1"]).toBe(false);
  });

  test("TOGGLE_COLLAPSE toggles expanded state from false to true", () => {
    const state = createState({ anytimeExpanded: { "area-1": false } });
    const next = appReducer(state, { type: "TOGGLE_COLLAPSE", id: "area-1" });
    expect(next.anytimeExpanded["area-1"]).toBe(true);
  });

  test("TOGGLE_COLLAPSE initializes missing entry to false", () => {
    const state = createState({ anytimeExpanded: {} });
    const next = appReducer(state, { type: "TOGGLE_COLLAPSE", id: "area-1" });
    expect(next.anytimeExpanded["area-1"]).toBe(false);
  });

  test("MOVE_SELECTION_DOWN uses renderPlanLength when set", () => {
    const state = createState({
      items: [],
      renderPlanLength: 3,
      selectedIndex: 0,
    });
    const next = appReducer(state, { type: "MOVE_SELECTION_DOWN" });
    expect(next.selectedIndex).toBe(1);
  });

  test("GO_TO_BOTTOM uses renderPlanLength when set", () => {
    const state = createState({
      items: [],
      renderPlanLength: 5,
      selectedIndex: 0,
    });
    const next = appReducer(state, { type: "GO_TO_BOTTOM" });
    expect(next.selectedIndex).toBe(4);
  });
});