"use client";

import { useState } from "react";
import { DueList } from "@/components/due-list";
import { summarizeZones, zoneOf, type DueStatus, type ItemDue, type ZoneId } from "@/lib/due";

const dot: Record<DueStatus, string> = { vencido: "fill-overdue", proximo: "fill-due-soon", ok: "fill-ok" };
const bg: Record<DueStatus, string> = { vencido: "bg-overdue", proximo: "bg-due-soon", ok: "bg-ok" };
const text: Record<DueStatus, string> = { vencido: "text-overdue", proximo: "text-due-soon", ok: "text-muted" };

// Where each zone's marker sits on the top-down drawing (viewBox units).
const SPOTS: Record<ZoneId, [number, number][]> = {
  motor: [[120, 92]],
  fluidos: [[164, 52]],
  ruedas: [[47, 92], [193, 92], [47, 341], [193, 341]],
  cabina: [[120, 246]],
  carroceria: [[120, 372]],
};

/** The car is the index: tap a zone on the drawing or in the legend and the lists below follow. */
export function CarIndex({ due }: { due: ItemDue[] }) {
  const [zone, setZone] = useState<ZoneId | null>(null);
  const zones = summarizeZones(due);
  const toggle = (id: ZoneId) => setZone((z) => (z === id ? null : id));

  const shown = zone ? due.filter((d) => zoneOf(d.item.name) === zone) : due;
  const pending = shown.filter((d) => d.status !== "ok");
  const ok = shown.filter((d) => d.status === "ok");
  const title = zones.find((z) => z.id === zone)?.title;

  return (
    <>
      <section className="grid grid-cols-[132px_1fr] items-center gap-5 rounded-2xl border border-line bg-card p-4">
        <svg viewBox="20 6 200 430" className="h-[260px] w-full" role="group" aria-label="Plano del auto por zonas">
          <CarDrawing />
          {zones.map((z) => {
            const on = zone === z.id;
            return (
              <g
                key={z.id}
                role="button"
                tabIndex={0}
                aria-pressed={on}
                aria-label={z.title}
                className="cursor-pointer outline-none [&:focus-visible_.ring]:stroke-accent"
                onClick={() => toggle(z.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggle(z.id);
                  }
                }}
              >
                {SPOTS[z.id].map(([x, y]) => (
                  <g key={`${x}-${y}`}>
                    <circle cx={x} cy={y} r={22} fill="transparent" />
                    {z.worst === "vencido" && !zone && (
                      <circle cx={x} cy={y} r={7} className={`${dot[z.worst]} origin-center [transform-box:fill-box] motion-safe:animate-[ping_2.4s_ease-out_infinite]`} />
                    )}
                    <circle cx={x} cy={y} r={13} fill="none" strokeWidth={2} className={`ring ${on ? "stroke-accent" : "stroke-transparent"}`} />
                    <circle
                      cx={x}
                      cy={y}
                      r={7.5}
                      strokeWidth={2.5}
                      className={`stroke-card transition-opacity ${dot[z.worst]} ${zone && !on ? "opacity-35" : ""}`}
                    />
                  </g>
                ))}
              </g>
            );
          })}
        </svg>

        <ul className="flex flex-col">
          <li>
            <button
              onClick={() => setZone(null)}
              aria-pressed={!zone}
              className={`label flex w-full items-center justify-between border-b border-line py-2 !text-[11px] !tracking-[0.12em] ${zone ? "" : "!text-ink font-medium"}`}
            >
              Todo <span>{due.length}</span>
            </button>
          </li>
          {zones.map((z) => {
            const on = zone === z.id;
            return (
              <li key={z.id}>
                <button
                  onClick={() => toggle(z.id)}
                  aria-pressed={on}
                  className={`flex w-full items-center gap-2 border-b border-line py-2 text-left text-[14px] ${zone && !on ? "text-muted" : ""}`}
                >
                  <span className={`size-2 shrink-0 rounded-full ${bg[z.worst]}`} />
                  <span className={`flex-1 font-serif ${on ? "font-medium" : ""}`}>{z.title}</span>
                  <span className={`font-mono text-[11px] ${z.pending ? text[z.worst] : "text-muted"}`}>
                    {z.pending ? `${z.pending}/${z.total}` : z.total}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {pending.length > 0 && (
        <section key={`pending-${zone}`} className="flex flex-col">
          <h2 className="label flex items-baseline justify-between border-b border-ink pb-2">
            <span>Para el taller{title ? ` · ${title}` : ""}</span>
            <span>{pending.length}</span>
          </h2>
          <DueList items={pending} />
        </section>
      )}

      {ok.length > 0 && (
        <details key={`ok-${zone}`} className="group" open={pending.length === 0}>
          <summary className="label flex cursor-pointer list-none items-baseline justify-between border-b border-line pb-2 [&::-webkit-details-marker]:hidden">
            <span>Al día · {ok.length}</span>
            <span aria-hidden className="transition-transform group-open:rotate-180 motion-reduce:transition-none">
              ⌄
            </span>
          </summary>
          <DueList items={ok} start={pending.length + 1} />
        </details>
      )}
    </>
  );
}

function CarDrawing() {
  return (
    <g className="fill-none stroke-ink" strokeLinejoin="round" strokeLinecap="round">
      {[[40, 70], [186, 70], [40, 319], [186, 319]].map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={14} height={44} rx={5} className="fill-ink stroke-none" />
      ))}
      <path
        className="fill-card"
        strokeWidth={1.7}
        d="M120 14 C152 14 177 22 185 46 C190 72 191 112 191 152 L191 300 C191 342 189 382 183 399 C177 416 150 424 120 424 C90 424 63 416 57 399 C51 382 49 342 49 300 L49 152 C49 112 50 72 55 46 C63 22 88 14 120 14 Z"
      />
      <path strokeWidth={0.8} opacity={0.45} d="M78 34 C80 70 82 110 84 152 M162 34 C160 70 158 110 156 152 M76 342 C90 346 150 346 164 342 M72 396 C90 402 150 402 168 396" />
      <path strokeWidth={1.1} d="M58 44 C66 32 82 28 96 28 C90 36 76 44 58 52 Z M182 44 C174 32 158 28 144 28 C150 36 164 44 182 52 Z" />
      <path strokeWidth={1.5} className="fill-ink/5" d="M72 158 H168 L160 200 H80 Z M78 296 H162 L170 328 H70 Z" />
      <path strokeWidth={1.5} d="M80 200 H160 L162 296 H78 Z" />
    </g>
  );
}
