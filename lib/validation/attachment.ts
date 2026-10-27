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
