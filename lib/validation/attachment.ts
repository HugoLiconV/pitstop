export const ALLOWED_EXT = ["pdf", "jpg", "jpeg", "png", "heic", "heif"];
export const MAX_BYTES = 10 * 1024 * 1024;

export type AttachmentCheck = { ok: true } | { ok: false; message: string };

// Checked by extension: iPhone HEIC files often arrive with an empty MIME type.
export function checkAttachment(file: { name: string; type: string; size: number }): AttachmentCheck {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_EXT.includes(ext)) {
    return { ok: false, message: "Solo se aceptan PDF, JPG, PNG o HEIC." };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, message: "El archivo pesa más de 10 MB." };
  }
  return { ok: true };
}

const MIME_BY_EXT: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  heic: "image/heic",
  heif: "image/heif",
};

// Browsers often report "" or a generic type for HEIC/PDF; fall back to the extension.
export function mimeFor(file: { name: string; type: string }): string {
  if (file.type && file.type !== "application/octet-stream") return file.type;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return MIME_BY_EXT[ext] ?? "application/octet-stream";
}
