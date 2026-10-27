import type { ReactNode } from "react";
import { cx } from "./cx";
import { Label } from "./label";

/** A figure with its caption, figure first in weight. */
export function Stat({ label, value, tone, className }: { label: ReactNode; value: ReactNode; tone?: "accent"; className?: string }) {
  return <div className={cx("flex flex-col gap-2", className)}>
    <Label as="dt">{label}</Label>
    <dd className={cx("figures text-[26px] font-light leading-none tracking-[-0.03em]", tone === "accent" && "text-accent-ink")}>{value}</dd>
  </div>;
}
