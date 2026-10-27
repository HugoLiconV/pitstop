"use client";

import { useActionState, useState } from "react";
import { Alert, Field, PillAction } from "@/components/ui";
import { saveItem } from "./actions";

type Values = { id?: string; name: string; intervalKm: number | null; intervalMonths: number | null; notes: string | null };

export function ItemForm({ values, label }: { values?: Values; label: string }) {
  const [state, action, pending] = useActionState(saveItem, {});
  // Open while no save has happened since it was opened (same pattern as the km sheet).
  const [openedAt, setOpenedAt] = useState<number | null>(null);
  const open = openedAt !== null && (state.savedAt ?? 0) < openedAt;

  if (!open) {
    // The "add" entry is the page's primary action; per-row edits stay quiet.
    return values ? (
      <button type="button" onClick={() => setOpenedAt(Date.now())} className="btn-quiet self-start">
        {label}
      </button>
    ) : (
      <PillAction type="button" onClick={() => setOpenedAt(Date.now())}>{label}</PillAction>
    );
  }

  return (
    <form action={action} className={`flex w-full flex-col gap-4 ${values ? "mt-2 rounded-3xl bg-bg/60 p-4" : "panel p-5"}`}>
      {values?.id && <input type="hidden" name="id" value={values.id} />}
      <Field label="Nombre">
        <input name="name" required defaultValue={values?.name} className="field" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Cada (km)">
          <input name="intervalKm" type="number" inputMode="numeric" min={1} defaultValue={values?.intervalKm ?? ""} className="field figures" />
        </Field>
        <Field label="Cada (meses)">
          <input name="intervalMonths" type="number" inputMode="numeric" min={1} defaultValue={values?.intervalMonths ?? ""} className="field figures" />
        </Field>
      </div>
      <Field label="Notas">
        <textarea name="notes" rows={2} defaultValue={values?.notes ?? ""} className="field" />
      </Field>
      {state.error && <Alert>{state.error}</Alert>}
      <div className="flex items-center gap-2">
        <PillAction disabled={pending} arrow={false} className="flex-1">
          {pending ? "Guardando…" : "Guardar"}
        </PillAction>
        <button type="button" onClick={() => setOpenedAt(null)} className="btn-quiet h-13 px-5">
          Cancelar
        </button>
      </div>
    </form>
  );
}
