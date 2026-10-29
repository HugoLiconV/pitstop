// Asks each allowed model questions with known answers, using the real history (read-only) and the indexed manual.
// Run: npx tsx --env-file=.env.local scripts/check-assistant.mts
import { execFileSync } from "node:child_process";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { buildCarContext } from "@/lib/assistant/context";
import { MODELS } from "@/lib/assistant/models";
import { buildInstructions } from "@/lib/assistant/prompt";
import { computeDue } from "@/lib/due/compute";
import { todayInMexico } from "@/lib/due/dates";

const QUESTIONS = [
  "¿Cuántos litros de aceite lleva el motor con filtro?",
  "¿Qué presión deben llevar las llantas?",
  "¿Cómo reinicio el monitor de presión de llantas (TPMS)?",
  "¿Qué tipo de líquido de frenos usa?",
  "¿Cada cuánto se cambia el aceite según el manual?",
  "¿Qué significa el testigo amarillo con forma de motor?",
  "¿Cuándo cambié balatas por última vez?",
  "¿Qué me toca hacer ahora?",
  "Recomiéndame un taller para cambiar el líquido de frenos.",
];

function query<T>(sql: string): T[] {
  const out = execFileSync("npx", ["supabase", "db", "query", "--linked", sql], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  return JSON.parse(out.slice(out.indexOf("{"))).rows;
}

const [vehicle] = query<{ id: string; name: string; purchase_date: string; initial_km: number }>(
  "select id, name, purchase_date, initial_km from vehicles limit 1",
);
const items = query<{ id: string; name: string; interval_km: number | null; interval_months: number | null; active: boolean }>(
  "select id, name, interval_km, interval_months, active from maintenance_items",
);
const services = query<{ date: string; km: number; workshop: string | null; total: number | null; notes: string | null; item_ids: string[]; items: string[] }>(
  "select s.date, s.km, s.workshop, s.total_cost_mxn::float as total, s.notes, array_agg(m.id) as item_ids, array_agg(m.name) as items from services s join service_items i on i.service_id = s.id join maintenance_items m on m.id = i.maintenance_item_id group by s.id",
);
const [latest] = query<{ date: string; km: number }>("select date, km from odometer_readings order by date desc, km desc limit 1");

const today = todayInMexico();
const oldest = [...services].sort((a, b) => a.date.localeCompare(b.date))[0];
const days = (Date.parse(latest.date) - Date.parse(oldest.date)) / 86_400_000;
const context = buildCarContext({
  vehicleName: vehicle.name,
  currentKm: latest.km,
  kmPerDay: days > 0 ? (latest.km - oldest.km) / days : null,
  today,
  services,
  due: computeDue({
    items: items.map((r) => ({ id: r.id, name: r.name, intervalKm: r.interval_km, intervalMonths: r.interval_months, active: r.active })),
    services: services.map((s) => ({ date: s.date, km: s.km, itemIds: s.item_ids })),
    baseline: { date: vehicle.purchase_date, km: vehicle.initial_km },
    currentKm: latest.km,
    today,
  }),
});

const tools = {
  file_search: openai.tools.fileSearch({ vectorStoreIds: [process.env.OPENAI_VECTOR_STORE_ID!], maxNumResults: 5 }),
  web_search: openai.tools.webSearch({
    searchContextSize: "low",
    userLocation: { type: "approximate", country: "MX", region: "Chihuahua", city: "Chihuahua", timezone: "America/Chihuahua" },
  }),
};

for (const model of MODELS) {
  console.log(`\n==================== ${model} ====================`);
  for (const question of QUESTIONS) {
    const { text, sources, toolCalls } = await generateText({
      model: openai(model),
      system: buildInstructions(context),
      prompt: question,
      tools,
      maxOutputTokens: 4000,
    });
    console.log(`\n### ${question}\n[tools: ${toolCalls.map((t) => t.toolName).join(", ") || "ninguna"} · fuentes: ${sources.length}]\n${text.trim()}`);
  }
}
