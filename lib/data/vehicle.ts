import { createClient } from "@/lib/supabase/server";

export type Reading = { date: string; km: number };

export async function getVehicle() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("vehicles").select("*").limit(1).single();
  if (error) throw error;
  return data;
}

// Latest reading by date; ties go to the highest km.
export async function getCurrentKm(vehicleId: string): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("odometer_readings")
    .select("km")
    .eq("vehicle_id", vehicleId)
    .order("date", { ascending: false })
    .order("km", { ascending: false })
    .limit(1)
    .single();
  if (error) throw error;
  return data.km;
}

// Readings around a date: the highest on or before it, the lowest after it.
export async function getOdometerNeighbors(
  vehicleId: string,
  date: string,
): Promise<{ before: Reading | null; after: Reading | null }> {
  const supabase = await createClient();
  const [before, after] = await Promise.all([
    supabase
      .from("odometer_readings")
      .select("date, km")
      .eq("vehicle_id", vehicleId)
      .lte("date", date)
      .order("km", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("odometer_readings")
      .select("date, km")
      .eq("vehicle_id", vehicleId)
      .gt("date", date)
      .order("km", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);
  if (before.error) throw before.error;
  if (after.error) throw after.error;
  return { before: before.data, after: after.data };
}
