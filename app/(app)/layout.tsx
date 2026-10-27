import { BottomNav } from "@/components/bottom-nav";
import { Suspense } from "react";
import { requireUser } from "@/lib/supabase/server";

// Reading the session is runtime data; with cacheComponents it must sit inside Suspense.
async function AuthGate({ children }: { children: React.ReactNode }) {
  await requireUser();
  return children;
}

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
      <main className="flex-1 px-5 pt-8 pb-32">
        <Suspense fallback={<p className="text-muted">Cargando…</p>}>
          <AuthGate>{children}</AuthGate>
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <BottomNav />
      </Suspense>
    </div>
  );
}
