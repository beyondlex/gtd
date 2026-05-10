import { readFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { parse } from "smol-toml";
import type { KeybindingDef, KeybindingConfig } from "./types.js";
import { KeybindingRegistry } from "./registry.js";

const CONFIG_DIR = join(homedir(), ".config", "gtd");
const USER_KEYBINDINGS_PATH = join(CONFIG_DIR, "keybindings.toml");
const DEFAULT_KEYBINDINGS_PATH = new URL(
  "../../config/default-keybindings.toml",
  import.meta.url,
).pathname;

export function loadKeybindings(): KeybindingRegistry {
  const defaultContent = readFileSync(DEFAULT_KEYBINDINGS_PATH, "utf-8");
  const defaults = parse(defaultContent) as unknown as KeybindingConfig;
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