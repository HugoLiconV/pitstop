"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { remove, rename } from "@/app/(app)/asistente/actions";
import { Chip } from "@/components/ui";
import { isModelId, MODEL_LABELS } from "@/lib/assistant/models";
import type { ChatSummary } from "@/lib/data/chats";
import { ConfirmSheet } from "./confirm-sheet";

const relative = new Intl.RelativeTimeFormat("es-MX", { numeric: "auto" });

function ago(iso: string): string {
  const minutes = Math.round((Date.parse(iso) - Date.now()) / 60_000);
  if (minutes > -60) return relative.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (hours > -24) return relative.format(hours, "hour");
  const days = Math.round(hours / 24);
  if (days > -30) return relative.format(days, "day");
  return relative.format(Math.round(days / 30), "month");
}

function Row({ chat, onDelete }: { chat: ChatSummary; onDelete: () => void }) {
  const [menu, setMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(chat.title);
  const [, start] = useTransition();

  const save = () => {
    setEditing(false);
    const next = title.trim();
    if (!next || next === chat.title) return setTitle(chat.title);
    start(() => rename(chat.id, next));
  };

  return <li className="relative flex items-center gap-2 rounded-[22px] bg-card py-1.5 pr-1.5 pl-4 shadow-[0_8px_22px_-18px_rgb(60_50_40/0.45)]">
    {editing ? (
      <input autoFocus aria-label="Nuevo nombre" value={title} maxLength={80} onChange={(e) => setTitle(e.target.value)} onBlur={save}
        onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") { setTitle(chat.title); setEditing(false); } }}
        className="field my-1 min-w-0 flex-1 py-2 text-[15px]" />
    ) : (
      <Link href={`/asistente/${chat.id}`} className="flex min-h-14 min-w-0 flex-1 flex-col justify-center gap-1 focus-visible:outline-2 focus-visible:outline-accent rounded-xl">
        <span className="truncate text-[15px] text-ink">{title}</span>
        <span className="flex items-center gap-2 text-[11px] text-muted">
          {isModelId(chat.model) && <Chip className="px-2 py-0.5 text-[10px]">{MODEL_LABELS[chat.model]}</Chip>}
          {ago(chat.updated_at)}
        </span>
      </Link>
    )}
    <button type="button" aria-label={`Opciones de ${title}`} aria-expanded={menu} onClick={() => setMenu((m) => !m)}
      className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-muted hover:bg-bg hover:text-ink focus-visible:outline-2 focus-visible:outline-accent">
      <svg aria-hidden viewBox="0 0 24 24" className="size-5 fill-current"><circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="19" cy="12" r="1.6" /></svg>
    </button>
    {menu && <>
      <button type="button" aria-hidden tabIndex={-1} className="fixed inset-0 z-10 cursor-default" onClick={() => setMenu(false)} />
      <div role="menu" className="absolute top-[calc(100%-6px)] right-2 z-20 flex w-44 flex-col overflow-hidden rounded-2xl bg-card p-1 shadow-[0_16px_40px_-16px_rgb(50_40_30/0.55)]">
        <button role="menuitem" type="button" onClick={() => { setMenu(false); setEditing(true); }} className="flex h-11 items-center rounded-xl px-3 text-left text-[14px] text-ink hover:bg-bg">Renombrar</button>
        <button role="menuitem" type="button" onClick={() => { setMenu(false); onDelete(); }} className="flex h-11 items-center rounded-xl px-3 text-left text-[14px] text-overdue hover:bg-bg">Eliminar</button>
      </div>
    </>}
  </li>;
}

export function ChatList({ chats }: { chats: ChatSummary[] }) {
  const [deleting, setDeleting] = useState<ChatSummary | null>(null);
  const [pending, start] = useTransition();

  return <>
    <ul className="flex flex-col gap-2">
      {chats.map((chat) => <Row key={chat.id} chat={chat} onDelete={() => setDeleting(chat)} />)}
    </ul>
    <ConfirmSheet open={deleting !== null} title="¿Eliminar conversación?" pending={pending}
      body={deleting ? `“${deleting.title}” y sus mensajes se borrarán para siempre.` : ""}
      confirmLabel="Eliminar" onCancel={() => setDeleting(null)}
      onConfirm={() => start(async () => { if (deleting) await remove(deleting.id); setDeleting(null); })} />
  </>;
}
