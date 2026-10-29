"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { changeModel, rename } from "@/app/(app)/asistente/actions";
import { Alert, ArrowIcon } from "@/components/ui";
import { DEFAULT_TITLE, titleFrom } from "@/lib/assistant/chat";
import type { ModelId } from "@/lib/assistant/models";
import { Message } from "./message";
import { ModelSwitch } from "./model-switch";

type Chat = { id: string; title: string; model: ModelId };

// What the assistant is doing right now, read from the tool parts of the answer being streamed.
function activity(messages: UIMessage[]): string {
  const last = messages.at(-1);
  if (last?.role !== "assistant") return "Pensando…";
  const running = last.parts.findLast((p) => p.type.startsWith("tool-") && "state" in p && p.state !== "output-available");
  if (running?.type === "tool-file_search") return "Buscando en el manual…";
  if (running?.type === "tool-web_search") return "Buscando talleres…";
  return last.parts.some((p) => p.type === "text") ? "" : "Pensando…";
}

export function Conversation({ chat, initialMessages, initialQuestion }: { chat: Chat; initialMessages: UIMessage[]; initialQuestion?: string }) {
  const [model, setModel] = useState(chat.model);
  const [title, setTitle] = useState(chat.title);
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState("");
  const [, start] = useTransition();
  const sentInitial = useRef(false);
  const endRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, stop, error, regenerate } = useChat({
    id: chat.id,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest: ({ id, messages }) => ({ body: { id, message: messages.at(-1) } }),
    }),
  });
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (!initialQuestion || sentInitial.current) return;
    sentInitial.current = true;
    window.history.replaceState(null, "", `/asistente/${chat.id}`);
    sendMessage({ text: initialQuestion });
  }, [initialQuestion, chat.id, sendMessage]);

  // Wait a frame so the Markdown has laid out before scrolling to the end.
  useEffect(() => {
    const frame = requestAnimationFrame(() => endRef.current?.scrollIntoView({ block: "end" }));
    return () => cancelAnimationFrame(frame);
  }, [messages, status]);

  // The first answer names the chat on the server; show the same name here without a reload.
  const firstQuestion = messages.find((m) => m.role === "user")?.parts.flatMap((p) => (p.type === "text" ? [p.text] : [])).join(" ");
  const shownTitle = title === DEFAULT_TITLE && firstQuestion && !editing ? titleFrom(firstQuestion) : title;

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    sendMessage({ text });
    setInput("");
  };

  const saveTitle = () => {
    setEditing(false);
    const next = title.trim();
    if (!next) return setTitle(chat.title);
    start(() => rename(chat.id, next));
  };

  const pickModel = (next: ModelId) => {
    setModel(next);
    start(() => changeModel(chat.id, next));
  };

  const doing = busy ? activity(messages) : "";

  return <div className="flex flex-col gap-5 pb-28">
    <header className="sticky top-0 z-10 -mx-5 flex items-center gap-2 bg-bg/85 px-5 py-2 backdrop-blur-md">
      <Link href="/asistente" className="orb" aria-label="Volver a Asistente"><ArrowIcon direction="left" /></Link>
      {editing ? (
        <input autoFocus aria-label="Nombre de la conversación" value={title} maxLength={80} onChange={(e) => setTitle(e.target.value)} onBlur={saveTitle}
          onKeyDown={(e) => { if (e.key === "Enter") saveTitle(); if (e.key === "Escape") { setTitle(chat.title); setEditing(false); } }}
          className="field min-w-0 flex-1 py-2 text-[15px]" />
      ) : (
        <button type="button" onClick={() => { setTitle(shownTitle); setEditing(true); }} title="Renombrar" className="min-h-11 min-w-0 flex-1 truncate rounded-xl px-1 text-left text-[15px] font-medium text-ink focus-visible:outline-2 focus-visible:outline-accent">{shownTitle}</button>
      )}
      <ModelSwitch value={model} onChange={pickModel} disabled={busy} />
    </header>

    {messages.length === 0 && !busy && (
      <p className="pt-6 text-center text-[13px] leading-relaxed text-muted">Pregunta sobre mantenimiento, el manual,<br />una falla o un taller en Chihuahua.</p>
    )}

    <ol aria-live="polite" aria-busy={busy} className="flex flex-col gap-6">
      {messages.map((m) => <Message key={m.id} message={m} />)}
    </ol>

    {doing && <p className="flex items-center gap-2 text-[13px] text-muted"><span aria-hidden className="flex gap-1">{[0, 1, 2].map((i) => <span key={i} className="size-1.5 animate-pulse rounded-full bg-muted" style={{ animationDelay: `${i * 150}ms` }} />)}</span>{doing}</p>}

    {error && !busy && (
      <div className="flex items-center justify-between gap-3">
        <Alert>No pude responder. Intenta de nuevo.</Alert>
        <button type="button" onClick={() => regenerate()} className="btn-quiet min-h-11 shrink-0">Reintentar</button>
      </div>
    )}
    <div ref={endRef} />

    <form onSubmit={send} className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+76px)] z-20 px-5">
      <div className="glass mx-auto flex max-w-[400px] items-end gap-2 rounded-[26px] p-1.5 backdrop-blur-[14px] backdrop-saturate-[1.8]">
        <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={1} maxLength={4000} placeholder="Escribe tu pregunta…" aria-label="Tu pregunta"
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && window.matchMedia("(hover: hover)").matches) send(e); }}
          className="field-sizing-content max-h-36 min-h-11 min-w-0 flex-1 resize-none bg-transparent px-3 py-2.5 text-base leading-snug text-ink outline-none placeholder:text-muted" />
        {busy ? (
          <button type="button" onClick={() => stop()} aria-label="Detener" className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-ink text-card"><span aria-hidden className="size-3 rounded-[3px] bg-card" /></button>
        ) : (
          <button type="submit" aria-label="Enviar" disabled={!input.trim()} className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-ink text-card disabled:opacity-40"><ArrowIcon /></button>
        )}
      </div>
    </form>
  </div>;
}
