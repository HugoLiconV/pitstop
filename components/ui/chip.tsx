import type { ComponentProps } from "react";
import { cx } from "./cx";

export function Chip({ className, ...props }: ComponentProps<"span">) {
  return <span {...props} className={cx("chip", className)} />;
}
