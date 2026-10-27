import type { ComponentProps } from "react";
import { cx } from "./cx";

/** Small uppercase mono caption. */
export function Label({ as: Tag = "p", className, ...props }: ComponentProps<"p"> & { as?: "p" | "span" | "h2" | "h3" | "dt" | "legend" }) {
  return <Tag {...(props as object)} className={cx("label", className)} />;
}
