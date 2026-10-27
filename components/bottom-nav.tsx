"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const icons = {
  gauge: (
    <path d="M4.5 16.5a8 8 0 1 1 15 0M12 12l4-3.5M12 12a1.25 1.25 0 1 0 0 .01" />
  ),
  history: (
    <path d="M4 12a8 8 0 1 0 2.35-5.65M4 4v4h4M12 8v4l3 2" />
  ),
  wrench: (
    <path d="M14.7 6.3a4 4 0 0 0-5.4 5.1L4 16.7 7.3 20l5.3-5.3a4 4 0 0 0 5.1-5.4l-2.4 2.4-2.6-.6-.6-2.6 2.4-2.4Z" />
  ),
};

const tabs = [
  { href: "/", label: "Inicio", icon: icons.gauge, match: (p: string) => p === "/" || p.startsWith("/servicios") },
  { href: "/historial", label: "Historial", icon: icons.history, match: (p: string) => p.startsWith("/historial") },
  { href: "/plan", label: "Plan", icon: icons.wrench, match: (p: string) => p.startsWith("/plan") },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Principal"
      className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-bg/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md"
    >
      <ul className="mx-auto grid max-w-md grid-cols-3">
        {tabs.map((t) => {
          const active = t.match(pathname);
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={`relative flex flex-col items-center gap-1 pt-3 pb-2.5 text-xs transition-colors ${
                  active ? "font-semibold text-ink" : "text-muted hover:text-ink"
                }`}
              >
                <span
                  aria-hidden
                  className={`absolute top-0 h-[3px] w-10 rounded-b-full bg-accent transition-transform duration-200 motion-reduce:transition-none ${
                    active ? "scale-x-100" : "scale-x-0"
                  }`}
                />
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  className={`size-6 fill-none stroke-current stroke-[1.75] ${active ? "text-accent" : ""}`}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {t.icon}
                </svg>
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
