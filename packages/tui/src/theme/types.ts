export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  accent: string;
  error: string;
  success: string;
  warning: string;
}

export interface ThemeSidebar {
  background: string;
  activeItemBg: string;
  hoverItemBg: string;
  text: string;
  textActive: string;
  countBadgeBg: string;
  countBadgeText: string;
}

export interface ThemeView {
  background: string;
  headerText: string;
  groupHeader: string;
  groupHeaderBg: string;
  itemText: string;
  itemTextCompleted: string;
  itemTextDeadline: string;
  itemTextProject: string;
  selectionBg: string;
  selectionText: string;
}

export interface ThemeStatusBar {
  background: string;
  text: string;
  keyHint: string;
  modeText: string;
}

export interface ThemeBadge {
  background: string;
  text: string;
  warningBg: string;
  warningText: string;
}

export interface ThemeSearch {
  inputBg: string;
  inputText: string;
  inputPlaceholder: string;
  resultText: string;
  resultMatch: string;
}

export interface Theme {
  name: string;
  colors: ThemeColors;
  sidebar: ThemeSidebar;
  view: ThemeView;
  statusBar: ThemeStatusBar;
  badge: ThemeBadge;
  search: ThemeSearch;
}