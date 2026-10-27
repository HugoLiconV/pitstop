import Link from "next/link";
import type { DueStatus, ItemDue } from "@/lib/due";
import { formatRemaining } from "@/lib/format";

const tone: Record<DueStatus, string> = {
  vencido: "text-overdue",
  proximo: "text-due-soon",
  ok: "text-ok",
};

// Life used on one warm scale: sage while fresh, amber as it nears the limit, rust once it's past.
function lifeColor(used: number): string {
  const t = Math.min(Math.max(used, 0), 1);
  const [from, to, k] = t <= 0.75 ? ([[95, 122, 90], [184, 106, 27], t / 0.75] as const) : ([[184, 106, 27], [163, 64, 46], (t - 0.75) / 0.25] as const);
  const [r, g, b] = from.map((v, i) => Math.round(v + (to[i] - v) * k));
  return `rgb(${r} ${g} ${b})`;
}

/** A numbered logbook list. `start` continues the numbering across sections. */
export function DueList({ items, start = 1 }: { items: ItemDue[]; start?: number }) {
  return (
    <ol className="flex flex-col divide-y divide-line">
      {items.map((d, i) => (
        <li key={d.item.id} className="motion-safe:animate-[rise_320ms_cubic-bezier(.2,.8,.2,1)_both]" style={{ animationDelay: `${Math.min(i, 8) * 30}ms` }}>
          <Link
            href={`/historial?item=${d.item.id}`}
            className="-mx-3 grid grid-cols-[2rem_1fr] gap-x-1 rounded-lg px-3 py-3.5 transition-colors hover:bg-card focus-visible:outline-2 focus-visible:outline-accent"
          >
            <span className="pt-1 font-mono text-[11px] text-muted">{String(start + i).padStart(2, "0")}</span>
            <span className="flex flex-col gap-2">
              <span className="font-serif text-[18px] leading-snug">{d.item.name}</span>
              <span className="flex items-center gap-3">
                <span
                  role="meter"
                  aria-label="Vida usada"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(Math.min(d.used, 1) * 100)}
                  className="h-[3px] flex-1 overflow-hidden rounded-full bg-line"
                >
                  <span
                    className="block h-full rounded-full"
                    style={{ width: `${Math.max(Math.min(d.used, 1), 0.03) * 100}%`, background: lifeColor(d.used) }}
                  />
                </span>
                <span className={`shrink-0 font-mono text-[11.5px] ${tone[d.status]}`}>{formatRemaining(d)}</span>
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
