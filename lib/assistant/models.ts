// The only models the assistant may call; the database check constraint mirrors this list.
export const MODELS = ["gpt-6-luna", "gpt-6.1-terra"] as const;

export type ModelId = (typeof MODELS)[number];

export const DEFAULT_MODEL: ModelId = "gpt-6-luna";

export const MODEL_LABELS: Record<ModelId, string> = {
  "gpt-6-luna": "Luna",
  "gpt-6.1-terra": "Terra",
};

export function isModelId(value: unknown): value is ModelId {
  return typeof value === "string" && (MODELS as readonly string[]).includes(value);
}
