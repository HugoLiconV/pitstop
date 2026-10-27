"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { DueList, formatInterval } from "@/components/due-list";
import { formatRemaining } from "@/lib/format";
import { summarizeZones, zoneOf, type DueStatus, type ItemDue, type ZoneId } from "@/lib/due";

export function CarIndex({ due, children, hasServices }: { due: ItemDue[]; children: React.ReactNode; hasServices: boolean }) {
  const [zone, setZone] = useState<ZoneId | null>(null);
  const headingId = useId();
  const zones = summarizeZones(due);
  const shown = zone ? due.filter(item => zoneOf(item.item.name) === zone) : due;
  const pending = shown.filter(item => item.status !== "ok");
  const ok = shown.filter(item => item.status === "ok");
  const groups = groupByRemaining(pending);
  const first = groups[0];
  const sameInterval = first && new Set(first.items.map(formatInterval)).size === 1;

  if (!hasServices) {
    const reference = due.filter(({ item }) => item.intervalKm === 10_000 && item.intervalMonths === 6);
    return <>
      {children}
      <section className="panel mt-3 px-5 pt-5 pb-4">
        <div className="flex items-center justify-between gap-4 pb-4"><h2 className="text-[22px] font-light tracking-[-0.035em]">Mantenimiento base</h2><Link href="/plan" aria-label="Plan completo" className="orb !bg-bg hover:!bg-line"><svg aria-hidden viewBox="0 0 24 24" className="size-4 fill-none stroke-current stroke-[1.5]"><path d="M7 17 17 7M8 7h9v9" /></svg></Link></div>
        <p className="text-[30px] font-light leading-none tracking-[-0.04em]">10,000 <span className="text-[12px] font-normal tracking-normal text-muted">km</span><span className="mx-3 text-[12px] font-normal text-muted">/</span>6 <span className="text-[12px] font-normal tracking-normal text-muted">meses</span></p>
        <p className="mt-2 mb-5 max-w-64 text-[11px] leading-relaxed text-muted">Cada intervalo, lo que ocurra primero. Tu último servicio es el punto de partida para calcular el próximo.</p>
        <div className="grid grid-cols-[80px_1fr] gap-3 border-b border-line py-2 font-mono text-[9px] uppercase tracking-[0.08em] text-muted"><span>Operación</span><span>Elemento</span></div>
        <ul>
          {[...reference].sort((a,b) => Number(b.item.name.startsWith("Cambio de ")) - Number(a.item.name.startsWith("Cambio de "))).map(item => <li key={item.item.id} className="grid min-h-13 grid-cols-[80px_1fr] items-baseline gap-3 border-b border-line py-4 last:border-0"><span className="chip !px-2.5 !py-1 justify-self-start">{item.item.name.startsWith("Cambio de ") ? "Cambiar" : "Revisar"}</span><span className="text-[13px] leading-relaxed">{item.item.name.replace(/^(Inspección de |Cambio de )/, "").replace(/^./, char => char.toUpperCase())}</span></li>)}
        </ul>
        <p className="mt-4 text-[11px] leading-relaxed text-muted">Las fechas de este plan se ajustarán con tu primer registro.</p>
      </section>
    </>;
  }

  return <>
    {children}
    <div className="mt-7 flex items-center justify-between gap-3">
      <h2 id={headingId} className="text-[26px] font-light tracking-[-0.04em]">Próxima visita</h2>
      <div className="relative">
        <select aria-label="Filtrar por sistema" value={zone ?? ""} onChange={event => { setZone(event.target.value as ZoneId || null); }} className="max-w-[110px] cursor-pointer appearance-none bg-transparent py-2 pr-6 text-right text-[11px] text-muted focus-visible:outline-2 focus-visible:outline-accent">
          <option value="">Todo el auto</option>
          {zones.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
        </select>
        <svg aria-hidden viewBox="0 0 16 16" className="pointer-events-none absolute top-1/2 right-0 size-3 -translate-y-1/2 fill-none stroke-current stroke-[1.5]"><path d="m4 6 4 4 4-4" /></svg>
      </div>
    </div>
    {first && <section key={`${zone}-${first.label}`} aria-labelledby={headingId} className="panel mt-2 p-2 pb-1 [&_ol]:px-3">
      <div className="mb-3 rounded-[22px] bg-ink px-5 py-5 text-card">
        <p className="mb-2 text-[10px] tracking-[0.08em] uppercase opacity-60">{first.items.some(item => !item.last) ? "Plan estimado · frecuencia" : first.label}</p>
        <p className="text-[26px] font-semibold leading-none tracking-[-0.02em]">{sameInterval ? formatInterval(first.items[0]) : "Según tu plan"}</p>
      </div>
      <DueList items={first.items} grouped={first.status === "vencido"} sharedInterval={sameInterval} />
    </section>}

    <div className="mt-3 mb-5">
      {!hasServices && <p className="mb-3 text-[12px] leading-relaxed text-muted">Sin historial aún. Registra tu último servicio para precisar qué toca.</p>}
      <Link href="/servicios/nuevo" className="btn-primary justify-between !pr-2">Registrar servicio<span aria-hidden className="inline-flex size-9 items-center justify-center rounded-full bg-card text-ink"><svg viewBox="0 0 24 24" className="size-4 fill-none stroke-current stroke-[1.5]"><path d="M7 17 17 7M8 7h9v9" /></svg></span></Link>
    </div>

    {groups.length > 1 && <details className="group/rest mt-0 border-b border-line">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 text-[14px] [&::-webkit-details-marker]:hidden"><span>Otros pendientes</span><span className="ml-auto font-mono text-[12px] text-muted">{pending.length - first.items.length}</span><svg aria-hidden viewBox="0 0 16 16" className="size-3 fill-none stroke-current stroke-[1.5] transition-transform group-open/rest:rotate-180"><path d="m4 6 4 4 4-4" /></svg></summary>
      {groups.slice(1).map((group, index) => <section key={group.label} className="pb-4"><h3 className="py-2 text-[13px] text-muted">{group.items.some(item => !item.last) ? "Sin registro previo · " : ""}{group.label}</h3><DueList items={group.items} start={1 + groups.slice(0, index + 1).reduce((count, previous) => count + previous.items.length, 0)} grouped={group.status === "vencido"} /></section>)}
    </details>}
    {ok.length > 0 && <details key={`ok-${zone}`} className="group/ok border-b border-line" open={!first}>
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 text-[14px] [&::-webkit-details-marker]:hidden"><span>Al día</span><span className="ml-auto font-mono text-[12px] text-muted">{ok.length}</span><svg aria-hidden viewBox="0 0 16 16" className="size-3 fill-none stroke-current stroke-[1.5] transition-transform group-open/ok:rotate-180"><path d="m4 6 4 4 4-4" /></svg></summary>
      <DueList items={ok} start={pending.length + 1} />
    </details>}
  </>;
}

function groupByRemaining(items: ItemDue[]) {
  const groups: { label: string; status: DueStatus; items: ItemDue[] }[] = [];
  for (const item of items) {
    const label = item.status === "vencido" ? formatRemaining(item) : "Próximos";
    const group = groups.find(group => group.label === label);
    if (group) group.items.push(item);
    else groups.push({ label, status: item.status, items: [item] });
  }
  return groups;
}
