# GTD-Claude Usage Guide

A Things 3-inspired GTD (Getting Things Done) terminal tool built with React + Ink + Bun.

## Installation

### Option 1: Standalone Binary

Download or build the binary and place it anywhere in your `PATH`:

```bash
# Build from source
bun run build:binary

# The binary is at dist/gtd — copy it to your PATH
cp dist/gtd /usr/local/bin/gtd
```

### Option 2: Run from Source

```bash
bun install
bun run build
cd packages/tui && bun run start
```

## Getting Started

Run `gtd` to launch the terminal UI:

```bash
gtd
```

You'll see the sidebar with 7 views on the left and content on the right. The inbox is selected by default.

### Quick Start

1. Press `n` to create your first task in the inbox
2. Type a title like "Review project proposal" and press Enter
3. Press `2` to switch to Today view
4. Press `j`/`k` to navigate between tasks
5. Press Space to mark a task as complete
6. Press `q` to quit

## Views

The app has 7 views, accessible via number keys 1–7:

| Key | View | Description |
|---|---|---|
| `1` | Inbox | Unprocessed tasks that need organizing |
| `2` | Today | Tasks due today, overdue, or added to today |
| `3` | Upcoming | Tasks with deadlines in the next 30 days |
| `4` | Anytime | All actionable tasks grouped by project/area |
| `5` | Someday | Deferred tasks and projects |
| `6` | Logbook | Completed items |
| `7` | Trash | Soft-deleted items |

## Keyboard Shortcuts

### Global

| Key | Action |
|---|---|
| `j` / `k` | Move selection down / up |
| `g g` | Go to top of list |
| `G` | Go to bottom of list |
| `Tab` / `Shift+Tab` | Jump to next / previous section |
| `Space` | Toggle task completion |
| `n` | Create new task (quick capture) |
| `Enter` or `e` | Open task detail / edit |
| `d` | Delete task (moves to trash) |
| `/` | Search |
| `?` | Show help overlay |
| `Ctrl+R` | Refresh current view |
| `q` | Quit |

### Anytime View

| Key | Action |
|---|---|
| `h` | Toggle collapse area/project |

### Modal Contexts

| Key | Context | Action |
|---|---|---|
| `Esc` | Any modal | Close / cancel |
| `Enter` | New task | Create task |
| `Esc` | New task | Cancel |
| `Tab` | Edit task | Next field |
| `Enter` | Edit task | Save changes |
| `Esc` | Edit task | Cancel |
| `Enter` | Delete confirm | Confirm delete |
| `Esc` | Delete confirm | Cancel |
| `Esc` | Help | Close |

### Search

| Key | Action |
|---|---|
| `Esc` | Close search |
| `Enter` | Open selected result |
| `j` / `k` | Navigate results |

## Task Management

### Creating a Task

Press `n` from any view to open the quick capture modal. Type the task title and press Enter to create it. You can include natural language dates in the title:

- "Review docs by Friday"
- "Call dentist tomorrow at 3pm"
- "Submit report next Monday"

### Editing a Task

Select a task and press Enter (or `e`) to open the edit modal. Fields:

- **Title**: The task name
- **Notes**: Additional details (Tab to reach)
- **Deadline**: Due date (natural language, e.g., "next Friday")

Tab cycles through fields. Press Enter to save, Escape to cancel.

### Completing a Task

Select a task and press Space. The task is toggled between completed and uncompleted. Completed tasks appear in the Logbook view.

### Deleting a Task

Select a task and press `d`. A confirmation dialog appears — press Enter to confirm or Escape to cancel. Deleted tasks go to the Trash view.

## Configuration

### Config Directory

Configuration files are stored at `~/.config/gtd/`:

```
~/.config/gtd/
├── theme.toml       # Color theme
└── keybindings.toml  # Keyboard shortcuts
```

On first run, default config files are automatically created in this directory.

### Custom Theme

Edit `~/.config/gtd/theme.toml` to customize colors. The file uses TOML format with sections for each UI element:

```toml
name = "gtd-default"

[colors]
primary = "#0066CC"
background = "#1C1C1E"
text = "#FFFFFF"
# ... see the default file for all options

[sidebar]
background = "#1C1C1E"
textActive = "#FFFFFF"
# ...
```

You can override individual fields — partial overrides are merged with defaults.

### Custom Keybindings

Edit `~/.config/gtd/keybindings.toml` to rebind keys. The file uses TOML arrays:

```toml
[[binding]]
keys = "j"
action = "moveDown"
description = "Move selection down"
context = "global"

[[binding]]
keys = "k"
action = "moveUp"
description = "Move selection up"
context = "global"
```

To override a default binding, use the same `keys` + `context` combination. To add a new binding, add a new `[[binding]]` entry. Available actions: `moveDown`, `moveUp`, `goToTop`, `goToBottom`, `toggleComplete`, `openItem`, `deleteTask`, `newTask`, `editTask`, `quit`, `showHelp`, `startSearch`, `closeModal`, `nextSection`, `prevSection`, `navigateTo`, `refreshView`, `toggleCollapse`.

## Data Storage

Data is stored in a SQLite database at `~/.local/share/gtd/data.db`. The database is created automatically on first run. WAL mode is enabled for performance.

### Backups

To back up your data, copy the database file:

```bash
cp ~/.local/share/gtd/data.db ~/backups/gtd-$(date +%Y%m%d).db
```

## Building from Source

```bash
# Clone the repository
git clone <repo-url>
cd gtd-claude

# Install dependencies
bun install

# Build all packages
bun run build

# Run tests
bun test

# Build standalone binary
bun run build:binary
# Output: ./dist/gtd

# Run type checking
bun run lint
```

## Troubleshooting

### "Raw mode is not supported" error

This happens when running the TUI in a non-TTY environment (e.g., piped output). Use `--version` or `--help` for non-interactive usage. For the TUI, run directly in a terminal.

### Config changes not taking effect

Restart the app after changing config files. Theme and keybinding changes are loaded once at startup.

### Database issues

If you encounter database errors, try deleting the database file at `~/.local/share/gtd/data.db` (warning: this deletes all your data). A fresh database will be created on next launch.