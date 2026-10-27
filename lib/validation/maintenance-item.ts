import { z } from "zod";

const interval = z.coerce.number().int("Usa un número entero.").positive("Debe ser mayor a cero.").nullable();

export const maintenanceItemSchema = z
  .object({
    name: z.string().trim().min(1, "Escribe un nombre.").max(120),
    intervalKm: interval,
    intervalMonths: interval,
    notes: z.string().trim().max(2000).optional(),
    active: z.coerce.boolean().default(true),
  })
  .refine((v) => v.intervalKm !== null || v.intervalMonths !== null, {
    message: "Indica cada cuántos km o meses.",
    path: ["intervalKm"],
  });

export type MaintenanceItemInput = z.infer<typeof maintenanceItemSchema>;
