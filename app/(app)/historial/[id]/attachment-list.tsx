"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { uploadAttachments } from "@/lib/data/attachments";
import { addAttachments } from "@/app/(app)/servicios/actions";
import { Alert, Field, Panel, PanelHeader } from "@/components/ui";
import { deleteAttachment } from "./actions";

type Attachment = { id: string; fileName: string; url: string | null; isImage: boolean };

export function AttachmentList(props: { serviceId: string; userId: string; attachments: Attachment[]; failed: boolean }) {
  const { serviceId, userId, attachments, failed } = props;
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const onDelete = (id: string) =>
    startTransition(async () => {
      const r = await deleteAttachment(id, serviceId);
      setMessage(r.error ?? null);
    });

  const onAdd = (files: File[]) =>
    startTransition(async () => {
      const { uploaded, failed: failedNow } = await uploadAttachments(userId, serviceId, files);
      const saved = await addAttachments(serviceId, uploaded);
      setMessage(failedNow.length > 0 || !saved.ok ? `No se subió: ${failedNow.join(", ") || "intenta de nuevo"}.` : null);
      router.replace(`/historial/${serviceId}`);
    });

  return (
    <Panel as="section" aria-labelledby="comprobantes" className="flex flex-col gap-4">
      <PanelHeader id="comprobantes" title="Comprobantes" className="!pb-0" />
      {failed && (
        <Alert>No se subió la factura. El servicio sí quedó guardado. Vuelve a adjuntarla abajo.</Alert>
      )}
      {attachments.length === 0 && !failed && <p className="text-[13px] text-muted">Aún no hay facturas ni fotos de esta visita.</p>}
      <ul className="flex flex-col gap-3">
        {attachments.map((a) => (
          <li key={a.id} className="flex flex-col gap-3 rounded-3xl bg-bg/60 p-3">
            {a.isImage && a.url && (
              // eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL, not optimizable
              <img src={a.url} alt={a.fileName} className="max-h-80 w-full rounded-2xl object-contain" />
            )}
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="truncate pl-1 font-mono text-[11px] text-muted">{a.fileName}</span>
              <span className="flex shrink-0 gap-2">
                {a.url && (
                  <a href={a.url} target="_blank" rel="noreferrer" className="btn-quiet">
                    Abrir
                  </a>
                )}
                <button type="button" disabled={pending} onClick={() => onDelete(a.id)} className="btn-quiet text-overdue">
                  Borrar
                </button>
              </span>
            </div>
          </li>
        ))}
      </ul>
      <Field label={failed ? "Reintentar adjunto" : "Agregar comprobante"}>
        <input
          type="file"
          multiple
          disabled={pending}
          accept=".pdf,.jpg,.jpeg,.png,.heic,.heif,image/*,application/pdf"
          onChange={(e) => onAdd(Array.from(e.target.files ?? []))}
          className="file-pick"
        />
      </Field>
      {pending && <p className="text-[12px] text-muted">Un momento…</p>}
      {message && (
        <Alert>{message}</Alert>
      )}
    </Panel>
  );
}
