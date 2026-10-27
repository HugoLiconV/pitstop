import { Panel, PillAction } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-col px-5 py-16">
      <Panel className="flex flex-col gap-3 !p-6">
        <h1 className="text-[30px] font-light leading-[1.05] tracking-[-0.045em]">Esta página no existe</h1>
        <p className="mb-3 text-[13px] leading-relaxed text-muted">Quizá el servicio se borró o el enlace está incompleto.</p>
        <PillAction href="/">Volver al inicio</PillAction>
      </Panel>
    </main>
  );
}
