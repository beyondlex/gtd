export interface KeybindingDef {
  keys: string;
  action: string;
  description: string;
  context?: string;
}

export interface KeybindingConfig {
  binding: KeybindingDef[];
}

export interface ParsedKeyCombo {
  ctrl: boolean;
  shift: boolean;
  meta: boolean;
  key: string;
}

export type KeySequence = ParsedKeyCombo[];