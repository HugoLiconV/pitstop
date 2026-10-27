import { describe, expect, it } from "vitest";
import { checkAttachment } from "./attachment";

describe("checkAttachment", () => {
  it("accepts HEIC by extension when the MIME type is empty", () => {
    expect(checkAttachment({ name: "factura.HEIC", type: "", size: 2 * 1024 * 1024 })).toEqual({ ok: true });
  });
  it("rejects other file types", () => {
    expect(checkAttachment({ name: "virus.exe", type: "application/octet-stream", size: 10 }).ok).toBe(false);
  });
  it("rejects files over 10 MB", () => {
    expect(checkAttachment({ name: "f.pdf", type: "application/pdf", size: 11 * 1024 * 1024 })).toEqual({
      ok: false,
      message: "El archivo pesa más de 10 MB.",
    });
  });
});
