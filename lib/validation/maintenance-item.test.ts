import { describe, expect, it } from "vitest";
import { maintenanceItemSchema } from "./maintenance-item";

describe("maintenanceItemSchema", () => {
  it("requires at least one interval", () => {
    const r = maintenanceItemSchema.safeParse({ name: "Lavado", intervalKm: null, intervalMonths: null, active: true });
    expect(r.success).toBe(false);
  });
  it("accepts a km-only item", () => {
    const r = maintenanceItemSchema.safeParse({ name: "Bujías", intervalKm: 120000, intervalMonths: null, active: true });
    expect(r.success).toBe(true);
  });
});
