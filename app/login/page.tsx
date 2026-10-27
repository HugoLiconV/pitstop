import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-5 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Pitstop</h1>
      <p className="mt-1 mb-8 text-muted">Solo tú tienes acceso.</p>
      <LoginForm />
    </main>
  );
}
