import type { ComponentProps } from "react";
import { cx } from "./cx";

/** Large-radius bone card. `as="section"` for landmarks. */
export function Panel({ as: Tag = "div", className, ...props }: ComponentProps<"div"> & { as?: "div" | "section" | "header" | "li" }) {
  return <Tag {...(props as object)} className={cx("panel px-5 py-5", className)} />;
}
