import { z } from "zod";

const optionalMoney = z.coerce.number().min(0, "El costo no puede ser negativo.").optional();

export const serviceSchema = z.object({
  date: z.iso.date({ error: "Fecha inválida." }),
  km: z.coerce.number({ error: "Escribe el kilometraje." }).int("Usa un número entero.").min(0),
  workshop: z.string().trim().max(120).optional(),
  totalCostMxn: optionalMoney,
  notes: z.string().trim().max(2000).optional(),
  items: z
    .array(z.object({ maintenanceItemId: z.uuid(), costMxn: optionalMoney }))
    .min(1, "Selecciona al menos un mantenimiento."),
  confirmJump: z.coerce.boolean().default(false),
});

export type ServiceInput = z.infer<typeof serviceSchema>;
