import type { ReactNode } from "react";

export function Alert({ children }: { children: ReactNode }) {
  return <p role="alert" className="flex items-start gap-2 text-[13px] text-overdue"><span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-overdue" />{children}</p>;
}
