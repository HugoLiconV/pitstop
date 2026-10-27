import Link from "next/link";
import type { ItemDue } from "@/lib/due";
import { formatRemaining } from "@/lib/format";

const tone = {
  vencido: "text-overdue",
  proximo: "text-due-soon",
  ok: "text-ok",
} as const;

export function DueList({ items }: { items: ItemDue[] }) {
  return (
    <ul className="divide-y divide-line">
      {items.map((d) => (
        <li key={d.item.id} className="py-3">
          <Link href={`/historial?item=${d.item.id}`} className="block">
            <p className="font-medium">{d.item.name}</p>
            <p className={`figures text-sm ${tone[d.status]}`}>{formatRemaining(d)}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
