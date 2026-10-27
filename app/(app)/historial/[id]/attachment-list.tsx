"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { uploadAttachments } from "@/lib/data/attachments";
import { addAttachments } from "@/app/(app)/servicios/actions";
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
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold tracking-wide text-muted uppercase">Comprobantes</h2>
      {failed && (
        <p role="alert" className="rounded-xl border border-overdue/40 bg-card p-3 text-sm">
          No se subió la factura. El servicio sí quedó guardado. Vuelve a adjuntarla abajo.
        </p>
      )}
      {attachments.length === 0 && !failed && <p className="text-sm text-muted">Sin comprobantes.</p>}
      <ul className="flex flex-col gap-3">
        {attachments.map((a) => (
          <li key={a.id} className="flex flex-col gap-2 rounded-xl border border-line bg-card p-3">
            {a.isImage && a.url && (
              // eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL, not optimizable
              <img src={a.url} alt={a.fileName} className="max-h-80 w-full rounded-lg object-contain" />
            )}
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="truncate">{a.fileName}</span>
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
      <label className="flex flex-col gap-1 text-sm text-muted">
        {failed ? "Reintentar adjunto" : "Agregar comprobante"}
        <input
          type="file"
          multiple
          disabled={pending}
          accept=".pdf,.jpg,.jpeg,.png,.heic,.heif,image/*,application/pdf"
          onChange={(e) => onAdd(Array.from(e.target.files ?? []))}
          className="text-sm text-ink file:mr-3 file:rounded-lg file:border file:border-line file:bg-card file:px-3 file:py-2 file:text-ink"
        />
      </label>
      {pending && <p className="text-sm text-muted">Un momento…</p>}
      {message && (
        <p role="alert" className="text-sm text-overdue">
          {message}
        </p>
      )}
    </section>
  );
}
