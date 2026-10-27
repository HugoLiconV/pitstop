"use client";

import { createClient } from "@/lib/supabase/browser";
import { checkAttachment } from "@/lib/validation/attachment";

export type UploadedFile = { storagePath: string; fileName: string; mimeType: string; sizeBytes: number };

// Uploads straight to Supabase Storage (Vercel caps request bodies at 4.5 MB).
// Never throws: failed file names are returned so the service can still be saved.
export async function uploadAttachments(
  userId: string,
  serviceId: string,
  files: File[],
): Promise<{ uploaded: UploadedFile[]; failed: string[] }> {
  const supabase = createClient();
  const uploaded: UploadedFile[] = [];
  const failed: string[] = [];

  for (const file of files) {
    if (!checkAttachment(file).ok) {
      failed.push(file.name);
      continue;
    }
    const safeName = file.name.replace(/[^\w.\-]+/g, "_");
    const storagePath = `${userId}/${serviceId}/${crypto.randomUUID()}-${safeName}`;
    const { error } = await supabase.storage
      .from("attachments")
      .upload(storagePath, file, { contentType: file.type || undefined });
    if (error) failed.push(file.name);
    else uploaded.push({ storagePath, fileName: file.name, mimeType: file.type, sizeBytes: file.size });
  }
  return { uploaded, failed };
}
