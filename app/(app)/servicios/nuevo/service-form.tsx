"use client";

import { useRouter } from "next/navigation";
import { startTransition, useActionState, useEffect, useRef, useState, type FormEvent } from "react";
import type { DueStatus } from "@/lib/due";
import { uploadAttachments } from "@/lib/data/attachments";
import { addAttachments, createService } from "../actions";

type Option = { id: string; name: string; status: DueStatus };

const statusLabel: Record<DueStatus, string> = { vencido: "Vencido", proximo: "Próximo", ok: "" };

export function ServiceForm(props: { userId: string; today: string; currentKm: number; options: Option[] }) {
  const { userId, today, currentKm, options } = props;
  const router = useRouter();
  const [state, action, pending] = useActionState(createService, {});
  const [files, setFiles] = useState<File[]>([]);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [uploading, setUploading] = useState(false);
  // One token per form: retries and double taps resolve to the same service on the server.
  const [clientToken] = useState(() => crypto.randomUUID());
  const submitting = useRef(false);

  // Once the service is saved, upload receipts, then go to its detail page.
  useEffect(() => {
    const serviceId = state.serviceId;
    if (!serviceId) return;
    let cancelled = false;
    (async () => {
      setUploading(true);
      const { uploaded, failed } = await uploadAttachments(userId, serviceId, files);
      const saved = await addAttachments(serviceId, uploaded);
      if (cancelled) return;
      const query = failed.length > 0 || !saved.ok ? "?adjuntos=fallidos" : "";
      router.replace(`/historial/${serviceId}${query}`);
    })();
    return () => {
      cancelled = true;
    };
    // files and userId are fixed once the service is saved.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.serviceId]);

  const busy = pending || uploading || Boolean(state.serviceId);
  const err = state.errors ?? {};

  // Submitting manually avoids React's automatic form reset, so an error keeps what was typed.
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    const submitter = (e.nativeEvent as SubmitEvent).submitter;
    const data = new FormData(e.currentTarget, submitter);
    startTransition(async () => {
      await action(data);
      submitting.current = false;
    });
  };

  const toggle = (id: string) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <input type="hidden" name="clientToken" value={clientToken} />
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm text-muted">
          Fecha
          <input name="date" type="date" required defaultValue={today} max={today} className="field" />
          {err.date && <span className="text-overdue">{err.date}</span>}
        </label>
        <label className="flex flex-col gap-1 text-sm text-muted">
          Kilometraje
          <input name="km" type="number" inputMode="numeric" min={0} required defaultValue={currentKm} className="field figures" />
        </label>
      </div>
      {err.km && (
        <p role="alert" className="-mt-3 text-sm text-overdue">
          {err.km}
        </p>
      )}

      <label className="flex flex-col gap-1 text-sm text-muted">
        Taller
        <input name="workshop" placeholder="Agencia Mazda, taller de confianza…" className="field" />
      </label>
      <label className="flex flex-col gap-1 text-sm text-muted">
        Costo total (MXN)
        <input name="totalCostMxn" type="number" inputMode="decimal" min={0} step="0.01" className="field figures" />
        {err.totalCostMxn && <span className="text-overdue">{err.totalCostMxn}</span>}
      </label>

      <fieldset className="flex flex-col gap-1">
        <legend className="mb-2 text-sm text-muted">¿Qué se hizo?</legend>
        {err.items && (
          <p role="alert" className="mb-2 text-sm text-overdue">
            {err.items}
          </p>
        )}
        <ul className="divide-y divide-line rounded-xl border border-line bg-card">
          {options.map((o) => (
            <li key={o.id} className="flex items-center gap-3 px-3 py-2.5">
              <label className="flex flex-1 items-center gap-3">
                <input
                  type="checkbox"
                  name="item"
                  value={o.id}
                  checked={checked.has(o.id)}
                  onChange={() => toggle(o.id)}
                  className="size-5 accent-[var(--accent)]"
                />
                <span className="flex-1">
                  {o.name}
                  {o.status !== "ok" && (
                    <span className={`ml-2 text-xs ${o.status === "vencido" ? "text-overdue" : "text-due-soon"}`}>
                      {statusLabel[o.status]}
                    </span>
                  )}
                </span>
              </label>
              {checked.has(o.id) && (
                <input
                  name={`cost-${o.id}`}
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="0.01"
                  placeholder="$"
                  aria-label={`Costo de ${o.name}`}
                  className="field figures w-24 py-1.5"
                />
              )}
            </li>
          ))}
        </ul>
      </fieldset>

      <label className="flex flex-col gap-1 text-sm text-muted">
        Notas
        <textarea name="notes" rows={2} className="field" />
      </label>

      <label className="flex flex-col gap-1 text-sm text-muted">
        Factura o fotos (PDF, JPG, PNG o HEIC · máx. 10 MB)
        <input
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.heic,.heif,image/*,application/pdf"
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          className="text-sm text-ink file:mr-3 file:rounded-lg file:border file:border-line file:bg-card file:px-3 file:py-2 file:text-ink"
        />
        {files.length > 0 && <span>{files.length === 1 ? "1 archivo" : `${files.length} archivos`}</span>}
      </label>

      {err.form && (
        <p role="alert" className="text-sm text-overdue">
          {err.form}
        </p>
      )}

      {state.needsConfirm ? (
        <button name="confirmJump" value="1" disabled={busy} className="btn-primary">
          Sí, el kilometraje es correcto
        </button>
      ) : (
        <button disabled={busy} className="btn-primary">
          {uploading ? "Subiendo archivos…" : busy ? "Guardando…" : "Guardar servicio"}
        </button>
      )}
    </form>
  );
}
