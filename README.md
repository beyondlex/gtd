# GTD-Claude

A keyboard-first, Things 3-inspired GTD (Getting Things Done) tool.

Built with React + Ink + Bun for the TUI, with a shared TypeScript core that can be reused for future Mac and iOS clients.

## Features

- **Inbox** — Capture everything quickly
- **Today** — Your daily action plan with overdue tracking
- **Upcoming** — Calendar-style view of future tasks
- **Anytime** — All actionable tasks grouped by project/area
- **Someday** — Deferred tasks and projects
- **Logbook** — Completed items history
- **Search** — Full-text search across all tasks
- **Tags** — GTD-style contexts (@computer, @phone, @home)
- **Projects & Areas** — Organize work by outcomes and life domains
- **Keyboard-first** — Vim-style navigation, fully configurable
- **Themes** — TOML-configurable color themes

## Quick Start

```bash
# Install dependencies
bun install

# Build the core library
bun run build:core

# Run tests
bun test

# Start the TUI in dev mode (once implemented)
bun run dev:tui
```

## Configuration

User config files are stored at `~/.config/gtd/`:
- `keybindings.toml` — Custom keyboard shortcuts
- `theme.toml` — Custom color theme

Database is stored at `~/.local/share/gtd/data.db`.

## Keyboard Shortcuts (Default)

| Key | Action |
|---|---|
| `j`/`k` | Move selection |
| `g g`/`G` | Go to top/bottom |
| `/` | Search |
| `n` | New task |
| `Enter` | Open task detail |
| `Space` | Toggle complete |
| `d` | Delete |
| `u` | Undo |
| `?` | Help |
| `q` | Quit |

## Architecture

```
packages/core  →  Shared logic (models, storage, services)
packages/tui   →  Terminal UI (React + Ink)
```

The core package is platform-independent and can be reused by future Mac/iOS clients.

## Development

```bash
bun run build:core   # Build core package
bun run test:core    # Test core package
bun run lint         # TypeScript type checking
```

## License

MIT