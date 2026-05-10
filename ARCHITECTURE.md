# Architecture

## Overview

GTD-Claude uses a clean architecture with a platform-independent core and platform-specific clients. The core contains all business logic, data models, and storage — clients only handle UI rendering and user input.

```
┌─────────────────────────────────────────────────────┐
│                     Clients                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │ TUI (Ink)│  │ Mac App  │  │ iOS App  │  (future) │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘           │
└───────┼──────────────┼──────────────┼────────────────┘
        │              │              │
        └──────────────┼──────────────┘
                       ▼
        ┌─────────────────────────────┐
        │        @gtd/core            │
        │  ┌───────────────────────┐  │
        │  │     Services          │  │
        │  │  (business logic)     │  │
        │  ├───────────────────────┤  │
        │  │   Repositories        │  │
        │  │  (data access)        │  │
        │  ├───────────────────────┤  │
        │  │   SQLite (bun:sqlite) │  │
        │  └───────────────────────┘  │
        └─────────────────────────────┘
```

## Data Model

### Entities

```
Area (life domain)
├── Project (multi-step outcome)
│   ├── Heading (section label)
│   │   └── Task (action item)
│   └── Task
├── Task (standalone)
└── Task

Task
├── ChecklistItem (sub-item)
└── Tag (context/label, M:N)
```

### Key Design Decisions

- **UUID v7 IDs** — Time-sortable, sync-friendly
- **Soft delete** — `isDeleted` + `deletedAt`, trash with 30-day auto-purge
- **Dates as ISO 8601 strings** in SQLite, `Date` objects in model layer
- **No sub-projects** — Tasks have checklist items instead

## Views (Smart Lists)

| View | Query Logic |
|---|---|
| Inbox | `isInInbox=true AND NOT isCompleted AND NOT isDeleted` |
| Today | `deadline=today OR startDate<=today AND NOT isInInbox AND NOT isSomeday AND active` |
| Upcoming | `deadline/startDate in [today, today+30d] AND active` |
| Anytime | `NOT isInInbox AND NOT isSomeday AND no deadline/startDate AND active` |
| Someday | `isSomeday=true AND active` |
| Logbook | `isCompleted=true AND NOT isDeleted` |
| Trash | `isDeleted=true` |

## Data Flow

```
User Keyboard Input
  → Ink stdin handler
    → Keybinding Registry (matches key → action in context)
      → dispatch(action) to appReducer
        → Service method (business logic)
          → Repository method (SQLite query)
            → EventBus.emit() (cross-component notification)
              → React re-render → Ink stdout output
```

## TUI Component Tree

```
<App>
  <AppContextProvider>
    <Layout>
      <Sidebar />          ← navigation: views, areas, projects
      <MainContent>        ← view router
        <InboxView />
        <TodayView />
        <UpcomingView />
        <AnytimeView />
        <SomedayView />
        <LogbookView />
        <TrashView />
        <SearchView />
      </MainContent>
      <StatusBar />        ← key hints, item count
    </Layout>
    <QuickCapture />       ← modal
    <TaskDetail />         ← modal
    <HelpOverlay />        ← modal
    <ConfirmDialog />      ← modal
  </AppContextProvider>
</App>
```

## Configuration

- **Keybindings**: TOML file at `~/.config/gtd/keybindings.toml`, merged with defaults
- **Theme**: TOML file at `~/.config/gtd/theme.toml`, merged with defaults
- **Database**: SQLite at `~/.local/share/gtd/data.db`