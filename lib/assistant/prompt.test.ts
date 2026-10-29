import { describe, expect, it } from "vitest";
import { buildInstructions } from "./prompt";

describe("buildInstructions", () => {
  it("wraps the car context in its own tag after the rules", () => {
    const out = buildInstructions("# Vehículo\nMazda 6");
    expect(out).toMatch(/# Rol[\s\S]*<contexto_del_coche>\n# Vehículo\nMazda 6\n<\/contexto_del_coche>$/);
  });
});
