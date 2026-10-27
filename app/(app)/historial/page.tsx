import Link from "next/link";
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
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Historial</h1>
        <dl className="mt-2 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-card p-3 ring-1 ring-line">
            <dt className="text-sm text-muted">Este año</dt>
            <dd className="figures text-2xl font-semibold text-accent-ink">{formatMxn(totals.year)}</dd>
          </div>
          <div className="rounded-xl bg-card p-3 ring-1 ring-line">
            <dt className="text-sm text-muted">Desde el inicio</dt>
            <dd className="figures text-2xl font-semibold">{formatMxn(totals.allTime)}</dd>
          </div>
        </dl>
      </header>

      <form className="flex gap-2">
        <select name="item" defaultValue={itemId ?? ""} className="field flex-1 text-sm" aria-label="Filtrar por mantenimiento">
          <option value="">Todos los servicios</option>
          {items.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name}
            </option>
          ))}
        </select>
        <button className="btn-quiet">Filtrar</button>
      </form>

      {services.length === 0 ? (
        <p className="rounded-xl border border-line bg-card p-4 text-sm">
          {filterName ? `Aún no hay registros de ${filterName.toLowerCase()}.` : "Aún no hay servicios registrados."}
        </p>
      ) : (
        <div className="flex flex-col gap-8">
          {byYear(services).map(([year, list]) => (
            <section key={year} className="flex flex-col gap-2">
              <h2 className="flex items-baseline justify-between border-b border-line pb-2">
                <span className="figures text-lg font-semibold">{year}</span>
                <span className="figures text-sm text-muted">
                  {formatMxn(list.reduce((sum, s) => sum + (s.total_cost_mxn ?? 0), 0))}
                </span>
              </h2>
              <ul className="flex flex-col">
                {list.map((s) => {
                  const [, m, d] = s.date.split("-");
                  return (
                    <li key={s.id}>
                      <Link href={`/historial/${s.id}`} className="-mx-2 flex gap-4 rounded-lg px-2 py-3 transition-colors hover:bg-card">
                        <span className="figures flex w-11 shrink-0 flex-col items-center rounded-lg bg-card py-1.5 leading-none ring-1 ring-line">
                          <span className="text-xl font-semibold">{d}</span>
                          <span className="mt-1 text-xs text-muted">{MONTHS[Number(m) - 1]}</span>
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <span className="flex items-baseline justify-between gap-3">
                            <span className="truncate font-medium">{s.workshop ?? "Servicio"}</span>
                            <span className="figures shrink-0">{s.total_cost_mxn === null ? "" : formatMxn(s.total_cost_mxn)}</span>
                          </span>
                          <span className="figures text-sm text-muted">{formatKm(s.km)}</span>
                          <span className="text-sm leading-snug">
                            {s.service_items.map((si) => si.maintenance_items?.name).filter(Boolean).join(", ")}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
