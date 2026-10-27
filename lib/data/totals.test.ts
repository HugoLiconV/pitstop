import { describe, expect, it } from "vitest";
import { spendTotals } from "./totals";

describe("spendTotals", () => {
  it("sums this year and all time, treating missing costs as zero", () => {
    const services = [
      { date: "2026-03-01", totalCostMxn: 1850 },
      { date: "2026-09-15", totalCostMxn: null },
      { date: "2025-11-20", totalCostMxn: 900.5 },
    ];
    expect(spendTotals(services, "2026-10-26")).toEqual({ year: 1850, allTime: 2750.5 });
  });
});
