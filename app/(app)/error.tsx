"use client";

import { Panel, PillAction } from "@/components/ui";

export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Panel className="mt-4 flex flex-col gap-3 !p-6">
      <h1 className="text-[30px] font-light leading-[1.05] tracking-[-0.045em]">No pudimos cargar tus datos</h1>
      <p className="mb-3 text-[13px] leading-relaxed text-muted">
        Algo no salió bien al cargar tus datos. Si la base de datos estaba en pausa, reintenta en unos segundos.
      </p>
      <PillAction onClick={reset}>Reintentar</PillAction>
    </Panel>
  );
}
