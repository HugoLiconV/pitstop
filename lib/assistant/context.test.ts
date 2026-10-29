import { describe, expect, it } from "vitest";
import type { ItemDue } from "@/lib/due";
import { buildCarContext, type CarContextInput } from "./context";

const due = (name: string, over: Partial<ItemDue>): ItemDue => ({
  item: { id: name, name, intervalKm: 10000, intervalMonths: 6, active: true },
  status: "ok",
  last: null,
  nextKm: null,
  nextDate: null,
  kmRemaining: null,
  daysRemaining: null,
  used: 0,
  ...over,
});

const input: CarContextInput = {
  vehicleName: "Mazda 6 2015 Grand Touring Plus",
  currentKm: 183289,
  kmPerDay: 27,
  today: "2026-10-28",
  services: [
    { date: "2022-08-12", km: 136150, workshop: null, total: 6798.76, notes: "Cotización 4751. Km estimado. Balatas.", items: ["Inspección de frenos de disco y freno de mano"] },
    { date: "2026-01-31", km: 175440, workshop: "Taller", total: 3451, notes: null, items: ["Cambio de aceite de motor y filtro"] },
  ],
  due: [
    due("Cambio de aceite de motor y filtro", { status: "vencido", last: { date: "2026-01-31", km: 175440 }, kmRemaining: 2151, daysRemaining: -90 }),
    due("Inspección de dirección y suspensión", { status: "proximo", last: { date: "2026-08-24", km: 180919 }, kmRemaining: 800, daysRemaining: 300 }),
    due("Líquido de frenos", { status: "vencido", last: null, kmRemaining: -3000, daysRemaining: -100 }),
  ],
};

describe("buildCarContext", () => {
  const out = buildCarContext(input);

  it("states the vehicle, current km and location", () => {
    expect(out).toContain("Mazda 6 2015 Grand Touring Plus");
    expect(out).toContain("183,289 km");
    expect(out).toContain("Chihuahua");
    expect(out).toContain("2026-10-28");
  });

  it("lists services newest first and marks estimated km", () => {
    expect(out).toMatch(/2022-08-12.*136,150 km \(estimado\)/);
    expect(out.indexOf("2026-01-31")).toBeLessThan(out.indexOf("2022-08-12"));
  });

  it("groups maintenance status, separating items never recorded", () => {
    expect(out).toMatch(/Vencido:[\s\S]*Cambio de aceite/);
    expect(out).toMatch(/Próximo:[\s\S]*Inspección de dirección/);
    expect(out).toMatch(/Sin registro:[\s\S]*Líquido de frenos/);
    expect(out).not.toMatch(/Vencido:[^\n]*\n(?:- [^\n]*\n)*- Líquido de frenos/);
  });
});
