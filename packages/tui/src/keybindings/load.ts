import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { parse } from "smol-toml";
import type { KeybindingDef, KeybindingConfig } from "./types.js";
import { KeybindingRegistry } from "./registry.js";
import { DEFAULT_KEYBINDINGS_TOML } from "../config/defaults.js";

const CONFIG_DIR = join(homedir(), ".config", "gtd");
const USER_KEYBINDINGS_PATH = join(CONFIG_DIR, "keybindings.toml");

function ensureConfigDir(): void {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

function writeDefaultConfigs(): void {
  const defaultPath = join(CONFIG_DIR, "keybindings.toml");
  if (!existsSync(defaultPath)) {
    writeFileSync(defaultPath, DEFAULT_KEYBINDINGS_TOML, "utf-8");
  }
}

export function loadKeybindings(): KeybindingRegistry {
  ensureConfigDir();
  writeDefaultConfigs();

  const defaults = parse(DEFAULT_KEYBINDINGS_TOML) as unknown as KeybindingConfig;
  const allBindings: KeybindingDef[] = [...defaults.binding];

  if (existsSync(USER_KEYBINDINGS_PATH)) {
    const userContent = readFileSync(USER_KEYBINDINGS_PATH, "utf-8");
    const userConfig = parse(userContent) as unknown as KeybindingConfig;
    for (const userBinding of userConfig.binding) {
      const idx = allBindings.findIndex(
        (b) =>
          b.keys === userBinding.keys &&
          (b.context ?? "global") === (userBinding.context ?? "global"),
      );
      if (idx >= 0) {
        allBindings[idx] = userBinding;
      } else {
        allBindings.push(userBinding);
      }
    }
  }

  return new KeybindingRegistry(allBindings);
}