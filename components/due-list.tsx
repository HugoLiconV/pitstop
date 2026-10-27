import Link from "next/link";
import type { DueStatus, ItemDue } from "@/lib/due";
import { formatRemaining } from "@/lib/format";

const tone: Record<DueStatus, string> = {
  vencido: "text-overdue",
  proximo: "text-due-soon",
  ok: "text-ok",
};

// Shape carries the status too, so soon vs. ok never rests on colour alone: full, half, empty.
const mark: Record<DueStatus, string> = { vencido: "●", proximo: "◐", ok: "○" };
const statusLabel: Record<DueStatus, string> = {
  vencido: "Vencido",
  proximo: "Próximo",
  ok: "Al día",
};

// Life used on one warm scale: sage while fresh, amber as it nears the limit, rust once it's past.
function lifeColor(used: number): string {
  const t = Math.min(Math.max(used, 0), 1);
  const [from, to, k] =
    t <= 0.75
      ? ([[95, 122, 90], [184, 106, 27], t / 0.75] as const)
      : ([[184, 106, 27], [163, 64, 46], (t - 0.75) / 0.25] as const);
  const [r, g, b] = from.map((v, i) => Math.round(v + (to[i] - v) * k));
  return `rgb(${r} ${g} ${b})`;
}

// The service interval uses the first limit reached: kilometres or calendar months.
export function formatInterval({ item }: ItemDue): string {
  const parts: string[] = [];
  if (item.intervalKm) parts.push(`${new Intl.NumberFormat("es-MX").format(item.intervalKm)} km`);
  if (item.intervalMonths) parts.push(`${item.intervalMonths} ${item.intervalMonths === 1 ? "mes" : "meses"}`);
  return parts.join(" o ");
}

/** A numbered logbook list. `start` continues the numbering across sections; `grouped` rows leave their status to the group's heading. */
export function DueList({
  items,
  start = 1,
  grouped = false,
  sharedInterval = false,
}: {
  items: ItemDue[];
  start?: number;
  grouped?: boolean;
  sharedInterval?: boolean;
}) {
  return (
    <ol className="flex flex-col">
      {items.map((d, i) => (
        <li
          key={d.item.id}
          id={`pendiente-${String(start + i).padStart(2, "0")}`}
          className="motion-safe:animate-[rise_320ms_cubic-bezier(.2,.8,.2,1)_both]"
          style={{ animationDelay: `${Math.min(i, 8) * 30}ms` }}
        >
          <div className="flex items-baseline gap-2.5 border-t border-line">
          
          <Link
            href={`/historial?item=${d.item.id}`}
            className="group grid min-h-14 min-w-0 flex-1 grid-cols-1 items-baseline gap-x-2 py-3 transition-colors hover:bg-card active:bg-card focus-visible:outline-2 focus-visible:outline-accent"
          >
            <span className="flex min-w-0 flex-col gap-1.5">
              <span className="font-sans text-[14px] leading-[1.4]">
                {grouped ? <span className="grid grid-cols-[minmax(0,1fr)_65px] items-baseline gap-3"><span>{d.item.name.replace(/^(Inspección de |Cambio de )/, "").replace(/^./, c => c.toUpperCase())}</span><span className={`text-right text-[12px] ${d.item.name.startsWith("Cambio de ") ? "font-semibold text-ink" : "text-muted"}`}>{d.item.name.startsWith("Inspección de ") ? "Inspección" : d.item.name.startsWith("Cambio de ") ? "Cambio" : "Revisión"}</span>{!sharedInterval && <span className="col-span-2 text-[12px] text-muted">Cada {formatInterval(d)}</span>}</span> : d.item.name}
              </span>
              {!grouped && (
                <>
                  <span
                    className={`flex items-baseline gap-1.5 font-mono text-[11.5px] tabular-nums ${tone[d.status]}`}
                  >
                    <span aria-hidden className="text-[10px]">
                      {mark[d.status]}
                    </span>
                    <span className="sr-only">{statusLabel[d.status]}: </span>
                    {formatRemaining(d)}
                  </span>
                  <span
                    role="meter"
                    aria-label="Vida usada"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(Math.min(d.used, 1) * 100)}
                    className="mt-0.5 block h-[3px] w-full overflow-hidden rounded-full bg-line"
                  >
                    <span
                      className="block h-full rounded-full"
                      style={{
                        width: `${Math.max(Math.min(d.used, 1), 0.03) * 100}%`,
                        background: lifeColor(d.used),
                      }}
                    />
                  </span>
                </>
              )}
            </span>

          </Link>
          </div>
        </li>
      ))}
    </ol>
  );
}
