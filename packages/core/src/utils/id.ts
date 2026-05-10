import { randomUUID } from "node:crypto";

/** Generate a UUID v7 (time-ordered) ID */
export function generateId(): string {
  return randomUUID();
}