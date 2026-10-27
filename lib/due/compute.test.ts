import { describe, expect, it } from "vitest";
import { computeDue, type ScheduleItem } from "./compute";

const baseline = { date: "2025-01-01", km: 50000 };
const today = "2026-10-26";

const item = (over: Partial<ScheduleItem> = {}): ScheduleItem => ({
  id: "i1",
  name: "Aceite",
  intervalKm: null,
  intervalMonths: null,
  active: true,
  ...over,
});

describe("computeDue", () => {
  it("marks a km-only item as próximo within 1000 km", () => {
    const [d] = computeDue({
      items: [item({ intervalKm: 10000 })],
      services: [{ date: "2026-01-10", km: 60000, itemIds: ["i1"] }],
      baseline, currentKm: 69500, today,
    });
    expect(d.status).toBe("proximo");
    expect(d.kmRemaining).toBe(500);
    expect(d.nextDate).toBeNull();
  });

  it("treats reaching the km limit exactly as vencido", () => {
    const [d] = computeDue({
      items: [item({ intervalKm: 10000 })],
      services: [{ date: "2026-01-10", km: 60000, itemIds: ["i1"] }],
      baseline, currentKm: 70000, today,
    });
    expect(d.status).toBe("vencido");
  });

  it("marks a time-only item as próximo within 30 days", () => {
    const [d] = computeDue({
      items: [item({ intervalMonths: 12 })],
      services: [{ date: "2025-11-20", km: 60000, itemIds: ["i1"] }],
      baseline, currentKm: 61000, today,
    });
    expect(d.status).toBe("proximo");
    expect(d.daysRemaining).toBe(25);
  });

  it("is vencido when the date has passed even if km is fine", () => {
    const [d] = computeDue({
      items: [item({ intervalKm: 10000, intervalMonths: 6 })],
      services: [{ date: "2026-01-10", km: 60000, itemIds: ["i1"] }],
      baseline, currentKm: 62000, today,
    });
    expect(d.status).toBe("vencido");
    expect(d.daysRemaining).toBeLessThan(0);
  });

  it("uses the vehicle baseline for a never-serviced item", () => {
    const [d] = computeDue({
      items: [item({ intervalKm: 100000 })],
      services: [], baseline, currentKm: 60000, today,
    });
    expect(d.last).toBeNull();
    expect(d.nextKm).toBe(150000);
    expect(d.status).toBe("ok");
  });

  it("uses the latest service by date even when unsorted", () => {
    const [d] = computeDue({
      items: [item({ intervalKm: 10000 })],
      services: [
        { date: "2026-05-01", km: 65000, itemIds: ["i1"] },
        { date: "2025-06-01", km: 55000, itemIds: ["i1"] },
      ],
      baseline, currentKm: 66000, today,
    });
    expect(d.last).toEqual({ date: "2026-05-01", km: 65000 });
    expect(d.nextKm).toBe(75000);
  });

  it("excludes inactive items", () => {
    const res = computeDue({
      items: [item({ intervalKm: 10000, active: false })],
      services: [], baseline, currentKm: 60000, today,
    });
    expect(res).toHaveLength(0);
  });

  it("sorts vencido, then próximo, then ok", () => {
    const res = computeDue({
      items: [
        item({ id: "ok", intervalKm: 100000 }),
        item({ id: "soon", intervalKm: 10500 }),
        item({ id: "late", intervalKm: 5000 }),
      ],
      services: [], baseline, currentKm: 60000, today,
    });
    expect(res.map((d) => d.item.id)).toEqual(["late", "soon", "ok"]);
  });

  it("reports life used as the larger of km and time fractions", () => {
    const [d] = computeDue({
      items: [item({ intervalKm: 10000, intervalMonths: 12 })],
      services: [{ date: "2026-04-26", km: 60000, itemIds: ["i1"] }],
      baseline, currentKm: 62500, today,
    });
    // km: 2,500 / 10,000 = 0.25; time: 183 / 365 days ≈ 0.50
    expect(d.used).toBeCloseTo(0.5, 2);
  });

  it("caps life used at 1 when overdue", () => {
    const [d] = computeDue({
      items: [item({ intervalKm: 5000 })],
      services: [], baseline, currentKm: 60000, today,
    });
    expect(d.used).toBe(1);
  });
});
