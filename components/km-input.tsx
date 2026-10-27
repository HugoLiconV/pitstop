"use client";

import { useState } from "react";

const number = new Intl.NumberFormat("es-MX");

/** Keep the submitted value numeric while displaying readable grouped kilometres. */
export function KmInput({ initialValue }: { initialValue: number }) {
  const [text, setText] = useState(() => number.format(initialValue));
  const raw = text.replace(/[,\s]/g, "");

  return (
    <span className="flex h-12 items-center rounded border border-line focus-within:border-accent-ink focus-within:ring-2 focus-within:ring-accent/30">
      <input type="text" inputMode="numeric" pattern="[0-9](?:[0-9,\s]*[0-9])?" maxLength={18} required value={text}
        onChange={event => setText(event.target.value)}
        onFocus={() => setText(raw)}
        onBlur={() => { if (/^\d+$/.test(raw) && Number.isSafeInteger(Number(raw))) setText(number.format(Number(raw))); }}
        className="min-w-0 w-full bg-transparent pl-3 text-[18px] font-normal outline-none" />
      <input type="hidden" name="km" value={raw} />
      <span className="pr-3 pl-1 text-[13px] font-normal text-muted">km</span>
    </span>
  );
}
