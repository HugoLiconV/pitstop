import { describe, expect, it } from "vitest";
import { DEFAULT_REASONING, DEFAULT_TOKEN_LIMIT, isReasoningEffort, isTokenLimit, REASONING_LABELS, tokenLabel } from "./settings";

describe("assistant settings", () => {
  it("allows four reasoning levels, defaulting to low", () => {
    expect(Object.keys(REASONING_LABELS)).toEqual(["none", "low", "medium", "high"]); // both models reject "minimal"
    expect(DEFAULT_REASONING).toBe("low");
    expect(isReasoningEffort("high")).toBe(true);
    expect(isReasoningEffort("max")).toBe(false);
  });

  it("allows 4k, 8k and 16k output tokens, defaulting to 4k", () => {
    expect(DEFAULT_TOKEN_LIMIT).toBe(4000);
    expect([4000, 8000, 16000].every(isTokenLimit)).toBe(true);
    expect(isTokenLimit(2000)).toBe(false);
    expect(isTokenLimit("4000")).toBe(false);
    expect(tokenLabel(16000)).toBe("16k");
  });
});
