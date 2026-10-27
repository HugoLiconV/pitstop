import { Panel, Wordmark } from "@/components/ui";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-5 py-12">
      <Wordmark />
      <Panel className="mt-6 !p-6">
        <h1 className="text-[30px] font-light leading-none tracking-[-0.045em]">Hola de nuevo</h1>
        <p className="mt-2 mb-6 text-[13px] text-muted">La bitácora de tu Mazda 6. Solo tú tienes acceso.</p>
        <LoginForm />
      </Panel>
    </main>
  );
}
