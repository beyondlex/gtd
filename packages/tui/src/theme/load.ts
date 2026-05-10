import { readFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { parse } from "smol-toml";
import type { Theme } from "./types.js";

const CONFIG_DIR = join(homedir(), ".config", "gtd");
const USER_THEME_PATH = join(CONFIG_DIR, "theme.toml");
const DEFAULT_THEME_PATH = new URL(
  "../../config/default-theme.toml",
  import.meta.url,
).pathname;

export function loadTheme(): Theme {
  const defaultContent = readFileSync(DEFAULT_THEME_PATH, "utf-8");
  const theme = parse(defaultContent) as unknown as Theme;

  if (existsSync(USER_THEME_PATH)) {
    const userContent = readFileSync(USER_THEME_PATH, "utf-8");
    const userTheme = parse(userContent) as Partial<Theme>;
    deepMerge(theme as unknown as Record<string, unknown>, userTheme as unknown as Record<string, unknown>);
  }

  return theme;
}

function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): void {
  for (const key of Object.keys(source)) {
    const val = source[key as keyof typeof source];
    if (val && typeof val === "object" && !Array.isArray(val)) {
      deepMerge(target[key] as Record<string, unknown>, val as Record<string, unknown>);
    } else if (val !== undefined) {
      target[key] = val;
    }
  }
}