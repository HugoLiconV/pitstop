import type { ReactNode } from "react";
import { cx } from "./cx";
import { Label } from "./label";

/** Form field: mono label over the control, with an optional error line. */
export function Field({ label, error, children, className }: { label: ReactNode; error?: ReactNode; children: ReactNode; className?: string }) {
  return <label className={cx("flex flex-col gap-2", className)}>
    <Label as="span">{label}</Label>
    {children}
    {error && <span role="alert" className="text-[12px] text-overdue">{error}</span>}
  </label>;
}
