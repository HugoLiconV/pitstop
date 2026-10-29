// Each message resends the conversation, so only the most recent ones go to the model.
export const HISTORY_LIMIT = 30;

export const DEFAULT_TITLE = "Nueva conversación";

const TITLE_WORDS = 6;

export function trimHistory<T>(messages: T[]): T[] {
  return messages.slice(-HISTORY_LIMIT);
}

export function titleFrom(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return DEFAULT_TITLE;
  const title = words.slice(0, TITLE_WORDS).join(" ");
  return words.length > TITLE_WORDS ? `${title}…` : title;
}
