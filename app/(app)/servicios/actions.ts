"use server";

import { revalidatePath } from "next/cache";
import { getOdometerNeighbors, getVehicle } from "@/lib/data/vehicle";
import { createClient } from "@/lib/supabase/server";
import { checkOdometer } from "@/lib/validation/odometer";
import { checkServiceDate, serviceSchema } from "@/lib/validation/service";
import { todayInMexico } from "@/lib/due";
import type { UploadedFile } from "@/lib/data/attachments";

export type CreateServiceState = {
  errors?: Record<string, string>;
  needsConfirm?: boolean;
  serviceId?: string;
};

const blankToUndefined = (v: FormDataEntryValue | null) => (v === null || v === "" ? undefined : v);

export async function createService(_prev: CreateServiceState, formData: FormData): Promise<CreateServiceState> {
  const itemIds = formData.getAll("item").map(String);
  const parsed = serviceSchema.safeParse({
    date: formData.get("date"),
    km: formData.get("km"),
    workshop: blankToUndefined(formData.get("workshop")),
    totalCostMxn: blankToUndefined(formData.get("totalCostMxn")),
    notes: blankToUndefined(formData.get("notes")),
    items: itemIds.map((id) => ({ maintenanceItemId: id, costMxn: blankToUndefined(formData.get(`cost-${id}`)) })),
    confirmJump: formData.get("confirmJump") ?? undefined,
  });
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] ??= issue.message;
    return { errors };
  }
  const input = parsed.data;
  const dateError = checkServiceDate(input.date, todayInMexico());
  if (dateError) return { errors: { date: dateError } };
  const clientToken = String(formData.get("clientToken") ?? "");
  if (!clientToken) return { errors: { form: "Recarga la página e intenta de nuevo." } };

  const vehicle = await getVehicle();
  const check = checkOdometer(input, await getOdometerNeighbors(vehicle.id, input.date));
  if (!check.ok) return { errors: { km: check.message }, needsConfirm: check.needsConfirm };

  const supabase = await createClient();
  const { data: serviceId, error } = await supabase.rpc("record_service", {
    p_vehicle_id: vehicle.id,
    p_date: input.date,
    p_km: input.km,
    p_workshop: input.workshop ?? null,
    p_total_cost: input.totalCostMxn ?? null,
    p_notes: input.notes ?? null,
    p_items: input.items.map((i) => ({ maintenance_item_id: i.maintenanceItemId, cost_mxn: i.costMxn ?? null })),
    p_client_token: clientToken,
  } as never);
  if (error || !serviceId) return { errors: { form: "No se pudo guardar el servicio. Intenta de nuevo." } };

  revalidatePath("/");
  revalidatePath("/historial");
  return { serviceId: serviceId as string };
}

export async function addAttachments(serviceId: string, files: UploadedFile[]): Promise<{ ok: boolean }> {
  if (files.length === 0) return { ok: true };
  const supabase = await createClient();
  const { error } = await supabase.from("attachments").insert(
    files.map((f) => ({
      service_id: serviceId,
      storage_path: f.storagePath,
      file_name: f.fileName,
      mime_type: f.mimeType || null,
      size_bytes: f.sizeBytes,
    })),
  );
  revalidatePath(`/historial/${serviceId}`);
  return { ok: !error };
}
