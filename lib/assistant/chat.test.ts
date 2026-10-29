import { describe, expect, it } from "vitest";
import { HISTORY_LIMIT, titleFrom, trimHistory } from "./chat";

describe("trimHistory", () => {
  it("keeps the last 30 messages in order", () => {
    expect(HISTORY_LIMIT).toBe(30);
    expect(trimHistory(Array.from({ length: 45 }, (_, i) => i))).toEqual(Array.from({ length: 30 }, (_, i) => i + 15));
  });

  it("leaves short chats alone", () => expect(trimHistory([1, 2])).toEqual([1, 2]));
});

describe("titleFrom", () => {
  it("takes the first six words", () => {
    expect(titleFrom("  ¿Qué aceite lleva mi coche para el cambio de enero?  ")).toBe("¿Qué aceite lleva mi coche para…");
  });

  it("keeps short questions whole", () => expect(titleFrom("Hola")).toBe("Hola"));

  it("falls back to the default title", () => expect(titleFrom("   ")).toBe("Nueva conversación"));
});
