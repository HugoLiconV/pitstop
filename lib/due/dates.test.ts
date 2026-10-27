import { describe, expect, it } from "vitest";
import { addMonthsClamped, daysBetween, todayInMexico } from "./dates";

describe("todayInMexico", () => {
  it("uses the Mexico City date, not UTC", () => {
    expect(todayInMexico(new Date("2026-10-27T01:00:00Z"))).toBe("2026-10-26");
  });
});

describe("addMonthsClamped", () => {
  it("clamps to the end of a shorter month", () => {
    expect(addMonthsClamped("2026-08-31", 6)).toBe("2027-02-28");
  });
  it("clamps to 29 Feb in leap years", () => {
    expect(addMonthsClamped("2027-08-31", 6)).toBe("2028-02-29");
  });
  it("keeps the day when it exists", () => {
    expect(addMonthsClamped("2026-01-15", 12)).toBe("2027-01-15");
  });
});

describe("daysBetween", () => {
  it("counts whole days", () => {
    expect(daysBetween("2026-10-26", "2026-11-25")).toBe(30);
  });
});
