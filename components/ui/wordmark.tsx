import Image from "next/image";
import { cx } from "./cx";

/** The app's mark — a brush trace of the Mazda 6's face — then the name in light Geist. */
export function Wordmark({ className }: { className?: string }) {
  return <span className={cx("inline-flex items-center gap-2.5", className)}>
    <Image src="/brand/mark.svg" alt="" width={30} height={30} unoptimized className="rounded-[8px] shadow-[0_0_0_1px_var(--line)]" />
    <span className="text-[19px] font-light tracking-[-0.045em]">pitstop</span>
  </span>;
}
