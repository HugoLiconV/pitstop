"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { MODELS } from "@/lib/assistant/models";
import { isReasoningEffort, TOKEN_LIMITS, type ReasoningEffort } from "@/lib/assistant/settings";
import { createChat, deleteChat, renameChat, setChatModel, setChatSettings } from "@/lib/data/chats";

const id = z.uuid();

export async function newChat(question?: string): Promise<void> {
  const chatId = await createChat();
  const q = z.string().trim().max(500).safeParse(question);
  redirect(q.success && q.data ? `/asistente/${chatId}?q=${encodeURIComponent(q.data)}` : `/asistente/${chatId}`);
}

export async function rename(chatId: string, title: string): Promise<void> {
  const parsed = z.object({ chatId: id, title: z.string().trim().min(1).max(80) }).safeParse({ chatId, title });
  if (!parsed.success) return;
  await renameChat(parsed.data.chatId, parsed.data.title);
  revalidatePath("/asistente");
}

export async function remove(chatId: string): Promise<void> {
  if (!id.safeParse(chatId).success) return;
  await deleteChat(chatId);
  revalidatePath("/asistente");
}

export async function changeModel(chatId: string, model: string): Promise<void> {
  const parsed = z.object({ chatId: id, model: z.enum(MODELS) }).safeParse({ chatId, model });
  if (!parsed.success) return;
  await setChatModel(parsed.data.chatId, parsed.data.model);
  revalidatePath("/asistente");
}

const settingsSchema = z.object({
  reasoning_effort: z.custom<ReasoningEffort>(isReasoningEffort).optional(),
  max_output_tokens: z.literal(TOKEN_LIMITS).optional(),
});

export async function changeSettings(chatId: string, settings: z.input<typeof settingsSchema>): Promise<void> {
  const parsed = settingsSchema.safeParse(settings);
  if (!id.safeParse(chatId).success || !parsed.success) return;
  await setChatSettings(chatId, parsed.data);
}
