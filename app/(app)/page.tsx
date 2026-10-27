import Image from "next/image";
import { Suspense } from "react";
import Loading from "./loading";
import { CarIndex } from "@/components/car-index";
import { Odometer } from "@/components/odometer";
import { Chip, Label, Panel, PillAction } from "@/components/ui";
import { UpdateKmSheet } from "@/components/update-km-sheet";
import { getDueSummary } from "@/lib/data/due";

async function InicioContent() {
  const { currentKm, due, hasServices } = await getDueSummary();
  const items = due.filter(item => item.item.active);

  const summary = <>
    <header className="flex items-center justify-between gap-4">
      <span className="text-[22px] font-semibold tracking-[-0.06em]">pitstop<span className="text-accent">/</span></span>
      <Label as="span">Bitácora personal</Label>
    </header>
    <Panel as="section" className="relative mt-5 overflow-hidden !pt-6">
      <h1 className="text-[34px] font-light leading-none tracking-[-0.045em]">Mazda 6</h1>
      <div className="mt-3 flex flex-wrap gap-1.5"><Chip>2015</Chip><Chip>Grand Touring Plus</Chip></div>
      <Image src="/mazda6-manual.png" alt="" width={1828} height={860} priority className="pointer-events-none mx-auto mt-3 w-[94%] mix-blend-multiply" />
      <div className="relative mt-1 flex items-end justify-between gap-3">
        <div><Label className="mb-1">Kilometraje actual</Label><UpdateKmSheet currentKm={currentKm}><Odometer value={currentKm} /></UpdateKmSheet></div>
      </div>
      <p className="mt-4 flex items-center gap-2 text-[11px] text-muted"><span aria-hidden className="size-1.5 rounded-full bg-accent" />{hasServices ? "Tu bitácora, al día con cada visita." : "Sin servicios registrados"}</p>
      {!hasServices && <PillAction href="/servicios/nuevo" className="mt-5">Registrar primer servicio</PillAction>}
    </Panel>
  </>;

  return <div className="pb-3">{items.length ? <CarIndex due={items} hasServices={hasServices}>{summary}</CarIndex> : <>{summary}<p className="my-6 text-[15px] text-muted">Tu plan está vacío. Agrega mantenimientos para saber qué toca.</p></>}</div>;
}

export default function Inicio() {
  return <Suspense fallback={<Loading />}><InicioContent /></Suspense>;
}
