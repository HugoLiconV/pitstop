"use client";

import { useActionState, useState } from "react";
import { saveItem } from "./actions";

type Values = { id?: string; name: string; intervalKm: number | null; intervalMonths: number | null; notes: string | null };

export function ItemForm({ values, label }: { values?: Values; label: string }) {
  const [state, action, pending] = useActionState(saveItem, {});
  // Open while no save has happened since it was opened (same pattern as the km sheet).
  const [openedAt, setOpenedAt] = useState<number | null>(null);
  const open = openedAt !== null && (state.savedAt ?? 0) < openedAt;

  if (!open) {
    return (
      <button type="button" onClick={() => setOpenedAt(Date.now())} className="btn-quiet self-start">
        {label}
      </button>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-3 rounded-xl border border-line bg-card p-4">
      {values?.id && <input type="hidden" name="id" value={values.id} />}
      <label className="flex flex-col gap-1 text-sm text-muted">
        Nombre
        <input name="name" required defaultValue={values?.name} className="field" />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm text-muted">
          Cada (km)
          <input name="intervalKm" type="number" inputMode="numeric" min={1} defaultValue={values?.intervalKm ?? ""} className="field figures" />
        </label>
        <label className="flex flex-col gap-1 text-sm text-muted">
          Cada (meses)
          <input name="intervalMonths" type="number" inputMode="numeric" min={1} defaultValue={values?.intervalMonths ?? ""} className="field figures" />
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm text-muted">
        Notas
        <textarea name="notes" rows={2} defaultValue={values?.notes ?? ""} className="field" />
      </label>
      {state.error && (
        <p role="alert" className="text-sm text-overdue">
          {state.error}
        </p>
      )}
      <div className="flex gap-2">
        <button disabled={pending} className="btn-primary flex-1">
          {pending ? "Guardando…" : "Guardar"}
        </button>
        <button type="button" onClick={() => setOpenedAt(null)} className="btn-quiet">
          Cancelar
        </button>
      </div>
    </form>
  );
}
