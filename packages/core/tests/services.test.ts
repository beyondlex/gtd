import { test, expect, beforeEach, afterEach } from "bun:test";
import { DatabaseManager } from "../src/storage/sqlite/database.js";
import { SqliteAreaRepository } from "../src/storage/sqlite/area-repository.js";
import { SqliteProjectRepository } from "../src/storage/sqlite/project-repository.js";
import { SqliteTaskRepository } from "../src/storage/sqlite/task-repository.js";
import { generateId } from "../src/utils/id.js";
import { EventBus } from "../src/events/event-bus.js";
import { TaskService } from "../src/services/task.service.js";
import { InboxService } from "../src/services/inbox.service.js";
import { ProjectService } from "../src/services/project.service.js";
import { AreaService } from "../src/services/area.service.js";
import { TodayViewService } from "../src/services/views/today-view.service.js";
import { SearchService } from "../src/services/search.service.js";
import { GtdWorkflowService } from "../src/services/gtd-workflow.service.js";

let dbManager: DatabaseManager;
let areaRepo: SqliteAreaRepository;
let projectRepo: SqliteProjectRepository;
let taskRepo: SqliteTaskRepository;

beforeEach(() => {
  dbManager = new DatabaseManager(":memory:");
  dbManager.initialize();
  areaRepo = new SqliteAreaRepository(dbManager.getDb());
  projectRepo = new SqliteProjectRepository(dbManager.getDb());
  taskRepo = new SqliteTaskRepository(dbManager.getDb());
});

afterEach(() => {
  dbManager.close();
});

test("TaskService create, complete, delete, restore", () => {
  const bus = new EventBus();
  const taskService = new TaskService(taskRepo, bus);

  const created = taskService.create({ title: "Service test task" });
  expect(created.title).toBe("Service test task");
  expect(created.isInInbox).toBe(true);

  const completed = taskService.complete(created.id);
  expect(completed.isCompleted).toBe(true);

  const toggled = taskService.toggleComplete(created.id);
  expect(toggled.isCompleted).toBe(false);

  taskService.delete(created.id);
  const deleted = taskService.findById(created.id);
  expect(deleted?.isDeleted).toBe(true);

  const restored = taskService.restore(created.id);
  expect(restored.isDeleted).toBe(false);
});

test("TaskService move to project", () => {
  const bus = new EventBus();
  const taskService = new TaskService(taskRepo, bus);

  const task = taskService.create({ title: "Movable task", isInInbox: true });
  expect(task.isInInbox).toBe(true);

  const project = {
    id: generateId(),
    title: "Destination Project",
    areaId: null,
    isCompleted: false,
    isCanceled: false,
    isDeleted: false,
    deadline: null,
    sortOrder: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };
  projectRepo.create(project);

  const moved = taskService.moveToProject(task.id, project.id);
  expect(moved.projectId).toBe(project.id);
  expect(moved.isInInbox).toBe(false);
});

test("InboxService process items", () => {
  const bus = new EventBus();
  const taskService = new TaskService(taskRepo, bus);
  const inboxService = new InboxService(taskRepo, bus);

  const task = taskService.create({ title: "Inbox item", isInInbox: true });
  expect(inboxService.getInboxCount()).toBeGreaterThanOrEqual(1);

  inboxService.processItem(task.id, { type: "someday" });
  const updated = taskRepo.findById(task.id);
  expect(updated?.isSomeday).toBe(true);
  expect(updated?.isInInbox).toBe(false);
});

test("ProjectService CRUD and complete", () => {
  const bus = new EventBus();
  const projectService = new ProjectService(projectRepo, taskRepo, bus);

  const project = projectService.create({ title: "Service Project" });
  expect(project.title).toBe("Service Project");

  const progress = projectService.getProgress(project.id);
  expect(progress).toEqual({ completed: 0, total: 0 });

  projectService.complete(project.id);
  expect(projectService.findById(project.id)?.isCompleted).toBe(true);
});

test("AreaService tree", () => {
  const bus = new EventBus();
  const areaService = new AreaService(areaRepo, projectRepo, taskRepo, bus);

  const area = areaService.create({ title: "Test Area" });
  expect(area.title).toBe("Test Area");

  const tree = areaService.getTree();
  expect(tree.length).toBeGreaterThanOrEqual(1);
});

test("TodayViewService groups", () => {
  const todayView = new TodayViewService(taskRepo);

  taskRepo.create({
    id: generateId(),
    title: "Overdue task",
    notes: "",
    projectId: null,
    areaId: null,
    headingId: null,
    isCompleted: false,
    isInInbox: false,
    isSomeday: false,
    isDeleted: false,
    deadline: new Date("2023-01-01"),
    startDate: null,
    reminderDate: null,
    repeatRule: null,
    completionDate: null,
    sortOrder: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  });

  const groups = todayView.getGroups();
  const overdueGroup = groups.find((g) => g.label === "Overdue");
  expect(overdueGroup).toBeDefined();
  expect(overdueGroup!.tasks.length).toBeGreaterThanOrEqual(1);
});

test("SearchService search", () => {
  const searchService = new SearchService(taskRepo);

  taskRepo.create({
    id: generateId(),
    title: "Findable task",
    notes: "some searchable content",
    projectId: null,
    areaId: null,
    headingId: null,
    isCompleted: false,
    isInInbox: false,
    isSomeday: false,
    isDeleted: false,
    deadline: null,
    startDate: null,
    reminderDate: null,
    repeatRule: null,
    completionDate: null,
    sortOrder: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  });

  const results = searchService.search("Findable");
  expect(results.length).toBe(1);
  expect(results[0].matchField).toBe("title");
});

test("GtdWorkflowService weekly review", () => {
  const workflow = new GtdWorkflowService(taskRepo, projectRepo);
  const data = workflow.getWeeklyReviewData();
  expect(typeof data.inboxCount).toBe("number");
  expect(typeof data.overdueTasks).toBe("number");
});