import type { UIMessage } from "ai";
import Markdown from "react-markdown";
import { stripCitationMarkers } from "@/lib/assistant/chat";
import { isModelId, MODEL_LABELS } from "@/lib/assistant/models";
import { isReasoningEffort, isTokenLimit, REASONING_LABELS, tokenLabel } from "@/lib/assistant/settings";
import type { AnswerMetadata } from "@/lib/data/chats";
import { Sources } from "./sources";

const number = new Intl.NumberFormat("es-MX");

const textOf = (message: UIMessage) => message.parts.flatMap((p) => (p.type === "text" ? [p.text] : [])).join("");

// "Terra · Alto · 4k · 1,240 tokens": how this answer was produced, for comparing settings.
function details(meta: Partial<AnswerMetadata> | undefined): string | null {
  if (!meta) return null;
  const parts = [
    isModelId(meta.model) ? MODEL_LABELS[meta.model] : null,
    isReasoningEffort(meta.reasoningEffort) ? REASONING_LABELS[meta.reasoningEffort] : null,
    isTokenLimit(meta.maxOutputTokens) ? tokenLabel(meta.maxOutputTokens) : null,
    typeof meta.outputTokens === "number" ? `${number.format(meta.outputTokens)} tokens` : null,
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}

export function Message({ message }: { message: UIMessage }) {
  if (message.role === "user") {
    return <li className="flex justify-end">
      <p className="max-w-[85%] rounded-[22px] rounded-br-md bg-ink px-4 py-2.5 text-[15px] leading-relaxed whitespace-pre-wrap text-card">{textOf(message)}</p>
    </li>;
  }

  const text = stripCitationMarkers(textOf(message));
  const meta = message.metadata as Partial<AnswerMetadata> | undefined;
  const cutOff = meta?.finishReason === "length";
  if (!text && !cutOff) return null;

  return <li className="flex flex-col gap-3">
    {text && <div className="answer text-[15px] leading-relaxed text-ink">
      <Markdown components={{ a: ({ href, children }) => <a href={href} target="_blank" rel="noreferrer">{children}</a> }}>{text}</Markdown>
    </div>}
    {cutOff && <p className="rounded-2xl bg-bg/80 px-4 py-3 text-[13px] leading-relaxed text-muted">
      {text ? "La respuesta se cortó" : "No alcanzó a responder"}: llegó al máximo de tokens. Sube el límite en ajustes y vuelve a preguntar.
    </p>}
    <Sources parts={message.parts} />
    {details(meta) && <p className="text-[11px] text-muted/80">{details(meta)}</p>}
  </li>;
}
