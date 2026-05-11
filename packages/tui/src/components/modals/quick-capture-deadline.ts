export type QuickCaptureDefaultView = "inbox" | "today" | "upcoming" | "anytime" | "someday" | "logbook" | "trash";

function endOfToday(now = new Date()): Date {
  const date = new Date(now);
  date.setHours(23, 59, 59, 999);
  return date;
}

export function resolveQuickCaptureDeadline(currentView: QuickCaptureDefaultView, parsedDeadline: Date | null): Date | undefined {
  if (parsedDeadline) return parsedDeadline;
  if (currentView === "inbox" || currentView === "today" || currentView === "upcoming") return endOfToday();
  return undefined;
}
