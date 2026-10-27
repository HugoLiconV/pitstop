"use client";

import { KmInput } from "@/components/km-input";
import { Alert, Field, Panel, PanelHeader, PillAction } from "@/components/ui";
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
  const [checked, setChecked] = useState<Set<string>>(() => new Set());
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
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <input type="hidden" name="clientToken" value={clientToken} />
      <Panel as="section" aria-labelledby="visita" className="flex flex-col gap-4">
        <PanelHeader id="visita" title="La visita" className="!pb-0" />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Fecha" error={err.date}>
            <input name="date" type="date" required defaultValue={today} max={today} className="field h-12 !py-0" />
          </Field>
          <Field label="Kilometraje">
            <KmInput initialValue={currentKm} />
          </Field>
        </div>
        {err.km && <Alert>{err.km}</Alert>}
        <Field label="Taller">
          <input name="workshop" placeholder="Agencia Mazda, taller de confianza…" className="field" />
        </Field>
        <Field label="Costo total (MXN)" error={err.totalCostMxn}>
          <input name="totalCostMxn" type="number" inputMode="decimal" min={0} step="0.01" placeholder="$" className="field figures" />
        </Field>
      </Panel>

      <Panel as="section" className="!pb-2">
        <fieldset className="flex flex-col">
          <legend className="pb-1 text-[22px] font-light tracking-[-0.035em]">¿Qué se hizo?</legend>
          <p className="mb-3 text-[12px] text-muted">Lo pendiente va primero. Agrega el costo de cada uno si lo tienes.</p>
          {err.items && <div className="mb-3"><Alert>{err.items}</Alert></div>}
          <ul className="flex flex-col">
            {options.map((o) => (
              <li key={o.id} className="flex min-h-14 items-center gap-3 border-t border-line py-2">
                <label className="flex flex-1 cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    name="item"
                    value={o.id}
                    checked={checked.has(o.id)}
                    onChange={() => toggle(o.id)}
                    className="peer sr-only"
                  />
                  <span aria-hidden className="flex size-6 shrink-0 items-center justify-center rounded-full border border-line bg-bg text-card transition-colors peer-checked:border-ink peer-checked:bg-ink peer-focus-visible:ring-2 peer-focus-visible:ring-accent/50">
                    <svg viewBox="0 0 16 16" className="size-3 fill-none stroke-current stroke-2"><path d="m3.5 8.5 3 3 6-7" /></svg>
                  </span>
                  <span className="flex flex-1 flex-col gap-0.5 text-[14px] leading-snug">
                    {o.name}
                    {o.status !== "ok" && (
                      <span className={`font-mono text-[10.5px] uppercase tracking-[0.08em] ${o.status === "vencido" ? "text-overdue" : "text-due-soon"}`}>
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
                    className="field figures w-24 !rounded-full !py-1.5 text-right"
                  />
                )}
              </li>
            ))}
          </ul>
        </fieldset>
      </Panel>

      <Panel as="section" className="flex flex-col gap-4">
        <Field label="Notas">
          <textarea name="notes" rows={2} placeholder="Lo que te dijo el mecánico, piezas, garantías…" className="field" />
        </Field>
        <Field label="Factura o fotos · PDF, JPG, PNG o HEIC · máx. 10 MB">
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.heic,.heif,image/*,application/pdf"
            onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
            className="file-pick"
          />
          {files.length > 0 && <span className="text-[12px] text-muted">{files.length === 1 ? "1 archivo" : `${files.length} archivos`}</span>}
        </Field>
      </Panel>

      {err.form && <Alert>{err.form}</Alert>}

      {state.needsConfirm ? (
        <PillAction name="confirmJump" value="1" disabled={busy}>
          Sí, el kilometraje es correcto
        </PillAction>
      ) : (
        <PillAction disabled={busy}>
          {uploading ? "Subiendo archivos…" : busy ? "Guardando…" : "Guardar servicio"}
        </PillAction>
      )}
    </form>
  );
}
