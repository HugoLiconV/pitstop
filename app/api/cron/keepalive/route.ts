import { createClient } from "@supabase/supabase-js";
import { isCronAuthorized } from "@/lib/cron-auth";

// Weekly ping so the free Supabase project doesn't pause after 7 idle days.
export async function GET(request: Request) {
  if (!isCronAuthorized(request.headers.get("authorization"), process.env.CRON_SECRET)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  // RLS returns no rows to the anon key; the query still counts as activity.
  const { error } = await supabase.from("vehicles").select("id").limit(1);
  if (error) return Response.json({ ok: false }, { status: 502 });
  return Response.json({ ok: true });
}
