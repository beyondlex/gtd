import { describe, expect, test } from "bun:test";
import { resolveQuickCaptureDeadline } from "../components/modals/quick-capture-deadline.js";

describe("resolveQuickCaptureDeadline", () => {
  test("defaults to end of today for inbox without parsed date", () => {
    const deadline = resolveQuickCaptureDeadline("inbox", null);

    expect(deadline).toBeDefined();
    expect(deadline!.getHours()).toBe(23);
    expect(deadline!.getMinutes()).toBe(59);
    expect(deadline!.getSeconds()).toBe(59);
    expect(deadline!.getTime()).toBeGreaterThan(Date.now());
  });

  test("defaults to end of today for today view without parsed date", () => {
    const deadline = resolveQuickCaptureDeadline("today", null);

    expect(deadline).toBeDefined();
    expect(deadline!.getHours()).toBe(23);
    expect(deadline!.getMinutes()).toBe(59);
    expect(deadline!.getSeconds()).toBe(59);
  });

  test("uses parsed natural-language date in inbox when available", () => {
    const parsed = new Date("2026-05-12T09:00:00.000Z");

    const deadline = resolveQuickCaptureDeadline("inbox", parsed);
    expect(deadline).toBe(parsed);
  });

  test("keeps undefined for anytime without parsed date", () => {
    const deadline = resolveQuickCaptureDeadline("anytime", null);
    expect(deadline).toBeUndefined();
  });
});
