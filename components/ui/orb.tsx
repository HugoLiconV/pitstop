import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cx } from "./cx";
import { ArrowIcon } from "./arrow-icon";

/** Round icon button; a link when given `href`. */
export function Orb({ href, label, children, className, ...props }: { href?: string; label: string; children?: ReactNode } & ComponentProps<"button">) {
  const classes = cx("orb !bg-bg transition-colors hover:!bg-line focus-visible:outline-2 focus-visible:outline-accent", className);
  const content = children ?? <ArrowIcon />;
  if (href) return <Link href={href} aria-label={label} className={classes}>{content}</Link>;
  return <button type="button" aria-label={label} {...props} className={classes}>{content}</button>;
}
