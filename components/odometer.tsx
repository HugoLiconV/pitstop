"use client";

import { formatKm } from "@/lib/format";


// A rolling counter: each digit drums into place when the value changes.
export function Odometer({ value }: { value: number }) {
  const chars = String(Math.max(value, 0)).split("");
  return (
    <div className="flex items-center gap-0 font-mono text-[44px] leading-none font-light tracking-[-0.04em] tabular-nums">
      <p className="sr-only">{formatKm(value)}</p>
      {chars.map((ch, i) =>
        /\d/.test(ch) ? (
          <span key={chars.length - i} aria-hidden className={`inline-flex h-[1.1em] w-[0.62em] items-center justify-center ${i > 0 && (chars.length - i) % 3 === 0 ? "ml-[0.18em]" : ""}`}>
            <span className="relative block h-[1em] overflow-hidden"><span
              className="flex flex-col items-center transition-transform duration-[450ms] ease-[cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none"
              style={{ transform: `translateY(-${Number(ch)}em)` }}
            >
              {Array.from({ length: 10 }, (_, n) => (
                <span key={n} className="h-[1em]">
                  {n}
                </span>
              ))}
            </span></span>
          </span>
        ) : (
          // Preserve the locale separator while the numeric drums animate.
          <span key={chars.length - i} aria-hidden>{ch}</span>
        ),
      )}
      <span aria-hidden className="ml-2 self-end pb-2 font-mono text-[10px] font-normal uppercase tracking-normal text-muted">
        km
      </span>
    </div>
  );
}
