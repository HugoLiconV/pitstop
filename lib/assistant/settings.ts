// Per-chat knobs for experimenting; the database check constraints mirror these lists.
export const REASONING_LABELS = {
  none: "Ninguno",
  low: "Bajo",
  medium: "Medio",
  high: "Alto",
} as const;

export type ReasoningEffort = keyof typeof REASONING_LABELS;

export const DEFAULT_REASONING: ReasoningEffort = "low";

// Output cap includes reasoning tokens, so it stays generous.
export const TOKEN_LIMITS = [4000, 8000, 16000] as const;

export type TokenLimit = (typeof TOKEN_LIMITS)[number];

export const DEFAULT_TOKEN_LIMIT: TokenLimit = 4000;

export function isReasoningEffort(value: unknown): value is ReasoningEffort {
  return typeof value === "string" && Object.hasOwn(REASONING_LABELS, value);
}

export function isTokenLimit(value: unknown): value is TokenLimit {
  return typeof value === "number" && (TOKEN_LIMITS as readonly number[]).includes(value);
}

export function tokenLabel(limit: TokenLimit): string {
  return `${limit / 1000}k`;
}
