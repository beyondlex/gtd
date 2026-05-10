# GTD-Claude

A Things 3-inspired GTD (Getting Things Done) tool built with React + Ink + Bun.

## Project Structure

```
gtd-claude/
├── packages/
│   ├── core/          # Shared logic (models, storage, services)
│   │   └── src/
│   │       ├── models/         # TypeScript interfaces + Zod schemas
│   │       ├── storage/        # Repository interfaces + SQLite impl
│   │       │   └── sqlite/     # Database manager, migrations, repos
│   │       ├── services/       # Business logic layer
│   │       │   └── views/      # View query services
│   │       ├── events/         # Typed pub/sub EventBus
│   │       └── utils/          # ID gen, date parsing, sort
│   └── tui/           # Terminal UI (React + Ink)
│       └── src/
│           ├── components/     # React components (layout, views, modals, common)
│           ├── hooks/          # React hooks (keybindings, state, theme)
│           ├── state/          # App state (context, reducer)
│           ├── keybindings/    # Keybinding loader + registry
│           └── theme/          # Theme loader + types
```

## Key Commands

- `bun run build:core` — Build core package
- `bun run build:tui` — Build TUI package
- `bun run build` — Build all packages
- `bun test` — Run all tests
- `bun run test:core` — Run core tests only
- `bun run lint` — TypeScript type checking

## Architecture

**Data flow**: Keyboard Input → Keybinding Registry → dispatch(action) → Service → Repository → SQLite

**Core entities**: Area → Project → Task (with Headings, ChecklistItems, Tags)

**Storage**: SQLite via bun:sqlite, WAL mode, UUID v7 IDs, soft-delete

**Views**: Inbox, Today, Upcoming, Anytime, Someday, Logbook, Trash, Search

## Tech Stack

| Layer | Choice |
|---|---|
| Runtime | Bun (bun:sqlite, bun build --compile) |
| TUI | React 19 + Ink 7 |
| Language | TypeScript (strict) |
| Config | TOML (smol-toml) |
| Validation | Zod |
| Testing | bun:test |

## Implementation Progress

- [x] Phase 1: Core Foundation (models, storage, events, utils)
- [x] Phase 2: Core Services (business logic layer)
- [x] Phase 3: TUI Foundation (shell, config, keyboard, state)
- [x] Phase 4: TUI Views — Read Mode
- [x] Phase 5: TUI Interactions — Write Mode
- [ ] Phase 6: Polish & Build