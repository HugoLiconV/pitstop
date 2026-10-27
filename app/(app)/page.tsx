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
      <section className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <h1 className="text-lg font-semibold">Mazda 6</h1>
          <span className="text-sm text-muted">2015 · Grand Touring Plus</span>
        </div>
        <Odometer value={currentKm} />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-2xl font-semibold tracking-tight">
            {pending === 0 ? (
              "Todo al día"
            ) : (
              <>
                <span className={overdue.length > 0 ? "text-overdue" : "text-due-soon"}>{pending}</span>{" "}
                {pending === 1 ? "pendiente" : "pendientes"}
              </>
            )}
          </p>
          <UpdateKmSheet currentKm={currentKm} />
        </div>
        {pending === 0 && ok[0] && (
          <p className="-mt-2 text-muted">
            Lo siguiente: {ok[0].item.name.toLowerCase()}, {formatRemaining(ok[0])}.
          </p>
        )}
      </section>

      {!hasServices && (
        <p className="rounded-xl border border-dashed border-accent/40 bg-card p-4 text-sm leading-relaxed">
          Sin servicios todavía. Registra el último que recuerdes y empezamos desde ahí.
        </p>
      )}

      <Link href="/servicios/nuevo" className="btn-primary text-lg">
        Registrar servicio
      </Link>

      {overdue.length > 0 && (
        <section className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold">
            Vencido <span className="figures font-medium text-overdue">{overdue.length}</span>
          </h2>
          <DueList items={overdue} />
        </section>
      )}
      {soon.length > 0 && (
        <section className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold">
            Próximo <span className="figures font-medium text-due-soon">{soon.length}</span>
          </h2>
          <DueList items={soon} />
        </section>
      )}
      {ok.length > 0 && (
        <details className="group flex flex-col gap-1">
          <summary className="flex cursor-pointer list-none items-center justify-between text-lg font-semibold [&::-webkit-details-marker]:hidden">
            <span>
              Al día <span className="figures font-medium text-ok">{ok.length}</span>
            </span>
            <span aria-hidden className="text-muted transition-transform group-open:rotate-180 motion-reduce:transition-none">
              ⌄
            </span>
          </summary>
          <DueList items={ok} />
        </details>
      )}
    </div>
  );
}
