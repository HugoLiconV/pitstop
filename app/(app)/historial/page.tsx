import Link from "next/link";
import { listServices } from "@/lib/data/history";
import { getDueSummary } from "@/lib/data/due";
import { spendTotals } from "@/lib/data/totals";
import { todayInMexico } from "@/lib/due";
import { formatDate, formatKm, formatMxn } from "@/lib/format";

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
        <p className="figures text-sm text-muted">
          Este año {formatMxn(totals.year)} · Total {formatMxn(totals.allTime)}
        </p>
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
        <ul className="divide-y divide-line">
          {services.map((s) => (
            <li key={s.id}>
              <Link href={`/historial/${s.id}`} className="flex flex-col gap-0.5 py-3">
                <span className="figures flex justify-between">
                  <span>{formatDate(s.date)}</span>
                  <span>{s.total_cost_mxn === null ? "—" : formatMxn(s.total_cost_mxn)}</span>
                </span>
                <span className="figures text-sm text-muted">
                  {formatKm(s.km)}
                  {s.workshop ? ` · ${s.workshop}` : ""}
                </span>
                <span className="text-sm">
                  {s.service_items.map((si) => si.maintenance_items?.name).filter(Boolean).join(", ")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
