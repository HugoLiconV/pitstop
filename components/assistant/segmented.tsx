"use client";

/** Pill radio group: one option active, the rest quiet. */
export function Segmented<T extends string | number>({ label, options, value, onChange, disabled, wide }: {
  label: string;
  options: ReadonlyArray<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  wide?: boolean;
}) {
  return <div role="radiogroup" aria-label={label} className={`inline-flex shrink-0 rounded-full bg-bg/80 p-1 shadow-[inset_0_1px_2px_rgb(50_40_30/0.08)] ${wide ? "w-full" : ""}`}>
    {options.map((option) => {
      const active = option.value === value;
      return <button key={option.value} type="button" role="radio" aria-checked={active} disabled={disabled} onClick={() => !active && onChange(option.value)}
        className={`h-9 min-w-16 rounded-full px-3 text-[12px] transition-colors focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-60 ${wide ? "flex-1" : ""} ${active ? "bg-card font-medium text-ink shadow-[0_2px_8px_-4px_rgb(50_40_30/0.35)]" : "text-muted hover:text-ink"}`}>
        {option.label}
      </button>;
    })}
  </div>;
}
