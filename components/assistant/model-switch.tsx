"use client";

import { MODEL_LABELS, MODELS, type ModelId } from "@/lib/assistant/models";

/** Two-segment pill: which model answers the next message. */
export function ModelSwitch({ value, onChange, disabled }: { value: ModelId; onChange: (model: ModelId) => void; disabled?: boolean }) {
  return <div role="radiogroup" aria-label="Modelo" className="inline-flex shrink-0 rounded-full bg-bg/80 p-1 shadow-[inset_0_1px_2px_rgb(50_40_30/0.08)]">
    {MODELS.map((model) => {
      const active = model === value;
      return <button key={model} type="button" role="radio" aria-checked={active} disabled={disabled} onClick={() => !active && onChange(model)}
        className={`h-9 min-w-16 rounded-full px-3 text-[12px] transition-colors focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-60 ${active ? "bg-card font-medium text-ink shadow-[0_2px_8px_-4px_rgb(50_40_30/0.35)]" : "text-muted hover:text-ink"}`}>
        {MODEL_LABELS[model]}
      </button>;
    })}
  </div>;
}
