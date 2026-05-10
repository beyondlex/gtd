import { test, expect } from "bun:test";
import { generateId } from "../src/utils/id.js";
import { parseNaturalDate } from "../src/utils/date-parser.js";
import { EventBus } from "../src/events/event-bus.js";

test("generateId produces UUIDs", () => {
  const id1 = generateId();
  const id2 = generateId();
  expect(id1).not.toBe(id2);
  expect(id1.length).toBe(36);
});

test("parseNaturalDate", () => {
  const result = parseNaturalDate("tomorrow");
  expect(result).not.toBeNull();
  if (result) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(result.getDate()).toBe(tomorrow.getDate());
  }
});

test("EventBus", () => {
  const bus = new EventBus();

  let received: string | null = null;
  const unsubscribe = bus.on("task:created", (payload) => {
    received = payload.task.title;
  });

  bus.emit("task:created", { task: { id: "1", title: "Test" } as any });
  expect(received).toBe("Test");

  unsubscribe();
  received = null;
  bus.emit("task:created", { task: { id: "2", title: "Should not fire" } as any });
  expect(received).toBeNull();
});

test("EventBus multiple events", () => {
  const bus = new EventBus();
  let taskCount = 0;
  let projectCount = 0;

  bus.on("task:created", () => { taskCount++; });
  bus.on("project:created", () => { projectCount++; });

  bus.emit("task:created", { task: { id: "1", title: "T1" } as any });
  bus.emit("task:created", { task: { id: "2", title: "T2" } as any });
  bus.emit("project:created", { project: { id: "1", title: "P1" } as any });

  expect(taskCount).toBe(2);
  expect(projectCount).toBe(1);
});

test("EventBus clear", () => {
  const bus = new EventBus();
  let count = 0;
  bus.on("task:created", () => { count++; });
  bus.clear();
  bus.emit("task:created", { task: { id: "1", title: "T" } as any });
  expect(count).toBe(0);
});