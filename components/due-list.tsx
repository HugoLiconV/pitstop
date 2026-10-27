import Link from "next/link";
import type { DueStatus, ItemDue } from "@/lib/due";
import { formatRemaining } from "@/lib/format";

const tone: Record<DueStatus, { text: string; bar: string }> = {
  vencido: { text: "text-overdue", bar: "bg-overdue/45" },
  proximo: { text: "text-due-soon", bar: "bg-accent" },
  ok: { text: "text-ok", bar: "bg-ok" },
};

export function DueList({ items }: { items: ItemDue[] }) {
  return (
    <ul className="flex flex-col">
      {items.map((d) => (
        <li key={d.item.id}>
          <Link
            href={`/historial?item=${d.item.id}`}
            className="-mx-2 flex flex-col gap-2 rounded-lg px-2 py-3 transition-colors hover:bg-card"
          >
            <span className="flex items-baseline justify-between gap-4">
              <span className="font-medium">{d.item.name}</span>
              <span className={`figures shrink-0 text-sm ${tone[d.status].text}`}>{formatRemaining(d)}</span>
            </span>
            <span
              role="meter"
              aria-label="Vida usada"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(d.used * 100)}
              className="h-1 overflow-hidden rounded-full bg-line"
            >
              <span className={`block h-full rounded-full ${tone[d.status].bar}`} style={{ width: `${Math.max(d.used, 0.03) * 100}%` }} />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
