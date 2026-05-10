import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { parse } from "smol-toml";
import type { Theme } from "./types.js";
import { DEFAULT_THEME_TOML } from "../config/defaults.js";

const CONFIG_DIR = join(homedir(), ".config", "gtd");
const USER_THEME_PATH = join(CONFIG_DIR, "theme.toml");

function ensureConfigDir(): void {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

function writeDefaultConfigs(): void {
  const defaultThemePath = join(CONFIG_DIR, "theme.toml");
  if (!existsSync(defaultThemePath)) {
    writeFileSync(defaultThemePath, DEFAULT_THEME_TOML, "utf-8");
  }
}

export function loadTheme(): Theme {
  ensureConfigDir();
  writeDefaultConfigs();

  const theme = parse(DEFAULT_THEME_TOML) as unknown as Theme;

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