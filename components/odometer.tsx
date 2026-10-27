"use client";

import { formatKm } from "@/lib/format";

// Paper drums in a row: each digit rolls into place when the value changes. The last drum is amber, as on a real counter.
export function Odometer({ value }: { value: number }) {
  const digits = String(value).padStart(6, "0").split("");
  const lead = digits.length - String(value).length;
  return (
    <div className="flex items-end gap-[3px] font-mono text-[30px] leading-none font-medium">
      <p className="sr-only">{formatKm(value)}</p>
      {digits.map((ch, i) => (
        <span
          key={digits.length - i}
          aria-hidden
          className={`relative inline-block h-[1.2em] w-[0.78em] overflow-hidden rounded-[4px] border border-line bg-card ${
            i === digits.length - 1 ? "text-accent" : i < lead ? "text-line" : "text-ink"
          }`}
        >
          <span
            className="flex flex-col items-center transition-transform duration-[450ms] ease-[cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none"
            style={{ transform: `translateY(-${Number(ch) * 1.2}em)` }}
          >
            {Array.from({ length: 10 }, (_, n) => (
              <span key={n} className="flex h-[1.2em] items-center">
                {n}
              </span>
            ))}
          </span>
        </span>
      ))}
      <span aria-hidden className="label ml-1.5 pb-1 !text-[11px]">
        km
      </span>
    </div>
  );
}
