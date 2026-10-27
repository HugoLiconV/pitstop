import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import Loading from "./loading";
import { CarIndex } from "@/components/car-index";
import { Odometer } from "@/components/odometer";
import { UpdateKmSheet } from "@/components/update-km-sheet";
import { getDueSummary } from "@/lib/data/due";

async function InicioContent() {
  const { currentKm, due, hasServices } = await getDueSummary();
  const items = due.filter(item => item.item.active);

  const summary = <>
    <header className="flex items-center justify-between gap-4">
      <span className="text-[22px] font-semibold tracking-[-0.06em]">pitstop<span className="text-accent">/</span></span>
      <span className="label">Bitácora personal</span>
    </header>
    <section className="panel relative mt-5 overflow-hidden px-5 pt-6 pb-5">
      <h1 className="text-[34px] font-light leading-none tracking-[-0.045em]">Mazda 6</h1>
      <div className="mt-3 flex flex-wrap gap-1.5"><span className="chip">2015</span><span className="chip">Grand Touring Plus</span></div>
      <Image src="/mazda6-manual.png" alt="" width={1828} height={860} priority className="pointer-events-none mx-auto mt-3 w-[94%] mix-blend-multiply" />
      <div className="relative mt-1 flex items-end justify-between gap-3">
        <div><p className="label mb-1">Kilometraje actual</p><UpdateKmSheet currentKm={currentKm}><Odometer value={currentKm} /></UpdateKmSheet></div>
      </div>
      <p className="mt-4 flex items-center gap-2 text-[11px] text-muted"><span aria-hidden className="size-1.5 rounded-full bg-accent" />{hasServices ? "Tu bitácora, al día con cada visita." : "Sin servicios registrados"}</p>
      {!hasServices && <Link href="/servicios/nuevo" className="btn-primary mt-5 justify-between !pr-2">Registrar primer servicio<span aria-hidden className="inline-flex size-9 items-center justify-center rounded-full bg-card text-ink"><svg viewBox="0 0 24 24" className="size-4 fill-none stroke-current stroke-[1.5]"><path d="M7 17 17 7M8 7h9v9" /></svg></span></Link>}
    </section>
  </>;

  return <div className="pb-3">{items.length ? <CarIndex due={items} hasServices={hasServices}>{summary}</CarIndex> : <>{summary}<p className="my-6 text-[15px] text-muted">Tu plan está vacío. Agrega mantenimientos para saber qué toca.</p></>}</div>;
}

export default function Inicio() {
  return <Suspense fallback={<Loading />}><InicioContent /></Suspense>;
}
