import Link from "next/link";
import { Suspense } from "react";
import { requireUser } from "@/lib/supabase/server";

const nav = [
  { href: "/", label: "Inicio" },
  { href: "/historial", label: "Historial" },
  { href: "/plan", label: "Plan" },
];

// Reading the session is runtime data; with cacheComponents it must sit inside Suspense.
async function AuthGate({ children }: { children: React.ReactNode }) {
  await requireUser();
  return children;
}

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
      <main className="flex-1 px-5 pt-8 pb-28">
        <Suspense fallback={<p className="text-muted">Cargando…</p>}>
          <AuthGate>{children}</AuthGate>
        </Suspense>
      </main>
      <nav className="fixed inset-x-0 bottom-0 border-t border-line bg-bg/95 backdrop-blur">
        <ul className="mx-auto flex max-w-md justify-around py-3 text-sm">
          {nav.map((n) => (
            <li key={n.href}>
              <Link href={n.href} className="px-3 py-2 text-muted hover:text-ink">
                {n.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
