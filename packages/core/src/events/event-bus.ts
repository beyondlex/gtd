export type EventPayload = {
  "area:created": { area: import("../models/types.js").Area };
  "area:updated": { area: import("../models/types.js").Area };
  "area:deleted": { areaId: string };

  "project:created": { project: import("../models/types.js").Project };
  "project:updated": { project: import("../models/types.js").Project };
  "project:completed": { projectId: string };
  "project:deleted": { projectId: string };

  "task:created": { task: import("../models/types.js").Task };
  "task:updated": { task: import("../models/types.js").Task };
  "task:completed": { taskId: string };
  "task:deleted": { taskId: string };
  "task:restored": { task: import("../models/types.js").Task };
  "task:moved": { taskId: string; from: string | null; to: string | null };

  "tag:created": { tag: import("../models/types.js").Tag };
  "tag:updated": { tag: import("../models/types.js").Tag };
  "tag:deleted": { tagId: string };
};

export type EventName = keyof EventPayload;

export type EventHandler<E extends EventName> = (payload: EventPayload[E]) => void;

export class EventBus {
  private listeners = new Map<EventName, Set<(...args: unknown[]) => void>>();

  on<E extends EventName>(event: E, handler: EventHandler<E>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler as (...args: unknown[]) => void);
    return () => {
      this.listeners.get(event)?.delete(handler as (...args: unknown[]) => void);
    };
  }

  off<E extends EventName>(event: E, handler: EventHandler<E>): void {
    this.listeners.get(event)?.delete(handler as (...args: unknown[]) => void);
  }

  emit<E extends EventName>(event: E, payload: EventPayload[E]): void {
    this.listeners.get(event)?.forEach((handler) => {
      handler(payload);
    });
  }

  clear(): void {
    this.listeners.clear();
  }
}