import type { UIMessage } from "ai";

const MAX_WEB = 4;

function host(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** Where an answer came from: the manual (pages are cited in the text) and up to four websites. */
export function Sources({ parts }: { parts: UIMessage["parts"] }) {
  const usedManual = parts.some((p) => p.type === "source-document");
  const web = new Map<string, string>();
  for (const p of parts) if (p.type === "source-url" && !web.has(host(p.url))) web.set(host(p.url), p.url);
  if (!usedManual && web.size === 0) return null;

  return <ul aria-label="Fuentes" className="flex flex-wrap gap-1.5">
    {usedManual && <li className="chip gap-1.5"><svg aria-hidden viewBox="0 0 24 24" className="size-3 fill-none stroke-current stroke-[1.6]"><path d="M5 4h10l4 4v12H5zM14 4v5h5" /></svg>Manual del propietario</li>}
    {[...web].slice(0, MAX_WEB).map(([name, url]) => (
      <li key={name}><a href={url} target="_blank" rel="noreferrer" className="chip gap-1 hover:text-ink focus-visible:outline-2 focus-visible:outline-accent">{name}<span aria-hidden>↗</span></a></li>
    ))}
  </ul>;
}
