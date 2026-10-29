"use client";

import { MODEL_LABELS, MODELS, type ModelId } from "@/lib/assistant/models";
import { Segmented } from "./segmented";

const OPTIONS = MODELS.map((model) => ({ value: model, label: MODEL_LABELS[model] }));

/** Which model answers the next message. */
export function ModelSwitch({ value, onChange, disabled }: { value: ModelId; onChange: (model: ModelId) => void; disabled?: boolean }) {
  return <Segmented label="Modelo" options={OPTIONS} value={value} onChange={onChange} disabled={disabled} />;
}
