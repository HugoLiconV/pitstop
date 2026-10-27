"use server";

import { revalidatePath } from "next/cache";
import { getVehicle } from "@/lib/data/vehicle";
import { createClient } from "@/lib/supabase/server";
import { maintenanceItemSchema } from "@/lib/validation/maintenance-item";

export type ItemFormState = { error?: string; savedAt?: number };

const blankToNull = (v: FormDataEntryValue | null) => (v === null || v === "" ? null : v);

function parse(formData: FormData) {
  return maintenanceItemSchema.safeParse({
    name: formData.get("name"),
    intervalKm: blankToNull(formData.get("intervalKm")),
    intervalMonths: blankToNull(formData.get("intervalMonths")),
    notes: formData.get("notes") ?? undefined,
    active: true,
  });
}

function done() {
  revalidatePath("/plan");
  revalidatePath("/");
  return { savedAt: Date.now() };
}

export async function saveItem(_prev: ItemFormState, formData: FormData): Promise<ItemFormState> {
  const parsed = parse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { name, intervalKm, intervalMonths, notes } = parsed.data;
  const fields = { name, interval_km: intervalKm, interval_months: intervalMonths, notes: notes || null };

  const supabase = await createClient();
  const id = formData.get("id");
  const { error } = id
    ? await supabase.from("maintenance_items").update(fields).eq("id", String(id))
    : await supabase.from("maintenance_items").insert({ ...fields, vehicle_id: (await getVehicle()).id, source: "custom" });
  if (error) return { error: "No se pudo guardar. Intenta de nuevo." };
  return done();
}

export async function setItemActive(id: string, active: boolean): Promise<void> {
  const supabase = await createClient();
  await supabase.from("maintenance_items").update({ active }).eq("id", id);
  done();
}
