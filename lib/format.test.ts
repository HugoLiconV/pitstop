import { describe, expect, it } from "vitest";
import type { ItemDue } from "@/lib/due";
import { formatDate, formatKm, formatMxn, formatRemaining } from "./format";

const due = (over: Partial<ItemDue>): ItemDue => ({
  item: { id: "i", name: "Aceite", intervalKm: 10000, intervalMonths: 6, active: true },
  status: "ok",
  last: null,
  nextKm: null,
  nextDate: null,
  kmRemaining: null,
  daysRemaining: null,
  ...over,
});

describe("formatters", () => {
  it("formats km with es-MX separators", () => expect(formatKm(69500)).toBe("69,500 km"));
  it("formats pesos", () => expect(formatMxn(1850)).toBe("$1,850.00"));
  it("formats dates as DD/MM/YYYY", () => expect(formatDate("2026-10-26")).toBe("26/10/2026"));
});

describe("formatRemaining", () => {
  it("joins km and weeks", () => {
    expect(formatRemaining(due({ kmRemaining: 800, daysRemaining: 21 }))).toBe("faltan 800 km · 3 semanas");
  });
  it("uses days under 14 days", () => {
    expect(formatRemaining(due({ kmRemaining: null, daysRemaining: 5 }))).toBe("faltan 5 días");
  });
  it("uses months from 60 days", () => {
    expect(formatRemaining(due({ kmRemaining: 4000, daysRemaining: 90 }))).toBe("faltan 4,000 km · 3 meses");
  });
  it("describes overdue by the exceeded limit", () => {
    expect(formatRemaining(due({ status: "vencido", kmRemaining: -200, daysRemaining: 40 }))).toBe(
      "vencido hace 200 km",
    );
    expect(formatRemaining(due({ status: "vencido", kmRemaining: 3000, daysRemaining: -10 }))).toBe(
      "vencido hace 10 días",
    );
  });
  it("says vencido hoy on the due date", () => {
    expect(formatRemaining(due({ status: "vencido", kmRemaining: 3000, daysRemaining: 0 }))).toBe("vence hoy");
  });
  it("uses singular forms", () => {
    expect(formatRemaining(due({ daysRemaining: 1 }))).toBe("falta 1 día");
  });
});
