import type { UIMessage } from "ai";
import { DEFAULT_TITLE, titleFrom } from "@/lib/assistant/chat";
import { DEFAULT_MODEL, type ModelId } from "@/lib/assistant/models";
import type { ReasoningEffort, TokenLimit } from "@/lib/assistant/settings";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";

export type ChatSummary = { id: string; title: string; model: string; reasoning_effort: string; max_output_tokens: number; updated_at: string };

// How an answer was produced, carried as the assistant message's metadata.
export type AnswerMetadata = { model: ModelId; reasoningEffort: ReasoningEffort; maxOutputTokens: TokenLimit; finishReason?: string; outputTokens?: number };

const CHAT_FIELDS = "id, title, model, reasoning_effort, max_output_tokens, updated_at";

export async function listChats(): Promise<ChatSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("chats").select(CHAT_FIELDS).order("updated_at", { ascending: false });
  if (error) throw error;
  return data;
}

// RLS hides other users' chats, so "not mine" and "missing" both come back as null.
export async function getChat(id: string): Promise<ChatSummary | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("chats").select(CHAT_FIELDS).eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function loadMessages(chatId: string): Promise<UIMessage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("chat_messages")
    .select("id, role, parts, metadata")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data.map((m) => ({ id: m.id, role: m.role, parts: m.parts, metadata: m.metadata ?? undefined }) as UIMessage);
}

// Saves the question and its answer together, so a failed answer leaves no orphan question behind.
export async function saveExchange(chatId: string, messages: UIMessage[]): Promise<void> {
  const supabase = await createClient();
  const now = Date.now();
  const rows = messages.map((m, i) => ({
    id: m.id,
    chat_id: chatId,
    role: m.role,
    parts: m.parts as unknown as NonNullable<Json>,
    metadata: (m.metadata ?? null) as Json,
    created_at: new Date(now + i).toISOString(),
  }));
  const { error } = await supabase.from("chat_messages").upsert(rows, { onConflict: "id" });
  if (error) throw error;

  const chat = await getChat(chatId);
  const question = messages.find((m) => m.role === "user");
  const text = question?.parts.flatMap((p) => (p.type === "text" ? [p.text] : [])).join(" ") ?? "";
  const update: { updated_at: string; title?: string } = { updated_at: new Date(now).toISOString() };
  if (chat?.title === DEFAULT_TITLE && text) update.title = titleFrom(text);
  const { error: chatError } = await supabase.from("chats").update(update).eq("id", chatId);
  if (chatError) throw chatError;
}

export async function createChat(model: ModelId = DEFAULT_MODEL): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("chats").insert({ model }).select("id").single();
  if (error) throw error;
  return data.id;
}

export async function renameChat(id: string, title: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("chats").update({ title }).eq("id", id);
  if (error) throw error;
}

export async function deleteChat(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("chats").delete().eq("id", id);
  if (error) throw error;
}

export async function setChatModel(id: string, model: ModelId): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("chats").update({ model }).eq("id", id);
  if (error) throw error;
}

export async function setChatSettings(id: string, settings: { reasoning_effort?: ReasoningEffort; max_output_tokens?: TokenLimit }): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("chats").update(settings).eq("id", id);
  if (error) throw error;
}
