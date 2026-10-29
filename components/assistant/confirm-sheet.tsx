"use client";

import { useEffect, useRef } from "react";

/** In-app confirmation (never a browser dialog): a bottom sheet over a dimmed page. */
export function ConfirmSheet({ open, title, body, confirmLabel, onConfirm, onCancel, pending }: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  pending?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return <dialog ref={ref} onCancel={(e) => { e.preventDefault(); onCancel(); }} onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    className="m-0 mt-auto w-full max-w-none bg-transparent p-0 backdrop:bg-ink/30 backdrop:backdrop-blur-[2px]">
    <div className="mx-auto mb-[calc(env(safe-area-inset-bottom)+12px)] flex max-w-md flex-col gap-4 rounded-[28px] bg-card px-5 pt-6 pb-5 mx-3 shadow-[0_-12px_40px_-20px_rgb(50_40_30/0.5)]">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-[19px] font-medium tracking-[-0.02em] text-ink">{title}</h2>
        <p className="text-[14px] leading-relaxed text-muted">{body}</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={onCancel} className="btn-quiet h-12">Cancelar</button>
        <button type="button" onClick={onConfirm} disabled={pending} className="h-12 rounded-full bg-overdue text-[15px] font-medium text-card disabled:opacity-60">{confirmLabel}</button>
      </div>
    </div>
  </dialog>;
}
