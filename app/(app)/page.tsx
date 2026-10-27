import { signOut } from "@/app/login/actions";

export default function Inicio() {
  return (
    <form action={signOut}>
      <h1 className="text-2xl font-semibold">Pitstop</h1>
      <button className="btn-quiet mt-4">Salir</button>
    </form>
  );
}
