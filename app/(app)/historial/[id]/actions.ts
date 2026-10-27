"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function deleteAttachment(id: string, serviceId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("attachments").select("storage_path").eq("id", id).single();
  if (error) return { error: "No se encontró el archivo." };
  const removed = await supabase.storage.from("attachments").remove([data.storage_path]);
  if (removed.error) return { error: "No se pudo borrar el archivo. Intenta de nuevo." };
  await supabase.from("attachments").delete().eq("id", id);
  revalidatePath(`/historial/${serviceId}`);
  return {};
}
