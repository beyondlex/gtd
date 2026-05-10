import * as chrono from "chrono-node";
import {
  format,
  isToday as fnsIsToday,
  isPast,
  isFuture,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  addDays,
  differenceInDays,
  parseISO,
} from "date-fns";

export function parseNaturalDate(input: string): Date | null {
  const results = chrono.parse(input);
  if (results.length === 0) return null;
  return results[0].start.date();
}

export function formatDate(date: Date): string {
  if (fnsIsToday(date)) return "Today";
  const tomorrow = addDays(new Date(), 1);
  if (format(date, "yyyy-MM-dd") === format(tomorrow, "yyyy-MM-dd")) return "Tomorrow";
  return format(date, "EEE, MMM d");
}

export function formatDateShort(date: Date): string {
  return format(date, "MMM d");
}

export function formatDateFull(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function isOverdue(date: Date): boolean {
  return isPast(date) && !fnsIsToday(date);
}

export function isToday(date: Date): boolean {
  return fnsIsToday(date);
}

export function isThisWeek(date: Date): boolean {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  return date >= weekStart && date <= weekEnd;
}

export function toISOString(date: Date): string {
  return date.toISOString();
}

export function fromISOString(str: string): Date {
  return parseISO(str);
}

export function daysUntil(date: Date): number {
  return differenceInDays(startOfDay(date), startOfDay(new Date()));
}

export { startOfDay, endOfDay, addDays, format, parseISO };