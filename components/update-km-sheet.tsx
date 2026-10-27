"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { updateKm } from "@/app/(app)/odometro/actions";

export function UpdateKmSheet({ currentKm }: { currentKm: number }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(updateKm, {});
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.savedAt) setOpen(false);
  }, [state.savedAt]);

  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn-quiet">
        Actualizar km
      </button>
    );
  }

  return (
    <form action={action} className="flex basis-full flex-col gap-3 rounded-xl border border-line bg-card p-4">
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
