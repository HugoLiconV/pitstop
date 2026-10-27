import type { ReactNode } from "react";
import { cx } from "./cx";

/** Card heading row: light title, trailing round action. */
export function PanelHeader({ title, id, action, className }: { title: ReactNode; id?: string; action?: ReactNode; className?: string }) {
  return <div className={cx("flex items-center justify-between gap-4 pb-4", className)}>
    <h2 id={id} className="text-[22px] font-light tracking-[-0.035em]">{title}</h2>
    {action}
  </div>;
}
