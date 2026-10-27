"use client";

import { useState } from "react";

const number = new Intl.NumberFormat("es-MX");

/** Keep the submitted value numeric while displaying readable grouped kilometres. */
export function KmInput({ initialValue }: { initialValue: number }) {
  const [text, setText] = useState(() => number.format(initialValue));
  const raw = text.replace(/[,\s]/g, "");

  return (
    <span className="flex h-12 items-center rounded-2xl border border-line bg-card focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/30">
      <input type="text" inputMode="numeric" pattern="[0-9](?:[0-9,\s]*[0-9])?" maxLength={18} required value={text}
        onChange={event => setText(event.target.value)}
        onFocus={() => setText(raw)}
        onBlur={() => { if (/^\d+$/.test(raw) && Number.isSafeInteger(Number(raw))) setText(number.format(Number(raw))); }}
        className="min-w-0 w-full bg-transparent pl-4 font-mono text-[17px] font-light outline-none" />
      <input type="hidden" name="km" value={raw} />
      <span className="pr-4 pl-1 font-mono text-[10px] uppercase text-muted">km</span>
    </span>
  );
}
