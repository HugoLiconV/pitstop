import { buildCarContext } from "@/lib/assistant/context";
import { daysBetween, todayInMexico } from "@/lib/due";
import { getDueSummary } from "@/lib/data/due";
import { listServices } from "@/lib/data/history";
import { createClient } from "@/lib/supabase/server";

// Pace from the oldest service to the latest reading; the purchase reading is skipped because it may be a placeholder.
async function getKmPerDay(vehicleId: string, oldest: { date: string; km: number } | undefined): Promise<number | null> {
  if (!oldest) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("odometer_readings")
    .select("date, km")
    .eq("vehicle_id", vehicleId)
    .order("date", { ascending: false })
    .order("km", { ascending: false })
    .limit(1)
    .single();
  if (error) throw error;
  const days = daysBetween(oldest.date, data.date);
  return days > 0 ? (data.km - oldest.km) / days : null;
}

export async function getCarContext(): Promise<string> {
  const [{ vehicle, currentKm, due }, services] = await Promise.all([getDueSummary(), listServices()]);
  const kmPerDay = await getKmPerDay(vehicle.id, services.at(-1));
  return buildCarContext({
    vehicleName: vehicle.name,
    currentKm,
    kmPerDay,
    today: todayInMexico(),
    services: services.map((s) => ({
      date: s.date,
      km: s.km,
      workshop: s.workshop,
      total: s.total_cost_mxn,
      notes: s.notes,
      items: s.service_items.flatMap((i) => (i.maintenance_items ? [i.maintenance_items.name] : [])),
    })),
    due,
  });
}
