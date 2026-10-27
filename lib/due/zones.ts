import type { DueStatus, ItemDue } from "./compute";

export type ZoneId = "motor" | "fluidos" | "ruedas" | "cabina" | "carroceria";

export const ZONES: { id: ZoneId; title: string }[] = [
  { id: "motor", title: "Motor" },
  { id: "fluidos", title: "Fluidos y batería" },
  { id: "ruedas", title: "Llantas y frenos" },
  { id: "cabina", title: "Cabina" },
  { id: "carroceria", title: "Carrocería" },
];

// Order matters: "Líquido de frenos" is a fluid before it is a brake, "Filtro de aire de cabina" is cabin before engine.
const RULES: [ZoneId, RegExp][] = [
  ["cabina", /cabina|limpiaparabrisas|plumas|aire acondicionado/],
  ["fluidos", /l[ií]quido|refrigerante|anticongelante|enfriamiento|bater[ií]a/],
  ["ruedas", /neum[aá]tic|llanta|rotaci[oó]n|freno|balata|alineaci[oó]n|balanceo|direcci[oó]n|suspensi[oó]n|fundas de ejes/],
  ["motor", /aceite|motor|buj[ií]a|correa|banda|combustible|evaporativo|escape|distribuci[oó]n/],
];

/** Where on the car an item lives, from its name. Anything unrecognised is bodywork. */
export function zoneOf(name: string): ZoneId {
  const s = name.toLowerCase();
  return RULES.find(([, re]) => re.test(s))?.[0] ?? "carroceria";
}

const RANK: Record<DueStatus, number> = { vencido: 0, proximo: 1, ok: 2 };

export interface ZoneSummary {
  id: ZoneId;
  title: string;
  total: number;
  pending: number;
  worst: DueStatus;
}

/** Zones that have items, each with its most urgent status. */
export function summarizeZones(due: ItemDue[]): ZoneSummary[] {
  return ZONES.flatMap(({ id, title }) => {
    const items = due.filter((d) => zoneOf(d.item.name) === id);
    if (items.length === 0) return [];
    const worst = items.reduce<DueStatus>((w, d) => (RANK[d.status] < RANK[w] ? d.status : w), "ok");
    return [{ id, title, total: items.length, pending: items.filter((d) => d.status !== "ok").length, worst }];
  });
}
