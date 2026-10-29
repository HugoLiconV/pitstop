import { describe, expect, it } from "vitest";
import { DEFAULT_MODEL, isModelId, MODEL_LABELS } from "./models";

describe("isModelId", () => {
  it("accepts only the allowed models", () => {
    expect(isModelId("gpt-6-luna")).toBe(true);
    expect(isModelId("gpt-6.1-terra")).toBe(true);
    expect(isModelId("gpt-4o")).toBe(false);
    expect(isModelId(undefined)).toBe(false);
  });

  it("defaults to luna and labels both", () => {
    expect(DEFAULT_MODEL).toBe("gpt-6-luna");
    expect(MODEL_LABELS).toEqual({ "gpt-6-luna": "Luna", "gpt-6.1-terra": "Terra" });
  });
});
