import Link from "next/link";
import { DueList } from "@/components/due-list";
import { Odometer } from "@/components/odometer";
import { UpdateKmSheet } from "@/components/update-km-sheet";
import { getDueSummary } from "@/lib/data/due";
import { formatRemaining } from "@/lib/format";

export default async function Inicio() {
  const { currentKm, due, hasServices } = await getDueSummary();
  const overdue = due.filter((d) => d.status === "vencido");
  const soon = due.filter((d) => d.status === "proximo");
  const ok = due.filter((d) => d.status === "ok");
  const pending = overdue.length + soon.length;

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <p className="text-sm text-muted">Mazda 6 · kilometraje</p>
        <Odometer value={currentKm} />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-lg">
            {pending === 0 ? "Todo al día." : `${pending} ${pending === 1 ? "pendiente" : "pendientes"}`}
          </p>
          <UpdateKmSheet currentKm={currentKm} />
        </div>
        {pending === 0 && ok[0] && (
          <p className="text-sm text-muted">
            Lo siguiente: {ok[0].item.name.toLowerCase()}, {formatRemaining(ok[0])}.
          </p>
        )}
      </section>

      {!hasServices && (
        <p className="rounded-xl border border-line bg-card p-4 text-sm">
          Sin servicios todavía. Registra el último que recuerdes y empezamos desde ahí.
        </p>
      )}

      <Link href="/servicios/nuevo" className="btn-primary">
        + Registrar servicio
      </Link>

      {overdue.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold tracking-wide text-overdue uppercase">Vencido</h2>
          <DueList items={overdue} />
        </section>
      )}
      {soon.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold tracking-wide text-due-soon uppercase">Próximo</h2>
          <DueList items={soon} />
        </section>
      )}
      {ok.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer text-sm font-semibold tracking-wide text-ok uppercase">
            Todo al día ({ok.length})
          </summary>
          <DueList items={ok} />
        </details>
      )}
    </div>
  );
}
