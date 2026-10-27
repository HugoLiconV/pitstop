import { Chip, Label, PageHeader, Panel } from "@/components/ui";
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
    <div className="flex flex-col gap-4">
      <PageHeader title={<span className="figures">{formatDate(service.date)}</span>} back={{ href: "/historial", label: "Historial" }}>
        <div className="flex flex-wrap gap-1.5">
          <Chip className="figures">{formatKm(service.km)}</Chip>
          {service.workshop && <Chip>{service.workshop}</Chip>}
        </div>
      </PageHeader>

      <Panel as="section" aria-labelledby="hecho" className="!pb-2">
        <div className="flex items-end justify-between gap-4 pb-4">
          <h2 id="hecho" className="text-[22px] font-light tracking-[-0.035em]">Lo que se hizo</h2>
          {service.total_cost_mxn !== null && (
            <p className="figures text-[26px] font-light leading-none tracking-[-0.03em] text-accent-ink">{formatMxn(service.total_cost_mxn)}</p>
          )}
        </div>
        <ul className="flex flex-col">
          {service.service_items.map((si) => (
            <li key={si.id} className="flex min-h-13 items-baseline justify-between gap-3 border-t border-line py-3.5 text-[14px]">
              <span>{si.maintenance_items?.name}</span>
              {si.cost_mxn !== null && <span className="figures text-muted">{formatMxn(si.cost_mxn)}</span>}
            </li>
          ))}
        </ul>
      </Panel>

      {service.notes && (
        <Panel as="section">
          <Label as="h2" className="mb-2">Notas</Label>
          <p className="text-[14px] leading-relaxed whitespace-pre-line">{service.notes}</p>
        </Panel>
      )}

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
