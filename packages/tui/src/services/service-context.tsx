import { createContext, useContext, type ReactNode } from "react";
import { homedir } from "node:os";
import { join } from "node:path";
import { existsSync, mkdirSync } from "node:fs";
import {
  DatabaseManager,
  SqliteTaskRepository,
  SqliteProjectRepository,
  SqliteAreaRepository,
  SqliteHeadingRepository,
  SqliteChecklistItemRepository,
  SqliteTagRepository,
  EventBus,
  TaskService,
  InboxService,
  ProjectService,
  AreaService,
  TodayViewService,
  UpcomingViewService,
  AnytimeViewService,
  SomedayViewService,
  LogbookViewService,
  TrashViewService,
  SearchService,
  GtdWorkflowService,
} from "@gtd/core";

export interface Services {
  eventBus: EventBus;
  taskService: TaskService;
  inboxService: InboxService;
  projectService: ProjectService;
  areaService: AreaService;
  todayView: TodayViewService;
  upcomingView: UpcomingViewService;
  anytimeView: AnytimeViewService;
  somedayView: SomedayViewService;
  logbookView: LogbookViewService;
  trashView: TrashViewService;
  searchService: SearchService;
  gtdWorkflow: GtdWorkflowService;
}

function initializeServices(): Services {
  const dataDir = join(homedir(), ".local", "share", "gtd");
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }
  const dbPath = join(dataDir, "data.db");

  const dbManager = new DatabaseManager(dbPath);
  dbManager.initialize();

  const eventBus = new EventBus();
  const db = dbManager.getDb();

  const taskRepo = new SqliteTaskRepository(db);
  const projectRepo = new SqliteProjectRepository(db);
  const areaRepo = new SqliteAreaRepository(db);
  const headingRepo = new SqliteHeadingRepository(db);
  const checklistRepo = new SqliteChecklistItemRepository(db);
  const tagRepo = new SqliteTagRepository(db);

  const taskService = new TaskService(taskRepo, eventBus);
  const inboxService = new InboxService(taskRepo, eventBus);
  const projectService = new ProjectService(projectRepo, taskRepo, eventBus);
  const areaService = new AreaService(areaRepo, projectRepo, taskRepo, eventBus);

  const todayView = new TodayViewService(taskRepo);
  const upcomingView = new UpcomingViewService(taskRepo);
  const anytimeView = new AnytimeViewService(taskRepo, projectRepo, areaRepo);
  const somedayView = new SomedayViewService(taskRepo, projectRepo);
  const logbookView = new LogbookViewService(taskRepo);
  const trashView = new TrashViewService(taskRepo);

  const searchService = new SearchService(taskRepo);
  const gtdWorkflow = new GtdWorkflowService(taskRepo, projectRepo);

  return {
    eventBus,
    taskService,
    inboxService,
    projectService,
    areaService,
    todayView,
    upcomingView,
    anytimeView,
    somedayView,
    logbookView,
    trashView,
    searchService,
    gtdWorkflow,
  };
}

const services = initializeServices();
const ServicesContext = createContext<Services>(services);

export function ServicesProvider({ children }: { children: ReactNode }) {
  return <ServicesContext.Provider value={services}>{children}</ServicesContext.Provider>;
}

export function useServices(): Services {
  return useContext(ServicesContext);
}