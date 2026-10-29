"use client";

import { useEffect, useRef } from "react";
import { Label } from "@/components/ui";
import { REASONING_LABELS, TOKEN_LIMITS, tokenLabel, type ReasoningEffort, type TokenLimit } from "@/lib/assistant/settings";
import { Segmented } from "./segmented";

const REASONING_OPTIONS = (Object.keys(REASONING_LABELS) as ReasoningEffort[]).map((value) => ({ value, label: REASONING_LABELS[value] }));
const TOKEN_OPTIONS = TOKEN_LIMITS.map((value) => ({ value, label: tokenLabel(value) }));

/** Per-chat knobs for experimenting; changes apply from the next message. */
export function SettingsSheet({ open, onClose, reasoning, tokens, onReasoning, onTokens }: {
  open: boolean;
  onClose: () => void;
  reasoning: ReasoningEffort;
  tokens: TokenLimit;
  onReasoning: (value: ReasoningEffort) => void;
  onTokens: (value: TokenLimit) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return <dialog ref={ref} aria-labelledby="ajustes-titulo" onCancel={(e) => { e.preventDefault(); onClose(); }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    className="m-0 mt-auto w-full max-w-none bg-transparent p-0 backdrop:bg-ink/30 backdrop:backdrop-blur-[2px]">
    <div className="mx-3 mb-[calc(env(safe-area-inset-bottom)+12px)] flex flex-col gap-5 rounded-[28px] bg-card px-5 pt-6 pb-5 shadow-[0_-12px_40px_-20px_rgb(50_40_30/0.5)] sm:mx-auto sm:max-w-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 id="ajustes-titulo" className="text-[19px] font-medium tracking-[-0.02em] text-ink">Ajustes de la conversación</h2>
          <p className="text-[13px] leading-relaxed text-muted">Se aplican desde el siguiente mensaje.</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Cerrar" className="orb -mt-1 -mr-1">
          <svg aria-hidden viewBox="0 0 24 24" className="size-4 fill-none stroke-current stroke-[1.5]"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
      </div>
      <div className="flex flex-col gap-2">
        <Label as="span">Razonamiento</Label>
        <Segmented label="Razonamiento" options={REASONING_OPTIONS} value={reasoning} onChange={onReasoning} wide />
        <p className="text-[12px] leading-relaxed text-muted">Más razonamiento piensa mejor los diagnósticos difíciles, pero tarda y cuesta más.</p>
      </div>
      <div className="flex flex-col gap-2">
        <Label as="span">Máximo de tokens</Label>
        <Segmented label="Máximo de tokens" options={TOKEN_OPTIONS} value={tokens} onChange={onTokens} wide />
        <p className="text-[12px] leading-relaxed text-muted">Incluye lo que el modelo piensa. Si una respuesta se corta, súbelo.</p>
      </div>
    </div>
  </dialog>;
}
