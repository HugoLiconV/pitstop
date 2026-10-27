// Dates cross module boundaries as ISO "YYYY-MM-DD" strings.

const MS_PER_DAY = 86_400_000;

function parse(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function format(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function todayInMexico(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Mexico_City" }).format(now);
}

export function addMonthsClamped(isoDate: string, months: number): string {
  const d = parse(isoDate);
  const target = d.getUTCMonth() + months;
  const lastDay = new Date(Date.UTC(d.getUTCFullYear(), target + 1, 0)).getUTCDate();
  return format(new Date(Date.UTC(d.getUTCFullYear(), target, Math.min(d.getUTCDate(), lastDay))));
}

export function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((parse(toIso).getTime() - parse(fromIso).getTime()) / MS_PER_DAY);
}
