import { describe, expect, it } from "vitest";
import { checkServiceDate, serviceSchema } from "./service";

const valid = {
  date: "2026-10-26",
  km: 69500,
  workshop: "Mazda Satélite",
  totalCostMxn: 1850,
  notes: "",
  items: [{ maintenanceItemId: "6f1c2a8e-0000-4000-8000-000000000001" }],
  confirmJump: false,
};

describe("serviceSchema", () => {
  it("accepts a valid service", () => {
    expect(serviceSchema.safeParse(valid).success).toBe(true);
  });
  it("requires at least one maintenance item", () => {
    const r = serviceSchema.safeParse({ ...valid, items: [] });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0].message).toBe("Selecciona al menos un mantenimiento.");
  });
});

describe("checkServiceDate", () => {
  it("rejects a date after today in Mexico", () => {
    expect(checkServiceDate("2026-10-27", "2026-10-26")).toBe("La fecha no puede ser futura.");
  });
  it("accepts today and past dates", () => {
    expect(checkServiceDate("2026-10-26", "2026-10-26")).toBeNull();
    expect(checkServiceDate("2024-08-10", "2026-10-26")).toBeNull();
  });
});
