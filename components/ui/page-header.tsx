import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowIcon } from "./arrow-icon";

/** Light, large page title with an optional back link, caption and trailing action. */
export function PageHeader({ title, caption, back, action, children }: { title: ReactNode; caption?: ReactNode; back?: { href: string; label: string }; action?: ReactNode; children?: ReactNode }) {
  return <header className="flex flex-col gap-3">
    {back && <Link href={back.href} className="orb -ml-0.5 mb-2" aria-label={`Volver a ${back.label}`}><ArrowIcon direction="left" /></Link>}
    <div className="flex items-start justify-between gap-4">
      <h1 className="text-[34px] font-light leading-[1.05] tracking-[-0.045em]">{title}</h1>
      {action}
    </div>
    {caption && <p className="max-w-72 text-[12px] leading-relaxed text-muted">{caption}</p>}
    {children}
  </header>;
}
