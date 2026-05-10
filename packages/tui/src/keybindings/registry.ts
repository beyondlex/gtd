import type { KeybindingDef } from "./types.js";

export class KeybindingRegistry {
  private bindings = new Map<string, Map<string, KeybindingDef>>();
  private partialSequence: string[] = [];
  private sequenceTimeout: ReturnType<typeof setTimeout> | null = null;
  private readonly SEQUENCE_TIMEOUT_MS = 500;

  constructor(defs: KeybindingDef[]) {
    for (const def of defs) {
      const ctx = def.context ?? "global";
      if (!this.bindings.has(ctx)) {
        this.bindings.set(ctx, new Map());
      }
      this.bindings.get(ctx)!.set(def.keys, def);
    }
  }

  static keyToString(
    input: string,
    key: { ctrl: boolean; shift: boolean; meta: boolean },
  ): string {
    if (key.ctrl) return `ctrl+${input}`;
    if (key.meta) return `meta+${input}`;
    if (input === " ") return "space";
    return input;
  }

  match(
    input: string,
    inkKey: {
      ctrl: boolean;
      shift: boolean;
      meta: boolean;
      escape?: boolean;
      return?: boolean;
      tab?: boolean;
      backspace?: boolean;
      delete?: boolean;
      up?: boolean;
      down?: boolean;
      left?: boolean;
      right?: boolean;
      pageUp?: boolean;
      pageDown?: boolean;
      home?: boolean;
      end?: boolean;
    },
    context = "global",
  ): { action: string; consumed: boolean } | null {
    const combo = KeybindingRegistry.keyToString(input, inkKey);

    const namedKey = inkKey.escape
      ? "escape"
      : inkKey.return
        ? "return"
        : inkKey.tab
          ? (inkKey.shift ? "shift+tab" : "tab")
          : inkKey.up
            ? "up"
            : inkKey.down
              ? "down"
              : inkKey.left
                ? "left"
                : inkKey.right
                  ? "right"
                  : inkKey.backspace
                    ? "backspace"
                    : inkKey.delete
                      ? "delete"
                      : inkKey.pageUp
                        ? "pageUp"
                        : inkKey.pageDown
                          ? "pageDown"
                          : inkKey.home
                            ? "home"
                            : inkKey.end
                              ? "end"
                              : null;

    const effectiveCombo = namedKey ?? combo;
    const ctxMap = this.bindings.get(context) ?? this.bindings.get("global");
    if (!ctxMap) return null;

    // First: try to complete a buffered multi-key sequence
    if (this.partialSequence.length > 0) {
      const seq = [...this.partialSequence, effectiveCombo].join(" ");
      this.clearSequenceTimeout();
      this.partialSequence = [];
      const def = ctxMap.get(seq);
      if (def) return { action: def.action, consumed: true };
      // Sequence didn't match; fall through to single-key match
    }

    // Second: check if this key starts a new multi-key sequence
    const possibleSequences = Array.from(ctxMap.keys()).filter(
      (k) => k.startsWith(effectiveCombo + " "),
    );

    if (possibleSequences.length > 0) {
      this.partialSequence.push(effectiveCombo);
      this.resetSequenceTimeout();
      return { action: "", consumed: true };
    }

    // Finally: single-key lookup
    const def = ctxMap.get(effectiveCombo);
    if (def) return { action: def.action, consumed: true };

    return null;
  }

  private resetSequenceTimeout(): void {
    this.clearSequenceTimeout();
    this.sequenceTimeout = setTimeout(() => {
      this.partialSequence = [];
    }, this.SEQUENCE_TIMEOUT_MS);
  }

  private clearSequenceTimeout(): void {
    if (this.sequenceTimeout) {
      clearTimeout(this.sequenceTimeout);
      this.sequenceTimeout = null;
    }
  }

  getBindings(context = "global"): KeybindingDef[] {
    const ctxMap = this.bindings.get(context) ?? this.bindings.get("global");
    if (!ctxMap) return [];
    return Array.from(ctxMap.values());
  }
}