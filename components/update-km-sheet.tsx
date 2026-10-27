"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { updateKm } from "@/app/(app)/odometro/actions";

export function UpdateKmSheet({ currentKm, children }: { currentKm: number; children?: React.ReactNode }) {
  const [state, action, pending] = useActionState(updateKm, {});
  // The sheet is open while no save has happened since it was opened.
  const [openedAt, setOpenedAt] = useState<number | null>(null);
  const open = openedAt !== null && (state.savedAt ?? 0) < openedAt;
  const setOpen = (value: boolean) => setOpenedAt(value ? Date.now() : null);
  const input = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (open) input.current?.focus();
    else if (wasOpen.current) trigger.current?.focus();
    wasOpen.current = open;
  }, [open]);

  if (!open) {
    return (
      <button
        ref={trigger}
        type="button"
        aria-label="Actualizar kilometraje"
        onClick={() => setOpen(true)}
        className="-mx-2 inline-flex cursor-pointer px-2 py-1 text-inherit transition-colors hover:bg-current/10 focus-visible:outline-2 focus-visible:outline-accent"
      >
        {children ?? "Actualizar"}
      </button>
    );
  }

  return (
    <form action={action} onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }} className="absolute right-0 top-full z-20 mt-2 flex w-[min(22rem,calc(100vw-40px))] flex-col gap-3 border border-ink bg-card p-4 text-left shadow-lg">
      <label className="flex flex-col gap-1 text-sm text-muted">
        Kilometraje actual
        <input
          ref={input}
          name="km"
          type="number"
          inputMode="numeric"
          min={0}
          required
          defaultValue={state.km ?? currentKm}
          key={state.km}
          className="field figures text-lg"
        />
      </label>
      {state.error && (
        <p role="alert" className="text-sm text-overdue">
          {state.error}
        </p>
      )}
      <div className="flex gap-2">
        {state.needsConfirm ? (
          <button name="confirmJump" value="1" disabled={pending} className="btn-primary flex-1">
            Sí, es correcto
          </button>
        ) : (
          <button disabled={pending} className="btn-primary flex-1">
            {pending ? "Guardando…" : "Guardar"}
          </button>
        )}
        <button type="button" onClick={() => setOpen(false)} className="btn-quiet">
          Cancelar
        </button>
      </div>
    </form>
  );
}
