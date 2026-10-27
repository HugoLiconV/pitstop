"use client";

export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col gap-4 py-10">
      <h1 className="text-xl font-semibold">No pudimos cargar tus datos</h1>
      <p className="text-muted">
        Algo no salió bien al cargar tus datos. Si la base de datos estaba en pausa, reintenta en unos segundos.
      </p>
      <button onClick={reset} className="btn-primary self-start">
        Reintentar
      </button>
    </div>
  );
}
