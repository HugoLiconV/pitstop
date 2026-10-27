"use client";

import { useActionState } from "react";
import { signIn } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, {});
  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm text-muted">
        Correo
        <input name="email" type="email" autoComplete="email" required className="field" />
      </label>
      <label className="flex flex-col gap-1 text-sm text-muted">
        Contraseña
        <input name="password" type="password" autoComplete="current-password" required className="field" />
      </label>
      {state.error && (
        <p role="alert" className="text-sm text-overdue">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn-primary mt-2">
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
