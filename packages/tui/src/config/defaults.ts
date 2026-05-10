// Embedded default TOML configs for compiled binary support.
// These are bundled into the binary by bun build --compile.

export const DEFAULT_THEME_TOML = `name = "gtd-default"

[colors]
primary = "#0066CC"
secondary = "#5E5CE6"
background = "#1C1C1E"
surface = "#2C2C2E"
text = "#FFFFFF"
textMuted = "#8E8E93"
accent = "#0A84FF"
error = "#FF453A"
success = "#30D158"
warning = "#FF9F0A"

[sidebar]
background = "#1C1C1E"
activeItemBg = "#2C2C2E"
hoverItemBg = "#3A3A3C"
text = "#8E8E93"
textActive = "#FFFFFF"
countBadgeBg = "#0066CC"
countBadgeText = "#FFFFFF"

[view]
background = "#000000"
headerText = "#FFFFFF"
groupHeader = "#8E8E93"
groupHeaderBg = "#2C2C2E"
itemText = "#FFFFFF"
itemTextCompleted = "#48484A"
itemTextDeadline = "#FF453A"
itemTextProject = "#5E5CE6"
selectionBg = "#0066CC"
selectionText = "#FFFFFF"

[statusBar]
background = "#2C2C2E"
text = "#8E8E93"
keyHint = "#FFFFFF"
modeText = "#30D158"

[badge]
background = "#0066CC"
text = "#FFFFFF"
warningBg = "#FF9F0A"
warningText = "#000000"

[search]
inputBg = "#2C2C2E"
inputText = "#FFFFFF"
inputPlaceholder = "#8E8E93"
resultText = "#FFFFFF"
resultMatch = "#0A84FF"

[modal]
background = "#2C2C2E"
borderColor = "#0066CC"
titleText = "#FFFFFF"
bodyText = "#FFFFFF"
inputBg = "#1C1C1E"
inputText = "#FFFFFF"
inputPlaceholder = "#8E8E93"
labelText = "#8E8E93"
buttonBg = "#0066CC"
buttonText = "#FFFFFF"
dangerBg = "#FF453A"
dangerText = "#FFFFFF"
keyHint = "#8E8E93"
`;

export const DEFAULT_KEYBINDINGS_TOML = `[[binding]]
keys = "j"
action = "moveDown"
description = "Move selection down"
context = "global"

[[binding]]
keys = "k"
action = "moveUp"
description = "Move selection up"
context = "global"

[[binding]]
keys = "g g"
action = "goToTop"
description = "Go to top of list"
context = "global"

[[binding]]
keys = "G"
action = "goToBottom"
description = "Go to bottom of list"
context = "global"

[[binding]]
keys = "space"
action = "toggleComplete"
description = "Toggle task completion"
context = "global"

[[binding]]
keys = "return"
action = "openItem"
description = "Open selected item"
context = "global"

[[binding]]
keys = "d"
action = "deleteTask"
description = "Delete selected task"
context = "global"

[[binding]]
keys = "n"
action = "newTask"
description = "Create new task"
context = "global"

[[binding]]
keys = "e"
action = "editTask"
description = "Edit selected task"
context = "global"

[[binding]]
keys = "q"
action = "quit"
description = "Quit application"
context = "global"

[[binding]]
keys = "?"
action = "showHelp"
description = "Show help overlay"
context = "global"

[[binding]]
keys = "/"
action = "startSearch"
description = "Start search"
context = "global"

[[binding]]
keys = "escape"
action = "closeModal"
description = "Close modal / cancel"
context = "modal"

[[binding]]
keys = "tab"
action = "nextSection"
description = "Move to next section"
context = "global"

[[binding]]
keys = "shift+tab"
action = "prevSection"
description = "Move to previous section"
context = "global"

[[binding]]
keys = "1"
action = "navigateTo"
description = "Go to inbox"
context = "global"

[[binding]]
keys = "2"
action = "navigateTo"
description = "Go to today"
context = "global"

[[binding]]
keys = "3"
action = "navigateTo"
description = "Go to upcoming"
context = "global"

[[binding]]
keys = "4"
action = "navigateTo"
description = "Go to anytime"
context = "global"

[[binding]]
keys = "5"
action = "navigateTo"
description = "Go to someday"
context = "global"

[[binding]]
keys = "6"
action = "navigateTo"
description = "Go to logbook"
context = "global"

[[binding]]
keys = "7"
action = "navigateTo"
description = "Go to trash"
context = "global"

[[binding]]
keys = "ctrl+r"
action = "refreshView"
description = "Refresh current view"
context = "global"

[[binding]]
keys = "h"
action = "toggleCollapse"
description = "Toggle section/project collapse"
context = "anytime"

[[binding]]
keys = "escape"
action = "closeModal"
description = "Close search"
context = "search"

[[binding]]
keys = "return"
action = "openItem"
description = "Open selected result"
context = "search"
`;