"use client";

import { useActionState } from "react";
import { Alert, Field, PillAction } from "@/components/ui";
import { signIn } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, {});
  return (
    <form action={action} className="flex flex-col gap-4">
      <Field label="Correo">
        <input name="email" type="email" autoComplete="email" required className="field" />
      </Field>
      <Field label="Contraseña">
        <input name="password" type="password" autoComplete="current-password" required className="field" />
      </Field>
      {state.error && <Alert>{state.error}</Alert>}
      <PillAction type="submit" disabled={pending} className="mt-2">
        {pending ? "Entrando…" : "Entrar"}
      </PillAction>
    </form>
  );
}
