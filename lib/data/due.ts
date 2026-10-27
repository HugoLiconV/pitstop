import { computeDue, todayInMexico, type ItemDue, type ScheduleItem, type ServiceRecord } from "@/lib/due";
import { createClient } from "@/lib/supabase/server";
import { getCurrentKm, getVehicle } from "./vehicle";

export type MaintenanceItemRow = Awaited<ReturnType<typeof getMaintenanceItems>>[number];

export async function getMaintenanceItems(vehicleId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("maintenance_items")
    .select("*")
    .eq("vehicle_id", vehicleId)
    .order("interval_km", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return data;
}

export function toScheduleItem(row: MaintenanceItemRow): ScheduleItem {
  return {
    id: row.id,
    name: row.name,
    intervalKm: row.interval_km,
    intervalMonths: row.interval_months,
    active: row.active,
  };
}

async function getServiceRecords(vehicleId: string): Promise<ServiceRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select("date, km, service_items(maintenance_item_id)")
    .eq("vehicle_id", vehicleId);
  if (error) throw error;
  return data.map((s) => ({
    date: s.date,
    km: s.km,
    itemIds: s.service_items.map((i) => i.maintenance_item_id),
  }));
}

export async function getDueSummary() {
  const vehicle = await getVehicle();
  const [items, services, currentKm] = await Promise.all([
    getMaintenanceItems(vehicle.id),
    getServiceRecords(vehicle.id),
    getCurrentKm(vehicle.id),
  ]);
  const due: ItemDue[] = computeDue({
    items: items.map(toScheduleItem),
    services,
    baseline: { date: vehicle.purchase_date, km: vehicle.initial_km },
    currentKm,
    today: todayInMexico(),
  });
  return { vehicle, items, currentKm, due, hasServices: services.length > 0 };
}
