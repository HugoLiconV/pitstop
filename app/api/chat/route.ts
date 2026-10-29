import { openai } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  createIdGenerator,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  validateUIMessages,
  type UIMessage,
} from "ai";
import { z } from "zod";
import { trimHistory } from "@/lib/assistant/chat";
import { isModelId } from "@/lib/assistant/models";
import { SYSTEM_PROMPT } from "@/lib/assistant/prompt";
import { getCarContext } from "@/lib/data/assistant";
import { getChat, loadMessages, saveExchange } from "@/lib/data/chats";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60;

const bodySchema = z.object({
  id: z.uuid(),
  message: z.object({
    id: z.string().min(1),
    role: z.literal("user"),
    parts: z.array(z.looseObject({ type: z.string() })),
  }),
});

const hasText = (message: z.infer<typeof bodySchema>["message"]) =>
  message.parts.some((p) => p.type === "text" && typeof p.text === "string" && p.text.trim() !== "");

const tools = {
  file_search: openai.tools.fileSearch({ vectorStoreIds: [process.env.OPENAI_VECTOR_STORE_ID!], maxNumResults: 5 }),
  web_search: openai.tools.webSearch({
    searchContextSize: "low",
    userLocation: { type: "approximate", country: "MX", region: "Chihuahua", city: "Chihuahua", timezone: "America/Chihuahua" },
  }),
};

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return new Response("No autorizado", { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return new Response("Solicitud inválida", { status: 400 });
  const { id, message } = parsed.data;

  const chat = await getChat(id);
  if (!chat) return new Response("Conversación no encontrada", { status: 404 });
  if (!hasText(message)) return new Response("Mensaje vacío", { status: 400 });
  const model = chat.model;
  if (!isModelId(model)) return new Response("Modelo no permitido", { status: 400 });

  const [previous, carContext] = await Promise.all([loadMessages(id), getCarContext()]);
  const messages = await validateUIMessages({ messages: [...previous, message as UIMessage], tools });

  const result = streamText({
    model: openai(model),
    system: `${SYSTEM_PROMPT}\n\n${carContext}`,
    messages: await convertToModelMessages(trimHistory(messages)),
    tools,
    maxOutputTokens: 1500,
  });
  // Finish (and save) the answer even if the phone closes the connection.
  result.consumeStream();

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      originalMessages: messages,
      generateMessageId: createIdGenerator({ prefix: "msg", size: 16 }),
      sendSources: true,
      onError: () => "No pude responder. Intenta de nuevo.",
      onEnd: async ({ isAborted, outcome, responseMessage }) => {
        if (isAborted || outcome.status === "failed") return;
        await saveExchange(id, [message as UIMessage, responseMessage], model);
      },
    }),
  });
}
