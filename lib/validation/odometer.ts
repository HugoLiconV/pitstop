import { z } from "zod";
import { dateText, kmText } from "./format";

export const MAX_JUMP_KM = 5000;

export const odometerSchema = z.object({
  date: z.iso.date({ error: "Fecha inválida." }),
  km: z.coerce.number({ error: "Escribe el kilometraje." }).int("Usa un número entero.").min(0, "El kilometraje no puede ser negativo."),
  confirmJump: z.coerce.boolean().default(false),
});

type Reading = { date: string; km: number };

export type OdometerCheck =
  | { ok: true }
  | { ok: false; field: "km"; message: string; needsConfirm?: true };

export function checkOdometer(
  input: { date: string; km: number; confirmJump: boolean },
  neighbors: { before: Reading | null; after: Reading | null },
): OdometerCheck {
  const { before, after } = neighbors;
  if (before && input.km < before.km) {
    return {
      ok: false,
      field: "km",
      message: `El kilometraje no puede ser menor a ${kmText(before.km)} (lectura del ${dateText(before.date)}).`,
    };
  }
  if (after && input.km > after.km) {
    return {
      ok: false,
      field: "km",
      message: `El kilometraje no puede ser mayor a ${kmText(after.km)} (lectura del ${dateText(after.date)}).`,
    };
  }
  if (before && input.km - before.km > MAX_JUMP_KM && !input.confirmJump) {
    return {
      ok: false,
      field: "km",
      needsConfirm: true,
      message: `Son ${kmText(input.km - before.km)} más que la última lectura. ¿Es correcto?`,
    };
  }
  return { ok: true };
}
