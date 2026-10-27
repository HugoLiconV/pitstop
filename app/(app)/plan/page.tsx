import { Suspense } from "react";
import Loading from "../loading";
import { Chip, PageHeader, Panel } from "@/components/ui";
import { getDueSummary } from "@/lib/data/due";
import { formatDate, formatKm, formatRemaining } from "@/lib/format";
import { setItemActive } from "./actions";
import { ItemForm } from "./item-form";

function intervalText(km: number | null, months: number | null): string {
  const parts = [km && formatKm(km), months && `${months} ${months === 1 ? "mes" : "meses"}`].filter(Boolean);
  return `Cada ${parts.join(" o ")}`;
}

async function PlanContent() {
  const { items, due } = await getDueSummary();
  const dueById = new Map(due.map((d) => [d.item.id, d]));
  const sorted = [...items].sort((a, b) => Number(b.active) - Number(a.active));

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Plan de mantenimiento" caption="Lo que ocurra primero: kilómetros o meses." />

      <ItemForm label="Agregar mantenimiento" />

      <Panel as="section" aria-label="Mantenimientos" className="!py-1">
        <ul className="flex flex-col divide-y divide-line">
          {sorted.map((item) => {
            const d = dueById.get(item.id);
            return (
              <li key={item.id} className={`flex flex-col gap-2 py-5 ${item.active ? "" : "opacity-50"}`}>
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[16px] leading-snug">{item.name}</p>
                  <Chip className={`shrink-0 ${item.source === "manual" ? "" : "!bg-ok/15 !text-ok"}`}>
                    {item.source === "manual" ? `Manual p. ${item.manual_page}` : "Personalizado"}
                  </Chip>
                </div>
                <p className="figures text-[20px] font-light tracking-[-0.02em]">{intervalText(item.interval_km, item.interval_months)}</p>
                {d && (
                  <p className="font-mono text-[11px] leading-relaxed text-muted">
                    {d.last ? `Último: ${formatDate(d.last.date)} · ${formatKm(d.last.km)}` : "Sin registro"} ·{" "}
                    {formatRemaining(d)}
                  </p>
                )}
                {item.notes && <p className="text-[13px] leading-relaxed text-muted">{item.notes}</p>}
                <div className="mt-1 flex flex-wrap gap-2">
                  <ItemForm
                    label="Editar"
                    values={{
                      id: item.id,
                      name: item.name,
                      intervalKm: item.interval_km,
                      intervalMonths: item.interval_months,
                      notes: item.notes,
                    }}
                  />
                  <form action={setItemActive.bind(null, item.id, !item.active)}>
                    <button className="btn-quiet">{item.active ? "Desactivar" : "Activar"}</button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      </Panel>
    </div>
  );
}

export default function Plan() {
  return <Suspense fallback={<Loading />}><PlanContent /></Suspense>;
}
