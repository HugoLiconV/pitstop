import Link from "next/link";
import { Chip, PageHeader, Panel, PanelHeader, PillAction, Stat } from "@/components/ui";
import { listServices } from "@/lib/data/history";
import { getDueSummary } from "@/lib/data/due";
import { spendTotals } from "@/lib/data/totals";
import { todayInMexico } from "@/lib/due";
import { formatKm, formatMxn } from "@/lib/format";

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function byYear<T extends { date: string }>(list: T[]): [string, T[]][] {
  const groups = new Map<string, T[]>();
  for (const s of list) groups.set(s.date.slice(0, 4), [...(groups.get(s.date.slice(0, 4)) ?? []), s]);
  return [...groups];
}

export default async function Historial({ searchParams }: PageProps<"/historial">) {
  const { item } = await searchParams;
  const itemId = typeof item === "string" ? item : undefined;
  const [services, all, { items }] = await Promise.all([
    listServices({ itemId }),
    itemId ? listServices() : null,
    getDueSummary(),
  ]);
  const totals = spendTotals(
    (all ?? services).map((s) => ({ date: s.date, totalCostMxn: s.total_cost_mxn })),
    todayInMexico(),
  );
  const filterName = itemId ? items.find((i) => i.id === itemId)?.name : undefined;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Historial" caption="Cada visita al taller, con lo que se hizo y lo que costó." />

      <Panel>
        <dl className="grid grid-cols-2 gap-4">
          <Stat label="Este año" value={formatMxn(totals.year)} tone="accent" />
          <Stat label="Desde el inicio" value={formatMxn(totals.allTime)} className="border-l border-line pl-4" />
        </dl>
      </Panel>

      <form className="flex items-center gap-2">
        <span className="relative flex-1">
          <select name="item" defaultValue={itemId ?? ""} aria-label="Filtrar por mantenimiento" className="h-11 w-full cursor-pointer appearance-none truncate rounded-full bg-card pr-9 pl-4 text-[13px] text-ink shadow-[0_4px_14px_-10px_rgb(60_50_40/0.5)] outline-none focus-visible:ring-2 focus-visible:ring-accent/40">
            <option value="">Todos los servicios</option>
            {items.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
          <svg aria-hidden viewBox="0 0 16 16" className="pointer-events-none absolute top-1/2 right-4 size-3 -translate-y-1/2 fill-none stroke-current stroke-[1.5]"><path d="m4 6 4 4 4-4" /></svg>
        </span>
        <button className="btn-quiet h-11">Filtrar</button>
      </form>

      {services.length === 0 ? (
        <Panel className="flex flex-col gap-5">
          <p className="text-[15px] leading-relaxed">
            {filterName ? `Aún no hay registros de ${filterName.toLowerCase()}.` : "Aún no hay servicios registrados."}
          </p>
          <PillAction href="/servicios/nuevo">Registrar servicio</PillAction>
        </Panel>
      ) : (
        byYear(services).map(([year, list]) => (
          <Panel as="section" key={year} aria-labelledby={`anio-${year}`} className="!pb-2">
            <PanelHeader
              id={`anio-${year}`}
              title={<span className="figures">{year}</span>}
              action={<Chip className="figures">{formatMxn(list.reduce((sum, s) => sum + (s.total_cost_mxn ?? 0), 0))}</Chip>}
            />
            <ul className="flex flex-col">
              {list.map((s) => {
                const [, m, d] = s.date.split("-");
                return (
                  <li key={s.id} className="border-t border-line">
                    <Link href={`/historial/${s.id}`} className="group -mx-2 flex gap-4 rounded-2xl px-2 py-4 transition-colors hover:bg-bg/50 focus-visible:outline-2 focus-visible:outline-accent">
                      <span className="flex w-12 shrink-0 flex-col items-center justify-center rounded-2xl bg-bg py-2 leading-none">
                        <span className="figures text-[20px] font-light">{d}</span>
                        <span className="label mt-1">{MONTHS[Number(m) - 1]}</span>
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col gap-1">
                        <span className="flex items-baseline justify-between gap-3">
                          <span className="truncate text-[15px]">{s.workshop ?? "Servicio"}</span>
                          <span className="figures shrink-0 text-[15px]">{s.total_cost_mxn === null ? "" : formatMxn(s.total_cost_mxn)}</span>
                        </span>
                        <span className="font-mono text-[11px] text-muted">{formatKm(s.km)}</span>
                        <span className="text-[13px] leading-snug text-muted">
                          {s.service_items.map((si) => si.maintenance_items?.name).filter(Boolean).join(", ")}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Panel>
        ))
      )}
    </div>
  );
}
