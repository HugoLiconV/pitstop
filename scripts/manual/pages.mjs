// The manual prints its page number ("6-14") on the last line, alone or set apart from a footnote by a wide gap.
const LABEL = /^(\d{1,2}-\d{1,3})(?:\s{2,}|$)|\s{2,}(\d{1,2}-\d{1,3})$/;

export function pageLabel(text) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const match = lines.at(-1)?.match(LABEL);
  return match ? (match[1] ?? match[2]) : null;
}

// One heading per page so file search chunks carry their page; unlabeled pages fall back to the PDF number.
export function toMarkdown(pages) {
  return pages
    .map((text, i) => {
      const label = pageLabel(text);
      const heading = label ? `## Página ${label}` : `## Página PDF ${i + 1}`;
      return `${heading}\n\n${text.trim()}`;
    })
    .join("\n\n");
}
