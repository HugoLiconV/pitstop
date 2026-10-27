import { createClient } from "@/lib/supabase/server";

const SERVICE_FIELDS =
  "id, date, km, workshop, total_cost_mxn, notes, service_items(id, cost_mxn, maintenance_item_id, maintenance_items(name))";

export async function listServices({ itemId }: { itemId?: string } = {}) {
  const supabase = await createClient();
  let ids: string[] | null = null;
  if (itemId) {
    const { data, error } = await supabase.from("service_items").select("service_id").eq("maintenance_item_id", itemId);
    if (error) throw error;
    ids = data.map((r) => r.service_id);
  }
  let query = supabase.from("services").select(SERVICE_FIELDS).order("date", { ascending: false }).order("km", { ascending: false });
  if (ids) query = query.in("id", ids);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getService(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select(`${SERVICE_FIELDS}, attachments(id, storage_path, file_name, mime_type, size_bytes)`)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getSignedUrls(paths: string[]): Promise<Map<string, string>> {
  if (paths.length === 0) return new Map();
  const supabase = await createClient();
  const { data, error } = await supabase.storage.from("attachments").createSignedUrls(paths, 60);
  if (error) throw error;
  return new Map(data.flatMap((d) => (d.path && d.signedUrl ? [[d.path, d.signedUrl] as const] : [])));
}
