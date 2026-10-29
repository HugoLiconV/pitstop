import { notFound } from "next/navigation";
import { Suspense } from "react";
import Loading from "../../loading";
import { Conversation } from "@/components/assistant/conversation";
import { DEFAULT_MODEL, isModelId } from "@/lib/assistant/models";
import { getChat, loadMessages } from "@/lib/data/chats";

async function ConversationContent({ params, searchParams }: PageProps<"/asistente/[id]">) {
  const [{ id }, { q }] = await Promise.all([params, searchParams]);
  const chat = /^[0-9a-f-]{36}$/i.test(id) ? await getChat(id) : null;
  if (!chat) notFound();
  const messages = await loadMessages(chat.id);
  return <Conversation
    chat={{ id: chat.id, title: chat.title, model: isModelId(chat.model) ? chat.model : DEFAULT_MODEL }}
    initialMessages={messages}
    initialQuestion={messages.length === 0 && typeof q === "string" ? q : undefined}
  />;
}

export default function ConversationPage(props: PageProps<"/asistente/[id]">) {
  return <Suspense fallback={<Loading />}><ConversationContent {...props} /></Suspense>;
}
