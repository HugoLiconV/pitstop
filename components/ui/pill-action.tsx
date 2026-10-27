import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cx } from "./cx";
import { ArrowIcon } from "./arrow-icon";

/** The black pill action, with the inset round arrow. A link when given `href`. */
export function PillAction({ href, children, className, arrow = true, ...props }: { href?: string; arrow?: boolean; children: ReactNode } & ComponentProps<"button">) {
  const classes = cx("btn-primary", arrow && "justify-between !pr-2", className);
  const content = <>{children}{arrow && <span aria-hidden className="inline-flex size-9 items-center justify-center rounded-full bg-card text-ink"><ArrowIcon /></span>}</>;
  if (href) return <Link href={href} className={classes}>{content}</Link>;
  return <button {...props} className={classes}>{content}</button>;
}
