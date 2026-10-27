import { describe, expect, it } from "vitest";
import { checkOdometer } from "./odometer";

const none = { before: null, after: null };

describe("checkOdometer", () => {
  it("rejects a reading below the previous one", () => {
    const r = checkOdometer(
      { date: "2026-10-26", km: 45000, confirmJump: false },
      { before: { date: "2026-03-12", km: 46000 }, after: null },
    );
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.message).toContain("46,000");
  });

  it("accepts a back-dated reading between its neighbors", () => {
    const r = checkOdometer(
      { date: "2024-05-01", km: 30000, confirmJump: false },
      { before: { date: "2024-01-01", km: 25000 }, after: { date: "2025-01-01", km: 40000 } },
    );
    expect(r).toEqual({ ok: true });
  });

  it("rejects a reading above the next one", () => {
    const r = checkOdometer(
      { date: "2024-05-01", km: 41000, confirmJump: true },
      { before: null, after: { date: "2025-01-01", km: 40000 } },
    );
    expect(r.ok).toBe(false);
  });

  it("asks for confirmation on a jump over 5000 km", () => {
    const neighbors = { before: { date: "2026-01-01", km: 60000 }, after: null };
    const r = checkOdometer({ date: "2026-10-26", km: 66000, confirmJump: false }, neighbors);
    expect(r).toMatchObject({ ok: false, needsConfirm: true });
    expect(checkOdometer({ date: "2026-10-26", km: 66000, confirmJump: true }, neighbors)).toEqual({ ok: true });
  });

  it("accepts any reading without neighbors", () => {
    expect(checkOdometer({ date: "2026-10-26", km: 1, confirmJump: false }, none)).toEqual({ ok: true });
  });
});
