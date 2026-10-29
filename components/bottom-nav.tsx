"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Inicio", icon: "m3 10 9-7 9 7M5 9v12h5v-7h4v7h5V9", match: (path: string) => path === "/" || path.startsWith("/servicios") },
  { href: "/historial", label: "Historial", icon: "M12 3a9 9 0 1 0 9 9 9 9 0 0 0-9-9Zm0 4v5l3 2", match: (path: string) => path.startsWith("/historial") },
  { href: "/plan", label: "Plan", icon: "M6 3h9l4 4v14H6zM14 3v5h5M9 12h7M9 16h7", match: (path: string) => path.startsWith("/plan") },
  { href: "/asistente", label: "Asistente", icon: "M4 5h16v11H9l-5 4zM8 9.5h8M8 12.5h5", match: (path: string) => path.startsWith("/asistente") },
];

export function BottomNav() {
  const pathname = usePathname();
  return <nav aria-label="Principal" className="pointer-events-none fixed inset-x-0 bottom-0 z-20 px-5 pb-[calc(env(safe-area-inset-bottom)+14px)]">
    <ul className="mx-auto grid max-w-[400px] grid-cols-4 gap-1 glass backdrop-blur-[14px] backdrop-saturate-[1.8] backdrop-brightness-105 pointer-events-auto rounded-full p-1.5">
      {tabs.map(tab => { const active = tab.match(pathname); return <li key={tab.href}><Link href={tab.href} aria-current={active ? "page" : undefined} className={`flex min-h-11 items-center justify-center gap-2 rounded-full text-[12px] transition-colors focus-visible:outline-2 focus-visible:outline-accent ${active ? "bg-white/55 font-medium text-ink shadow-[inset_0_1px_0_rgb(255_255_255/0.9),0_2px_8px_-3px_rgb(50_40_30/0.25)]" : "text-muted hover:text-ink"}`}><svg aria-hidden viewBox="0 0 24 24" className="size-4 fill-none stroke-current stroke-[1.5]"><path d={tab.icon} /></svg>{tab.label}</Link></li>; })}
    </ul>
  </nav>;
}
