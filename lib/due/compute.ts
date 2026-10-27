import { DUE_SOON_DAYS, DUE_SOON_KM } from "./config";
import { addMonthsClamped, daysBetween } from "./dates";

export type DueStatus = "vencido" | "proximo" | "ok";

export interface ScheduleItem {
  id: string;
  name: string;
  intervalKm: number | null;
  intervalMonths: number | null;
  active: boolean;
}

export interface ServiceRecord {
  date: string;
  km: number;
  itemIds: string[];
}

export interface Baseline {
  date: string;
  km: number;
}

export interface ItemDue {
  item: ScheduleItem;
  status: DueStatus;
  last: { date: string; km: number } | null;
  nextKm: number | null;
  nextDate: string | null;
  kmRemaining: number | null;
  daysRemaining: number | null;
}

const STATUS_ORDER: Record<DueStatus, number> = { vencido: 0, proximo: 1, ok: 2 };

// Remaining distance to the nearest limit, in "threshold units", so km and days compare.
function urgency(d: ItemDue): number {
  const byKm = d.kmRemaining === null ? Infinity : d.kmRemaining / DUE_SOON_KM;
  const byDays = d.daysRemaining === null ? Infinity : d.daysRemaining / DUE_SOON_DAYS;
  return Math.min(byKm, byDays);
}

export function computeDue(args: {
  items: ScheduleItem[];
  services: ServiceRecord[];
  baseline: Baseline;
  currentKm: number;
  today: string;
}): ItemDue[] {
  const { items, services, baseline, currentKm, today } = args;

  return items
    .filter((item) => item.active)
    .map((item): ItemDue => {
      const last =
        services
          .filter((s) => s.itemIds.includes(item.id))
          .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.km - a.km))
          .map(({ date, km }) => ({ date, km }))[0] ?? null;
      const from = last ?? baseline;

      const nextKm = item.intervalKm === null ? null : from.km + item.intervalKm;
      const nextDate = item.intervalMonths === null ? null : addMonthsClamped(from.date, item.intervalMonths);
      const kmRemaining = nextKm === null ? null : nextKm - currentKm;
      const daysRemaining = nextDate === null ? null : daysBetween(today, nextDate);

      let status: DueStatus = "ok";
      if ((kmRemaining !== null && kmRemaining <= 0) || (daysRemaining !== null && daysRemaining <= 0)) {
        status = "vencido";
      } else if (
        (kmRemaining !== null && kmRemaining <= DUE_SOON_KM) ||
        (daysRemaining !== null && daysRemaining <= DUE_SOON_DAYS)
      ) {
        status = "proximo";
      }

      return { item, status, last, nextKm, nextDate, kmRemaining, daysRemaining };
    })
    .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || urgency(a) - urgency(b));
}
