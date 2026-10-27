import Link from "next/link";
import { CarIndex } from "@/components/car-index";
import { Odometer } from "@/components/odometer";
import { UpdateKmSheet } from "@/components/update-km-sheet";
import { getDueSummary } from "@/lib/data/due";
import { formatRemaining } from "@/lib/format";

const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

export default async function Inicio() {
  const { currentKm, due, hasServices } = await getDueSummary();
  const items = due.filter((d) => d.item.active);
  const pending = items.filter((d) => d.status !== "ok");
  const overdue = pending.some((d) => d.status === "vencido");
  const first = pending[0];
  const next = items.find((d) => d.status === "ok");

  return (
    <div className="-mt-2 flex flex-col gap-7">
      <header className="label flex items-center justify-between border-b border-ink pb-3">
        <span>Bitácora · Mazda 6</span>
        <span>2015 · Grand Touring Plus</span>
      </header>

      {/* The answer first: how many, and where to start. */}
      <section className="flex flex-col gap-3">
        <h1 className="font-serif text-[40px] leading-[1.05] tracking-[-0.015em]">
          {pending.length === 0 ? (
            "Todo en orden."
          ) : (
            <>
              <span className={overdue ? "text-overdue" : "text-due-soon"}>{pending.length}</span>{" "}
              {pending.length === 1 ? "pendiente" : "pendientes"}.
            </>
          )}
        </h1>
        {first ? (
          <p className="-mt-1 font-serif text-[19px] leading-snug text-muted italic">
            Empieza por <span className="text-ink">{lowerFirst(first.item.name)}</span>.
          </p>
        ) : (
          next && (
            <p className="-mt-1 font-serif text-[19px] leading-snug text-muted italic">
              Lo siguiente: <span className="text-ink">{lowerFirst(next.item.name)}</span>, {formatRemaining(next)}.
            </p>
          )
        )}
        {!hasServices && (
          <p className="border-l-2 border-accent pl-3 font-serif text-[15px] leading-relaxed text-muted italic">
            Aún no hay historial, así que todo se cuenta desde la compra. Registra el último servicio que recuerdes y el plan se acomoda solo.
          </p>
        )}
      </section>

      <section className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="label">Odómetro</span>
          <Odometer value={currentKm} />
        </div>
        <UpdateKmSheet currentKm={currentKm} />
      </section>

      <Link href="/servicios/nuevo" className="btn-primary text-lg">
        Registrar servicio
      </Link>

      {items.length > 0 ? (
        <CarIndex due={items} />
      ) : (
        <p className="font-serif text-[17px] text-muted italic">
          El plan está vacío. Agrega piezas en Plan y aquí verás qué toca.
        </p>
      )}
    </div>
  );
}
