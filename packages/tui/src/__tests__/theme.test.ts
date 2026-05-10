import { test, expect, describe } from "bun:test";
import { loadTheme } from "../theme/load.js";

describe("loadTheme", () => {
  test("loads default theme with all sections", () => {
    const theme = loadTheme();
    expect(theme.name).toBe("gtd-default");
    expect(theme.colors).toBeDefined();
    expect(theme.colors.primary).toBe("#0066CC");
    expect(theme.colors.text).toBe("#FFFFFF");
    expect(theme.colors.background).toBe("#1C1C1E");
    expect(theme.sidebar).toBeDefined();
    expect(theme.sidebar.background).toBe("#1C1C1E");
    expect(theme.sidebar.textActive).toBe("#FFFFFF");
    expect(theme.view).toBeDefined();
    expect(theme.view.itemText).toBe("#FFFFFF");
    expect(theme.view.selectionBg).toBe("#0066CC");
    expect(theme.statusBar).toBeDefined();
    expect(theme.statusBar.background).toBe("#2C2C2E");
    expect(theme.badge).toBeDefined();
    expect(theme.badge.background).toBe("#0066CC");
  });

  test("theme has all required color fields", () => {
    const theme = loadTheme();
    const requiredColorFields = [
      "primary", "secondary", "background", "surface",
      "text", "textMuted", "accent", "error", "success", "warning",
    ];
    for (const field of requiredColorFields) {
      expect((theme.colors as unknown as Record<string, string>)[field]).toBeDefined();
      expect((theme.colors as unknown as Record<string, string>)[field]).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  test("theme has all sidebar fields", () => {
    const theme = loadTheme();
    const requiredFields = [
      "background", "activeItemBg", "hoverItemBg",
      "text", "textActive", "countBadgeBg", "countBadgeText",
    ];
    for (const field of requiredFields) {
      expect((theme.sidebar as unknown as Record<string, string>)[field]).toBeDefined();
    }
  });

  test("theme has all view fields", () => {
    const theme = loadTheme();
    const requiredFields = [
      "background", "headerText", "groupHeader", "groupHeaderBg",
      "itemText", "itemTextCompleted", "itemTextDeadline", "itemTextProject",
      "selectionBg", "selectionText",
    ];
    for (const field of requiredFields) {
      expect((theme.view as unknown as Record<string, string>)[field]).toBeDefined();
    }
  });

  test("theme has all status bar fields", () => {
    const theme = loadTheme();
    expect(theme.statusBar.background).toBeDefined();
    expect(theme.statusBar.text).toBeDefined();
    expect(theme.statusBar.keyHint).toBeDefined();
    expect(theme.statusBar.modeText).toBeDefined();
  });

  test("theme has all badge fields", () => {
    const theme = loadTheme();
    expect(theme.badge.background).toBeDefined();
    expect(theme.badge.text).toBeDefined();
    expect(theme.badge.warningBg).toBeDefined();
    expect(theme.badge.warningText).toBeDefined();
  });

  test("theme has all search fields", () => {
    const theme = loadTheme();
    expect(theme.search).toBeDefined();
    expect(theme.search.inputBg).toBeDefined();
    expect(theme.search.inputText).toBeDefined();
    expect(theme.search.inputPlaceholder).toBeDefined();
    expect(theme.search.resultText).toBeDefined();
    expect(theme.search.resultMatch).toBeDefined();
  });
});