"use client";

import { formatKm } from "@/lib/format";

// An instrument-cluster plate: each digit is a drum that rolls into place when the value changes.
export function Odometer({ value }: { value: number }) {
  const digits = String(value).padStart(6, "0").split("");
  return (
    <div className="rounded-2xl bg-[#2b241d] p-4 shadow-[inset_0_2px_6px_rgb(0_0_0/0.45),0_10px_24px_-12px_rgb(138_77_16/0.55)]">
      <p className="sr-only">{formatKm(value)}</p>
      <div aria-hidden className="flex items-end justify-between gap-3">
        <div className="figures flex gap-1 text-5xl leading-none font-semibold text-[#f2a65a]">
          {digits.map((ch, i) => (
            <span
              key={digits.length - i}
              className="relative inline-block h-[1.15em] w-[0.72em] overflow-hidden rounded-md bg-[#1c1712] shadow-[inset_0_6px_8px_-4px_rgb(0_0_0/0.8),inset_0_-6px_8px_-4px_rgb(0_0_0/0.8)]"
            >
              <span
                className="flex flex-col items-center transition-transform duration-[450ms] ease-[cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none"
                style={{ transform: `translateY(-${Number(ch) * 1.15}em)` }}
              >
                {Array.from({ length: 10 }, (_, n) => (
                  <span key={n} className={`flex h-[1.15em] items-center ${i < digits.length - String(value).length ? "opacity-35" : ""}`}>
                    {n}
                  </span>
                ))}
              </span>
            </span>
          ))}
        </div>
        <span className="pb-1 text-sm font-medium tracking-wide text-[#b5a796]">km</span>
      </div>
    </div>
  );
}
