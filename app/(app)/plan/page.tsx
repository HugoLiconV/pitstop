import { getDueSummary } from "@/lib/data/due";
import { formatDate, formatKm, formatRemaining } from "@/lib/format";
import { setItemActive } from "./actions";
import { ItemForm } from "./item-form";

function intervalText(km: number | null, months: number | null): string {
  const parts = [km && formatKm(km), months && `${months} ${months === 1 ? "mes" : "meses"}`].filter(Boolean);
  return `Cada ${parts.join(" o ")}`;
}

export default async function Plan() {
  const { items, due } = await getDueSummary();
  const dueById = new Map(due.map((d) => [d.item.id, d]));
  const sorted = [...items].sort((a, b) => Number(b.active) - Number(a.active));

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Plan de mantenimiento</h1>
        <p className="text-sm text-muted">Lo que ocurra primero: kilómetros o meses.</p>
      </header>

      <ItemForm label="Agregar mantenimiento" />

      <ul className="flex flex-col divide-y divide-line">
        {sorted.map((item) => {
          const d = dueById.get(item.id);
          return (
            <li key={item.id} className={`flex flex-col gap-1.5 py-4 ${item.active ? "" : "opacity-50"}`}>
              <p className="font-medium">{item.name}</p>
              <p className="figures text-sm">{intervalText(item.interval_km, item.interval_months)}</p>
              <p className="text-xs text-muted">
                {item.source === "manual" ? `Manual Mazda · p. ${item.manual_page}` : "Personalizado"}
              </p>
              {d && (
                <p className="figures text-sm text-muted">
                  {d.last ? `Último: ${formatDate(d.last.date)} · ${formatKm(d.last.km)}` : "Sin registro"} ·{" "}
                  {formatRemaining(d)}
                </p>
              )}
              {item.notes && <p className="text-sm text-muted">{item.notes}</p>}
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
    </div>
  );
}
