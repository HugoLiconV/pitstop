import { Suspense } from "react";
import Loading from "../loading";
import { ChatList } from "@/components/assistant/chat-list";
import { PageHeader, Panel, PillAction } from "@/components/ui";
import { listChats } from "@/lib/data/chats";
import { newChat } from "./actions";

const SUGGESTIONS = ["¿Qué le toca a mi coche?", "¿Qué aceite lleva?", "Taller de frenos en Chihuahua"];

async function AsistenteContent() {
  const chats = await listChats();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Asistente" caption="Pregunta lo que sea de tu coche. Conoce tu historial y el manual del propietario." />

      <form action={async () => { "use server"; await newChat(); }}>
        <PillAction type="submit" className="w-full">Nueva conversación</PillAction>
      </form>

      {chats.length === 0 ? (
        <Panel className="flex flex-col gap-4">
          <p className="text-[15px] leading-relaxed">Aún no hay conversaciones. Puedes empezar con algo así:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((q) => (
              <form key={q} action={async () => { "use server"; await newChat(q); }}>
                <button type="submit" className="btn-quiet min-h-11 text-[13px]">{q}</button>
              </form>
            ))}
          </div>
        </Panel>
      ) : (
        <ChatList chats={chats} />
      )}
    </div>
  );
}

export default function Asistente() {
  return <Suspense fallback={<Loading />}><AsistenteContent /></Suspense>;
}
