import { test, expect, describe } from "bun:test";
import { KeybindingRegistry } from "../keybindings/registry.js";
import type { KeybindingDef } from "../keybindings/types.js";

const defaultBindings: KeybindingDef[] = [
  { keys: "j", action: "moveDown", description: "Move down", context: "global" },
  { keys: "k", action: "moveUp", description: "Move up", context: "global" },
  { keys: "g g", action: "goToTop", description: "Go to top", context: "global" },
  { keys: "G", action: "goToBottom", description: "Go to bottom", context: "global" },
  { keys: "space", action: "toggleComplete", description: "Toggle complete", context: "global" },
  { keys: "escape", action: "dismissError", description: "Dismiss error", context: "global" },
  { keys: "escape", action: "closeModal", description: "Close modal", context: "modal" },
  { keys: "q", action: "quit", description: "Quit", context: "global" },
  { keys: "1", action: "navigateTo", description: "Go to inbox", context: "global" },
  { keys: "ctrl+r", action: "refreshView", description: "Refresh", context: "global" },
];

describe("KeybindingRegistry", () => {
  test("matches single key", () => {
    const reg = new KeybindingRegistry(defaultBindings);
    const result = reg.match("j", { ctrl: false, shift: false, meta: false });
    expect(result).toEqual({ action: "moveDown", consumed: true });
  });

  test("matches another single key", () => {
    const reg = new KeybindingRegistry(defaultBindings);
    const result = reg.match("k", { ctrl: false, shift: false, meta: false });
    expect(result).toEqual({ action: "moveUp", consumed: true });
  });

  test("matches space key", () => {
    const reg = new KeybindingRegistry(defaultBindings);
    const result = reg.match(" ", { ctrl: false, shift: false, meta: false });
    expect(result).toEqual({ action: "toggleComplete", consumed: true });
  });

  test("matches ctrl+key combo", () => {
    const reg = new KeybindingRegistry(defaultBindings);
    const result = reg.match("r", { ctrl: true, shift: false, meta: false });
    expect(result).toEqual({ action: "refreshView", consumed: true });
  });

  test("matches named key (escape) in modal context", () => {
    const reg = new KeybindingRegistry(defaultBindings);
    const result = reg.match("", { ctrl: false, shift: false, meta: false, escape: true }, "modal");
    expect(result).toEqual({ action: "closeModal", consumed: true });
  });

  test("returns null for unmatched key", () => {
    const reg = new KeybindingRegistry(defaultBindings);
    const result = reg.match("x", { ctrl: false, shift: false, meta: false });
    expect(result).toBeNull();
  });

  test("context scoping: escape matches dismissError in global, closeModal in modal", () => {
    const reg = new KeybindingRegistry(defaultBindings);
    const globalResult = reg.match("", { ctrl: false, shift: false, meta: false, escape: true }, "global");
    expect(globalResult).toEqual({ action: "dismissError", consumed: true });

    const modalResult = reg.match("", { ctrl: false, shift: false, meta: false, escape: true }, "modal");
    expect(modalResult).toEqual({ action: "closeModal", consumed: true });
  });

  test("multi-key sequence: g g", () => {
    const reg = new KeybindingRegistry(defaultBindings);

    const first = reg.match("g", { ctrl: false, shift: false, meta: false });
    expect(first).toEqual({ action: "", consumed: true });

    const second = reg.match("g", { ctrl: false, shift: false, meta: false });
    expect(second).toEqual({ action: "goToTop", consumed: true });
  });

  test("single key G still works (not confused with g g)", () => {
    const reg = new KeybindingRegistry(defaultBindings);
    const result = reg.match("G", { ctrl: false, shift: false, meta: false });
    expect(result).toEqual({ action: "goToBottom", consumed: true });
  });

  test("getBindings returns bindings for context", () => {
    const reg = new KeybindingRegistry(defaultBindings);
    const globalBindings = reg.getBindings("global");
    expect(globalBindings.length).toBeGreaterThan(0);
    expect(globalBindings.every((b) => (b.context ?? "global") === "global")).toBe(true);
  });

  test("getBindings falls back to global for unknown context", () => {
    const reg = new KeybindingRegistry(defaultBindings);
    const bindings = reg.getBindings("unknown");
    expect(bindings.length).toBeGreaterThan(0);
  });

  test("keyToString handles ctrl prefix", () => {
    const result = KeybindingRegistry.keyToString("r", { ctrl: true, shift: false, meta: false });
    expect(result).toBe("ctrl+r");
  });

  test("keyToString handles meta prefix", () => {
    const result = KeybindingRegistry.keyToString("x", { ctrl: false, shift: false, meta: true });
    expect(result).toBe("meta+x");
  });

  test("keyToString handles space", () => {
    const result = KeybindingRegistry.keyToString(" ", { ctrl: false, shift: false, meta: false });
    expect(result).toBe("space");
  });
});