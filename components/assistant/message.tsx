import type { UIMessage } from "ai";
import Markdown from "react-markdown";
import { stripCitationMarkers } from "@/lib/assistant/chat";
import { Sources } from "./sources";

const textOf = (message: UIMessage) => message.parts.flatMap((p) => (p.type === "text" ? [p.text] : [])).join("");

export function Message({ message }: { message: UIMessage }) {
  const text = message.role === "assistant" ? stripCitationMarkers(textOf(message)) : textOf(message);
  if (message.role === "user") {
    return <li className="flex justify-end">
      <p className="max-w-[85%] rounded-[22px] rounded-br-md bg-ink px-4 py-2.5 text-[15px] leading-relaxed whitespace-pre-wrap text-card">{text}</p>
    </li>;
  }
  if (!text) return null;
  return <li className="flex flex-col gap-3">
    <div className="answer text-[15px] leading-relaxed text-ink">
      <Markdown components={{ a: ({ href, children }) => <a href={href} target="_blank" rel="noreferrer">{children}</a> }}>{text}</Markdown>
    </div>
    <Sources parts={message.parts} />
  </li>;
}
