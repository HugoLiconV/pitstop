import { cx } from "./cx";

export function ArrowIcon({ direction = "up-right", className = "size-4" }: { direction?: "up-right" | "left"; className?: string }) {
  return <svg aria-hidden viewBox="0 0 24 24" className={cx("fill-none stroke-current stroke-[1.5]", className)}><path d={direction === "left" ? "M19 12H5m6-6-6 6 6 6" : "M7 17 17 7M8 7h9v9"} /></svg>;
}
