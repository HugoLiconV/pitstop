"use server";

import { revalidatePath } from "next/cache";
import { getOdometerNeighbors, getVehicle } from "@/lib/data/vehicle";
import { todayInMexico } from "@/lib/due";
import { createClient } from "@/lib/supabase/server";
import { checkOdometer, odometerSchema } from "@/lib/validation/odometer";

export type UpdateKmState = { error?: string; needsConfirm?: boolean; savedAt?: number; km?: string };

export async function updateKm(_prev: UpdateKmState, formData: FormData): Promise<UpdateKmState> {
  const parsed = odometerSchema.safeParse({
    date: todayInMexico(),
    km: formData.get("km"),
    confirmJump: formData.get("confirmJump") ?? undefined,
  });
  const km = String(formData.get("km") ?? "");
  if (!parsed.success) return { error: parsed.error.issues[0].message, km };

  const vehicle = await getVehicle();
  const check = checkOdometer(parsed.data, await getOdometerNeighbors(vehicle.id, parsed.data.date));
  if (!check.ok) return { error: check.message, needsConfirm: check.needsConfirm, km };

  const supabase = await createClient();
  const { error } = await supabase
    .from("odometer_readings")
    .insert({ vehicle_id: vehicle.id, date: parsed.data.date, km: parsed.data.km, source: "manual" });
  if (error) return { error: "No se pudo guardar el kilometraje. Intenta de nuevo.", km };

  revalidatePath("/");
  return { savedAt: Date.now() };
}
