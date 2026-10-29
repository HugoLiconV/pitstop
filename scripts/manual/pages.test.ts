import { describe, expect, it } from "vitest";
import { pageLabel, toMarkdown } from "./pages.mjs";

describe("pageLabel", () => {
  it("reads the printed page number from the last line", () => {
    expect(pageLabel("Cuando conduce\n...\n4-250\n")).toBe("4-250");
    expect(pageLabel("Mantenimiento\n...\n6-14")).toBe("6-14");
  });

  it("reads a label that shares the last line with a footnote", () => {
    expect(pageLabel("texto\n4-72        Algunos modelos.")).toBe("4-72");
    expect(pageLabel("texto\n      Algunos modelos.     5-169")).toBe("5-169");
  });

  it("ignores page references inside the text", () => {
    expect(pageLabel("consulte la página 9-14 para más detalles.")).toBeNull();
  });

  it("returns null when the page has no label", () => {
    expect(pageLabel("sin número de página")).toBeNull();
  });
});

describe("toMarkdown", () => {
  it("puts a heading before each page and keeps unlabeled pages", () => {
    const md = toMarkdown(["texto A\n6-13", "texto B"]);
    expect(md).toContain("## Página 6-13\n\ntexto A");
    expect(md).toContain("## Página PDF 2\n\ntexto B");
  });
});
