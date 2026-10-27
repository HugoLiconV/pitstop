"use client";

import { formatKm } from "@/lib/format";

// Each digit is a 0–9 column; changing the value rolls the column into place.
export function Odometer({ value }: { value: number }) {
  const digits = new Intl.NumberFormat("es-MX").format(value).split("");
  return (
    <p className="figures flex items-baseline text-6xl font-semibold tracking-tight text-accent-ink">
      <span className="sr-only">{formatKm(value)}</span>
      <span aria-hidden className="flex">
        {digits.map((ch, i) =>
          /\d/.test(ch) ? (
            <span key={digits.length - i} className="relative inline-block h-[1em] overflow-hidden leading-none">
              <span
                className="flex flex-col transition-transform duration-[400ms] ease-out motion-reduce:transition-none"
                style={{ transform: `translateY(-${Number(ch)}em)` }}
              >
                {Array.from({ length: 10 }, (_, n) => (
                  <span key={n} className="h-[1em]">
                    {n}
                  </span>
                ))}
              </span>
            </span>
          ) : (
            <span key={`sep-${digits.length - i}`} className="leading-none">
              {ch}
            </span>
          ),
        )}
      </span>
      <span aria-hidden className="ml-2 text-2xl font-medium text-muted">
        km
      </span>
    </p>
  );
}
