import type { ItemDue } from "@/lib/due";
import { formatKm, formatMxn, formatRemaining } from "@/lib/format";

export interface CarContextInput {
  vehicleName: string;
  currentKm: number;
  kmPerDay: number | null;
  today: string;
  services: Array<{
    date: string;
    km: number;
    workshop: string | null;
    total: number | null;
    notes: string | null;
    items: string[];
  }>;
  due: ItemDue[];
}

const isEstimated = (notes: string | null) => notes?.includes("Km estimado") ?? false;

function serviceLine(s: CarContextInput["services"][number]): string {
  const km = `${formatKm(s.km)}${isEstimated(s.notes) ? " (estimado)" : ""}`;
  const parts = [`${s.date} · ${km}`];
  if (s.workshop) parts.push(s.workshop);
  if (s.items.length) parts.push(s.items.join(", "));
  if (s.total !== null) parts.push(formatMxn(s.total));
  const line = `- ${parts.join(" · ")}`;
  return s.notes ? `${line}\n  Notas: ${s.notes}` : line;
}

function statusGroups(due: ItemDue[]): string {
  const groups: Array<[string, ItemDue[]]> = [
    ["Vencido", due.filter((d) => d.last && d.status === "vencido")],
    ["Próximo", due.filter((d) => d.last && d.status === "proximo")],
    ["Sin registro", due.filter((d) => !d.last)],
    ["Al día", due.filter((d) => d.last && d.status === "ok")],
  ];
  return groups
    .filter(([, items]) => items.length)
    .map(([label, items]) => {
      const lines = items.map((d) => {
        const last = d.last ? `último ${d.last.date} a ${formatKm(d.last.km)}, ` : "";
        return `- ${d.item.name}: ${last}${formatRemaining(d)}`;
      });
      return `${label}:\n${lines.join("\n")}`;
    })
    .join("\n\n");
}

// Plain-text briefing about the car, rebuilt on every message so it is always current.
export function buildCarContext(input: CarContextInput): string {
  const services = [...input.services].sort((a, b) => b.date.localeCompare(a.date) || b.km - a.km);
  const pace = input.kmPerDay ? `\nRecorrido promedio: ${Math.round(input.kmPerDay)} km por día.` : "";
  return [
    `# Vehículo\n${input.vehicleName}\nKilometraje actual: ${formatKm(input.currentKm)}.${pace}\nHoy: ${input.today}. Ubicación del dueño: Chihuahua, Chihuahua, México.`,
    `# Historial de servicios\n${services.length ? services.map(serviceLine).join("\n") : "Sin servicios registrados."}`,
    `# Estado del mantenimiento\n${statusGroups(input.due)}`,
  ].join("\n\n");
}
