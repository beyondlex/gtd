import { test, expect, beforeEach, afterEach } from "bun:test";
import { DatabaseManager } from "../src/storage/sqlite/database.js";
import { SqliteAreaRepository } from "../src/storage/sqlite/area-repository.js";
import { SqliteProjectRepository } from "../src/storage/sqlite/project-repository.js";
import { SqliteTaskRepository } from "../src/storage/sqlite/task-repository.js";
import { SqliteTagRepository } from "../src/storage/sqlite/tag-repository.js";
import { SqliteHeadingRepository } from "../src/storage/sqlite/heading-repository.js";
import { SqliteChecklistItemRepository } from "../src/storage/sqlite/checklist-repository.js";
import { generateId } from "../src/utils/id.js";
import { getMigrationVersion } from "../src/storage/sqlite/migrations.js";

let dbManager: DatabaseManager;
let areaRepo: SqliteAreaRepository;
let projectRepo: SqliteProjectRepository;
let taskRepo: SqliteTaskRepository;
let tagRepo: SqliteTagRepository;
let headingRepo: SqliteHeadingRepository;
let checklistRepo: SqliteChecklistItemRepository;

beforeEach(() => {
  dbManager = new DatabaseManager(":memory:");
  dbManager.initialize();
  areaRepo = new SqliteAreaRepository(dbManager.getDb());
  projectRepo = new SqliteProjectRepository(dbManager.getDb());
  taskRepo = new SqliteTaskRepository(dbManager.getDb());
  tagRepo = new SqliteTagRepository(dbManager.getDb());
  headingRepo = new SqliteHeadingRepository(dbManager.getDb());
  checklistRepo = new SqliteChecklistItemRepository(dbManager.getDb());
});

afterEach(() => {
  dbManager.close();
});

test("database initializes and runs migrations", () => {
  const version = getMigrationVersion(dbManager.getDb());
  expect(version).toBe(1);
});

test("area CRUD", () => {
  const area = {
    id: generateId(),
    title: "Work",
    sortOrder: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  areaRepo.create(area);
  expect(areaRepo.findById(area.id)?.title).toBe("Work");

  areaRepo.update(area.id, { title: "Work Updated" });
  expect(areaRepo.findById(area.id)?.title).toBe("Work Updated");

  const found = areaRepo.findByTitle("Work Updated");
  expect(found).not.toBeNull();

  const all = areaRepo.findAll();
  expect(all.length).toBeGreaterThanOrEqual(1);

  areaRepo.delete(area.id);
  expect(areaRepo.findById(area.id)).toBeNull();
});

test("project CRUD", () => {
  const area = {
    id: generateId(),
    title: "Life",
    sortOrder: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  areaRepo.create(area);

  const project = {
    id: generateId(),
    title: "Learn Piano",
    areaId: area.id,
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
  expect(projectRepo.findById(project.id)?.title).toBe("Learn Piano");

  const byArea = projectRepo.findByArea(area.id);
  expect(byArea.length).toBe(1);

  const active = projectRepo.findActive();
  expect(active.some((p) => p.id === project.id)).toBe(true);

  projectRepo.update(project.id, { isCompleted: true });
  expect(projectRepo.findById(project.id)?.isCompleted).toBe(true);

  areaRepo.delete(area.id);
});

test("task CRUD and view queries", () => {
  const now = new Date();
  const makeTask = (overrides: Record<string, unknown> = {}) => ({
    id: generateId(),
    title: "Test task",
    notes: "",
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
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    ...overrides,
  });

  taskRepo.create(makeTask({ id: generateId(), title: "Inbox item", isInInbox: true }));
  expect(taskRepo.findInbox().length).toBe(1);

  taskRepo.create(makeTask({ id: generateId(), title: "Due today", deadline: new Date() }));
  expect(taskRepo.findToday().length).toBe(1);

  taskRepo.create(makeTask({ id: generateId(), title: "Overdue!", deadline: new Date("2020-01-01") }));
  expect(taskRepo.findOverdue().length).toBe(1);

  taskRepo.create(makeTask({ id: generateId(), title: "Someday maybe", isSomeday: true }));
  expect(taskRepo.findSomeday().length).toBe(1);

  taskRepo.create(makeTask({ id: generateId(), title: "Anytime task" }));
  expect(taskRepo.findAnytime().length).toBe(1);

  const completeId = generateId();
  taskRepo.create(makeTask({ id: completeId, title: "To complete" }));
  taskRepo.update(completeId, { isCompleted: true, completionDate: new Date() });
  expect(taskRepo.findCompleted().length).toBe(1);

  const results = taskRepo.search("Overdue");
  expect(results.length).toBe(1);

  const future = new Date();
  future.setDate(future.getDate() + 5);
  taskRepo.create(makeTask({ id: generateId(), title: "Future task", deadline: future }));
  expect(taskRepo.findUpcoming(30).length).toBeGreaterThanOrEqual(1);

  const deleteId = generateId();
  taskRepo.create(makeTask({ id: deleteId, title: "To delete" }));
  taskRepo.update(deleteId, { isDeleted: true, deletedAt: new Date() });
  expect(taskRepo.findDeleted().length).toBe(1);
});

test("tag CRUD and task association", () => {
  const tag = {
    id: generateId(),
    title: "@computer",
    color: "#ff0000",
    sortOrder: 0,
  };
  tagRepo.create(tag);
  expect(tagRepo.findById(tag.id)?.title).toBe("@computer");
  expect(tagRepo.findByTitle("@computer")).not.toBeNull();

  const task = {
    id: generateId(),
    title: "Code review",
    notes: "",
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
  };
  taskRepo.create(task);

  tagRepo.addToTask(task.id, tag.id);
  const taskTags = tagRepo.findByTask(task.id);
  expect(taskTags.length).toBe(1);
  expect(taskTags[0].title).toBe("@computer");

  const taggedTasks = taskRepo.findByTag(tag.id);
  expect(taggedTasks.length).toBe(1);

  tagRepo.removeFromTask(task.id, tag.id);
  expect(tagRepo.findByTask(task.id).length).toBe(0);
});

test("heading CRUD", () => {
  const project = {
    id: generateId(),
    title: "Project with headings",
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

  const heading = {
    id: generateId(),
    title: "Phase 1",
    projectId: project.id,
    sortOrder: 0,
  };
  headingRepo.create(heading);
  expect(headingRepo.findById(heading.id)?.title).toBe("Phase 1");

  const headings = headingRepo.findByProject(project.id);
  expect(headings.length).toBe(1);
});

test("checklist item CRUD", () => {
  const task = {
    id: generateId(),
    title: "Task with checklist",
    notes: "",
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
  };
  taskRepo.create(task);

  const item = {
    id: generateId(),
    taskId: task.id,
    text: "Subtask 1",
    isCompleted: false,
    sortOrder: 0,
  };
  checklistRepo.create(item);
  expect(checklistRepo.findById(item.id)?.text).toBe("Subtask 1");

  const items = checklistRepo.findByTask(task.id);
  expect(items.length).toBe(1);

  checklistRepo.update(item.id, { isCompleted: true });
  expect(checklistRepo.findById(item.id)?.isCompleted).toBe(true);
});