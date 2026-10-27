import Link from "next/link";
import { notFound } from "next/navigation";
import { getService, getSignedUrls } from "@/lib/data/history";
import { formatDate, formatKm, formatMxn } from "@/lib/format";
import { requireUser } from "@/lib/supabase/server";
import { AttachmentList } from "./attachment-list";

// Browsers preview these inline; PDF and HEIC open as files.
const PREVIEWABLE = /\.(jpe?g|png)$/i;

export default async function ServiceDetail({ params, searchParams }: PageProps<"/historial/[id]">) {
  const [{ id }, { adjuntos }, user] = await Promise.all([params, searchParams, requireUser()]);
  const service = await getService(id);
  if (!service) notFound();

  const urls = await getSignedUrls(service.attachments.map((a) => a.storage_path));

  return (
    <div className="flex flex-col gap-6">
      <Link href="/historial" className="text-sm text-muted">
        ← Historial
      </Link>
      <header className="flex flex-col gap-1">
        <h1 className="figures text-2xl font-semibold">{formatDate(service.date)}</h1>
        <p className="figures text-muted">
          {formatKm(service.km)}
          {service.workshop ? ` · ${service.workshop}` : ""}
        </p>
        {service.total_cost_mxn !== null && (
          <p className="figures text-xl text-accent-ink">{formatMxn(service.total_cost_mxn)}</p>
        )}
      </header>

      <ul className="divide-y divide-line">
        {service.service_items.map((si) => (
          <li key={si.id} className="flex justify-between gap-3 py-2.5">
            <span>{si.maintenance_items?.name}</span>
            {si.cost_mxn !== null && <span className="figures text-muted">{formatMxn(si.cost_mxn)}</span>}
          </li>
        ))}
      </ul>

      {service.notes && <p className="text-sm whitespace-pre-line">{service.notes}</p>}

      <AttachmentList
        serviceId={service.id}
        userId={user.id}
        failed={adjuntos === "fallidos"}
        attachments={service.attachments.map((a) => ({
          id: a.id,
          fileName: a.file_name,
          url: urls.get(a.storage_path) ?? null,
          isImage: PREVIEWABLE.test(a.file_name),
        }))}
      />
    </div>
  );
}
