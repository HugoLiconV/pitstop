import { describe, expect, it } from "vitest";
import type { ItemDue } from "./compute";
import { summarizeZones, zoneOf } from "./zones";

describe("zoneOf", () => {
  it.each([
    ["Cambio de aceite de motor y filtro", "motor"],
    ["Inspección de correas de mando", "motor"],
    ["Filtro de aire de motor (cambio)", "motor"],
    ["Bujías de encendido", "motor"],
    ["Filtro de combustible", "motor"],
    ["Inspección de líneas de combustible", "motor"],
    ["Sistema evaporativo (inspección)", "motor"],
    ["Cubierta térmica del escape (inspección)", "motor"],
    ["Líquido de frenos", "fluidos"],
    ["Refrigerante de motor (FL-22)", "fluidos"],
    ["Inspección de sistema de enfriamiento", "fluidos"],
    ["Inspección de batería", "fluidos"],
    ["Rotación de neumáticos", "ruedas"],
    ["Inspección de neumáticos y presión", "ruedas"],
    ["Inspección de frenos de disco y freno de mano", "ruedas"],
    ["Inspección de líneas de freno, mangueras y reforzador", "ruedas"],
    ["Inspección de dirección y suspensión", "ruedas"],
    ["Inspección de fundas de ejes", "ruedas"],
    ["Filtro de aire de cabina", "cabina"],
    ["Pernos y tuercas de chasis y carrocería (apretar)", "carroceria"],
    ["Condición de carrocería (óxido y corrosión)", "carroceria"],
    ["Algo nuevo", "carroceria"],
  ])("%s → %s", (name, zone) => {
    expect(zoneOf(name)).toBe(zone);
  });
});

const item = (name: string, status: ItemDue["status"]): ItemDue => ({
  item: { id: name, name, intervalKm: 10000, intervalMonths: 12, active: true },
  status,
  last: null,
  nextKm: null,
  nextDate: null,
  kmRemaining: null,
  daysRemaining: null,
  used: 0,
});

describe("summarizeZones", () => {
  it("keeps only zones with items, in zone order, with the most urgent status", () => {
    const zones = summarizeZones([
      item("Rotación de neumáticos", "ok"),
      item("Líquido de frenos", "proximo"),
      item("Inspección de frenos de disco y freno de mano", "vencido"),
      item("Cambio de aceite de motor y filtro", "ok"),
    ]);
    expect(zones).toEqual([
      { id: "motor", title: "Motor", total: 1, pending: 0, worst: "ok" },
      { id: "fluidos", title: "Fluidos y batería", total: 1, pending: 1, worst: "proximo" },
      { id: "ruedas", title: "Llantas y frenos", total: 2, pending: 1, worst: "vencido" },
    ]);
  });
});
