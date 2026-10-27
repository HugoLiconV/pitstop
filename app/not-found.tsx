import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-4 px-5 py-16">
      <h1 className="text-xl font-semibold">Esta página no existe</h1>
      <p className="text-muted">Quizá el servicio se borró o el enlace está incompleto.</p>
      <Link href="/" className="btn-primary self-start">
        Volver al inicio
      </Link>
    </main>
  );
}
