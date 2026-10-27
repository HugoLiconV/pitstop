import { Suspense } from "react";
import Loading from "../../loading";
import { getDueSummary } from "@/lib/data/due";
import { todayInMexico } from "@/lib/due";
import { requireUser } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui";
import { ServiceForm } from "./service-form";

async function NuevoServicioContent() {
  const [user, { currentKm, due, items }] = await Promise.all([requireUser(), getDueSummary()]);
  const statusById = new Map(due.map((d) => [d.item.id, d.status]));
  // Vencido and Próximo first (already sorted by computeDue), then the rest of the active items.
  const options = due.map((d) => ({ id: d.item.id, name: d.item.name, status: statusById.get(d.item.id)! }));
  const inactive = items.filter((i) => !i.active).length;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Registrar servicio" back={{ href: "/", label: "Inicio" }} caption="Con esto se recalcula cuándo toca lo siguiente." />
      <ServiceForm userId={user.id} today={todayInMexico()} currentKm={currentKm} options={options} />
      {inactive > 0 && <p className="px-1 text-[12px] text-muted">{inactive} mantenimientos desactivados no aparecen aquí.</p>}
    </div>
  );
}

export default function NuevoServicio() {
  return <Suspense fallback={<Loading />}><NuevoServicioContent /></Suspense>;
}
