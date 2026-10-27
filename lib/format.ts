import type { ItemDue } from "@/lib/due";

const number = new Intl.NumberFormat("es-MX");
const money = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });

export function formatKm(n: number): string {
  return `${number.format(n)} km`;
}

export function formatMxn(n: number): string {
  return money.format(n);
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

function formatDays(days: number): string {
  if (days < 14) return plural(days, "día", "días");
  if (days < 60) return plural(Math.round(days / 7), "semana", "semanas");
  return plural(Math.round(days / 30), "mes", "meses");
}

export function formatRemaining(d: ItemDue): string {
  if (d.status === "vencido") {
    if (d.kmRemaining !== null && d.kmRemaining <= 0) return `vencido hace ${formatKm(-d.kmRemaining)}`;
    if (!d.daysRemaining) return "vence hoy";
    return `vencido hace ${formatDays(-d.daysRemaining)}`;
  }
  const parts: string[] = [];
  if (d.kmRemaining !== null) parts.push(formatKm(d.kmRemaining));
  if (d.daysRemaining !== null) parts.push(formatDays(d.daysRemaining));
  const singular = parts[0]?.startsWith("1 ");
  return `${singular ? "falta" : "faltan"} ${parts.join(" · ")}`;
}
