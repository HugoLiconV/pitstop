# Asistente Chat Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** An in-app AI chat that answers questions about the Mazda using its service history, the owner's manual and web search for shops in Chihuahua.

**Architecture:** A Next.js route handler streams answers from the OpenAI Responses API through the Vercel AI SDK, with hosted `fileSearch` (manual in a vector store) and `webSearch` tools. Car context is rebuilt per request from the existing data loaders. Chats and messages are stored in two new Supabase tables in the AI SDK `UIMessage` format.

**Tech Stack:** Next.js 16.4 (app router), React 19, Supabase (`@supabase/ssr`), `ai`, `@ai-sdk/openai`, `@ai-sdk/react`, zod 4, vitest, Tailwind 4, poppler `pdftotext`.

**Spec:** `docs/superpowers/specs/2026-10-28-asistente-chat-design.md`

## Global Constraints

- Allowed models, exactly: `gpt-6-luna`, `gpt-6.1-terra`. Default `gpt-6-luna`.
- History sent to the model: last 30 messages.
- `maxOutputTokens: 1500`. `fileSearch` `maxNumResults: 5`. `webSearch` `searchContextSize: 'low'`, `userLocation` `{ type: 'approximate', country: 'MX', region: 'Chihuahua', city: 'Chihuahua', timezone: 'America/Chihuahua' }`.
- Env: `OPENAI_API_KEY`, `OPENAI_VECTOR_STORE_ID`, server only, never `NEXT_PUBLIC_`.
- All UI copy and model answers in Spanish. Default title `Nueva conversación`.
- UI from `components/ui`; no browser `alert`/`confirm`/`prompt`.
- Before writing route or page code, read the matching guide in `node_modules/next/dist/docs/` (AGENTS.md).
- Production database changes are shown to Hugo and run only after his explicit "go".
- Chat never writes services, odometer readings or maintenance items.

## Review Focus

- A failed or aborted answer: neither the user message nor a partial reply is persisted, so the retry does not duplicate the question. Test in Task 5.
- A chat id that does not exist or belongs to someone else returns 404, never another user's history. Test in Task 5.
- An empty or whitespace-only message is rejected before calling OpenAI (400). Test in Task 5.
- A model value outside the allowlist in the database or request falls back to rejection, not to an arbitrary model string. Test in Task 1.
- Manual pages without a detectable label still appear in `manual.md` under the PDF page number, so no text is lost. Test in Task 2.

---

### Task 1: Dependencies, env and model allowlist; confirm models exist

**Files:**
- Modify: `package.json`, `.env.example`
- Create: `lib/assistant/models.ts`, `lib/assistant/models.test.ts`, `scripts/check-models.mjs`

**Interfaces:**
- Produces: `MODELS: readonly ['gpt-6-luna', 'gpt-6.1-terra']`, `type ModelId`, `DEFAULT_MODEL: ModelId`, `isModelId(v: unknown): v is ModelId`, `MODEL_LABELS: Record<ModelId, string>` (`Luna`, `Terra`).

- [ ] **Step 1:** `pnpm add ai @ai-sdk/openai @ai-sdk/react`. Add `OPENAI_API_KEY=` and `OPENAI_VECTOR_STORE_ID=` to `.env.example`. Hugo adds his key to `.env.local`.
- [ ] **Step 2:** Write `scripts/check-models.mjs`: for each model in the allowlist, call `generateText` with `openai.tools.webSearch()` and a trivial prompt; print model, OK or the error. Run `node --env-file=.env.local scripts/check-models.mjs`. Expected: both OK. If either fails, stop and report to Hugo before continuing.
- [ ] **Step 3: Failing test** `models.test.ts`:

```ts
expect(isModelId("gpt-6-luna")).toBe(true);
expect(isModelId("gpt-6.1-terra")).toBe(true);
expect(isModelId("gpt-4o")).toBe(false);
expect(isModelId(undefined)).toBe(false);
expect(DEFAULT_MODEL).toBe("gpt-6-luna");
```

- [ ] **Step 4:** `pnpm test lib/assistant/models.test.ts` → FAIL. Implement `models.ts`. Run → PASS.
- [ ] **Step 5:** Commit `feat: assistant model allowlist and AI SDK deps`.

### Task 2: Manual to Markdown and vector store

**Files:**
- Create: `scripts/manual/pages.mjs`, `scripts/manual/pages.test.ts`, `scripts/manual-to-vector-store.mjs`
- Modify: `.gitignore` (add `context/manual.md`)

**Interfaces:**
- Produces: `pageLabel(text: string): string | null` and `toMarkdown(pages: string[]): string` from `scripts/manual/pages.mjs`.

- [ ] **Step 1: Failing tests** `pages.test.ts`:

```ts
expect(pageLabel("Cuando conduce\n...\n4-250\n")).toBe("4-250");
expect(pageLabel("Mantenimiento\n...\n6-14")).toBe("6-14");
expect(pageLabel("sin número de página")).toBeNull();
const md = toMarkdown(["texto A\n6-13", "texto B"]);
expect(md).toContain("## Página 6-13\n\ntexto A");
expect(md).toContain("## Página PDF 2\n\ntexto B");   // fallback keeps the text
```

- [ ] **Step 2:** Run → FAIL. Implement: `pageLabel` takes the last non-empty line matching `/^\d{1,2}-\d{1,3}$/`; `toMarkdown` joins `## Página <label>` (or `## Página PDF <n>`) + trimmed text with blank lines. Run → PASS.
- [ ] **Step 3:** Write `manual-to-vector-store.mjs`: run `pdftotext -layout -f n -l n` per page (813 pages; `pdfinfo` for the count), write `context/manual.md`, then with the `openai` client (dependency of `@ai-sdk/openai`; add `openai` explicitly if not hoisted) find or create vector store `pitstop-manual`, delete its existing files, upload `manual.md`, poll until `completed`, print `OPENAI_VECTOR_STORE_ID=<id>`.
- [ ] **Step 4:** Run `node --env-file=.env.local scripts/manual-to-vector-store.mjs`. Expected: `manual.md` about 1.2 MB with `## Página 6-14` present (`grep -c "## Página" context/manual.md` → 813), store status completed, id printed. Hugo adds the id to `.env.local` and Vercel.
- [ ] **Step 5:** Commit `feat: script to index the owner's manual`.

### Task 3: Chats migration

**Files:**
- Create: `supabase/migrations/0007_chats.sql`
- Modify: `lib/supabase/types.ts`

- [ ] **Step 1:** Write the migration exactly as the spec's Data model section, plus RLS enable and `owner_all` on both tables (same statement shape as `0001_schema.sql`).
- [ ] **Step 2:** Apply locally: `npx supabase db reset` (or `migration up`) → no errors.
- [ ] **Step 3:** Regenerate types: `npx supabase gen types typescript --local > lib/supabase/types.ts`; `npx tsc --noEmit` → clean.
- [ ] **Step 4:** Show the SQL to Hugo; on "go", `npx supabase db push --linked`. Verify with `npx supabase db query --linked "select count(*) from chats"` → 0.
- [ ] **Step 5:** Commit `feat: chats and chat_messages tables`.

### Task 4: Car context

**Files:**
- Create: `lib/assistant/context.ts`, `lib/assistant/context.test.ts`, `lib/data/assistant.ts`

**Interfaces:**
- Consumes: `ItemDue` from `lib/due`; `getDueSummary()` from `lib/data/due.ts`; `listServices()` from `lib/data/history.ts`.
- Produces: `buildCarContext(input: CarContextInput): string` (pure) where
  `CarContextInput = { vehicleName: string; currentKm: number; kmPerDay: number | null; today: string; services: Array<{ date: string; km: number; workshop: string | null; total: number | null; notes: string | null; items: string[] }>; due: ItemDue[] }`;
  and `getCarContext(): Promise<string>` in `lib/data/assistant.ts` (loads data, computes `kmPerDay` from the oldest and newest service-or-manual readings with real km, calls `buildCarContext`).

- [ ] **Step 1: Failing test** with two services (one with notes `"Km estimado. ..."`) and three `ItemDue` (one `vencido`, one `proximo`, one with `last: null`):

```ts
expect(out).toContain("183,289 km");
expect(out).toMatch(/2022-08-12.*136,150 km \(estimado\)/);
expect(out).toMatch(/Vencido:.*Cambio de aceite/);
expect(out).toMatch(/Sin registro:.*Líquido de frenos/);
expect(out).toContain("Chihuahua");
```

- [ ] **Step 2:** Run → FAIL. Implement: sections `Vehículo`, `Historial de servicios` (newest first), `Estado del mantenimiento` (Vencido / Próximo / Sin registro / Al día), km formatted with `formatKm` from `lib/format.ts` if it exists, else `toLocaleString('en-US')`. Run → PASS.
- [ ] **Step 3:** Implement `getCarContext()`; no test (thin loader over tested pieces).
- [ ] **Step 4:** Commit `feat: car context for the assistant`.

### Task 5: Chat persistence and the API route

**Files:**
- Create: `lib/assistant/chat.ts`, `lib/assistant/chat.test.ts`, `lib/data/chats.ts`, `lib/assistant/prompt.ts`, `app/api/chat/route.ts`, `app/api/chat/route.test.ts`

**Interfaces:**
- Consumes: `isModelId`, `DEFAULT_MODEL` (Task 1); `getCarContext()` (Task 4).
- Produces:
  - `HISTORY_LIMIT = 30`; `trimHistory<T>(messages: T[]): T[]`; `titleFrom(text: string): string` in `chat.ts`.
  - In `lib/data/chats.ts`: `listChats()`, `getChat(id): Promise<{ id, title, model, updated_at } | null>`, `loadMessages(chatId): Promise<UIMessage[]>`, `saveExchange(chatId, messages: UIMessage[], model: ModelId): Promise<void>` (inserts user + assistant rows, bumps `updated_at`, sets title when it is still the default), `createChat(model?)`, `renameChat(id, title)`, `deleteChat(id)`, `setChatModel(id, model)`.
  - `SYSTEM_PROMPT: string` in `prompt.ts` with the spec's rules.
  - `POST /api/chat` body `{ id: string; message: UIMessage }` → UI message stream.

- [ ] **Step 1: Failing tests** `chat.test.ts`:

```ts
expect(trimHistory(Array.from({ length: 45 }, (_, i) => i))).toEqual(Array.from({ length: 30 }, (_, i) => i + 15));
expect(trimHistory([1, 2])).toEqual([1, 2]);
expect(titleFrom("  ¿Qué aceite lleva mi coche para el cambio de enero?  ")).toBe("¿Qué aceite lleva mi coche para…");
expect(titleFrom("Hola")).toBe("Hola");
expect(titleFrom("   ")).toBe("Nueva conversación");
```

  (`titleFrom`: first 6 words, append `…` when truncated.)
- [ ] **Step 2:** Run → FAIL. Implement `chat.ts`. Run → PASS.
- [ ] **Step 3:** Read `node_modules/next/dist/docs/` route handler guide. Implement `lib/data/chats.ts` and `prompt.ts`.
- [ ] **Step 4: Failing route tests** `route.test.ts`, mocking `@/lib/supabase/server`, `@/lib/data/chats`, `@/lib/data/assistant` and `ai`'s `streamText`:
  - no user → 401;
  - `getChat` returns null → 404;
  - message with only whitespace text → 400, `streamText` not called;
  - chat with model `gpt-4o` → 400, `streamText` not called;
  - valid request → `streamText` called with `model` id `gpt-6-luna`, `maxOutputTokens: 1500`, tools `file_search` and `web_search`, `messages` length ≤ 30;
  - `onEnd` with `isAborted: true` or an error → `saveExchange` not called; normal end → called once with the user and assistant messages.
- [ ] **Step 5:** Run → FAIL. Implement the route per the spec's Server route section: `validateUIMessages`, `convertToModelMessages(trimHistory(...))`, `result.consumeStream()`, `toUIMessageStreamResponse({ originalMessages, generateMessageId: createIdGenerator({ prefix: 'msg', size: 16 }), sendSources: true, onEnd })`, `onError` returning `"No pude responder. Intenta de nuevo."`. Run → PASS.
- [ ] **Step 6:** Commit `feat: assistant chat API route`.

### Task 6: Manual-answer check (gate before UI)

**Files:**
- Create: `scripts/check-assistant.mjs`

- [ ] **Step 1:** Script that calls the same `streamText` setup (import `SYSTEM_PROMPT`, build context via a direct Supabase query using the linked CLI or service read) for each model and the spec's question list; prints answer and cited files/pages.
- [ ] **Step 2:** Run it. Expected: 4.5 L, 33 psi, DOT-3/DOT-4, 10,000 km / 6 months appear with a `Página` citation; history answers mention 2025-07-26 for balatas; shop search lists Chihuahua results. Paste the output for Hugo. If manual answers are wrong, fix the conversion in Task 2 and re-run before continuing.
- [ ] **Step 3:** Commit `chore: assistant answer check script`.

### Task 7: Chat list, actions and nav tab

**Files:**
- Create: `app/(app)/asistente/page.tsx`, `app/(app)/asistente/actions.ts`, `components/assistant/chat-list.tsx`, `components/assistant/confirm-sheet.tsx`
- Modify: `components/bottom-nav.tsx`

**Interfaces:**
- Consumes: `listChats`, `createChat`, `renameChat`, `deleteChat`, `setChatModel` (Task 5); `MODEL_LABELS` (Task 1).
- Produces: server actions `newChat(firstQuestion?: string)` (creates and redirects to `/asistente/[id]?q=...`), `rename(id, title)`, `remove(id)`, `changeModel(id, model)`; each validates with zod and calls `revalidatePath('/asistente')`.

- [ ] **Step 1:** Add the fourth tab `{ href: "/asistente", label: "Asistente", icon: <chat bubble path>, match: path.startsWith("/asistente") }`; grid `grid-cols-4`, `max-w-[400px]`.
- [ ] **Step 2:** Build the page and list per the spec's UI section (empty state with three suggestion chips: "¿Qué le toca a mi coche?", "¿Qué aceite lleva?", "Taller de frenos en Chihuahua").
- [ ] **Step 3:** `pnpm lint && npx tsc --noEmit` → clean. Run `pnpm dev`, create, rename and delete a chat at 390×844; screenshot and review against the other screens in `docs/screenshots`.
- [ ] **Step 4:** Commit `feat: assistant chat list`.

### Task 8: Conversation screen

**Files:**
- Create: `app/(app)/asistente/[id]/page.tsx`, `components/assistant/conversation.tsx`, `components/assistant/message.tsx`, `components/assistant/model-switch.tsx`, `components/assistant/sources.tsx`

**Interfaces:**
- Consumes: `getChat`, `loadMessages` (Task 5); `changeModel`, `rename` (Task 7); `POST /api/chat` (Task 5).
- Produces: `<Conversation chat={...} initialMessages={UIMessage[]} initialQuestion?: string />`.

- [ ] **Step 1:** Page loads chat and messages on the server, `notFound()` when missing, passes them to `Conversation`.
- [ ] **Step 2:** `Conversation` uses `useChat({ id, messages, transport: new DefaultChatTransport({ api: '/api/chat', prepareSendMessagesRequest: ({ id, messages }) => ({ body: { id, message: messages.at(-1) } }) }) })`; sends `initialQuestion` once on mount when present. Status text from tool parts (`Buscando en el manual…` for file search, `Buscando talleres…` for web search, else `Pensando…`); stop button while streaming; inline `Alert` with "Reintentar" calling `regenerate()` on error.
- [ ] **Step 3:** `Sources` renders `source-document` parts as "Manual p. <label>" chips (label parsed from the cited chunk or filename) and `source-url` parts as linked site names.
- [ ] **Step 4:** `pnpm lint && npx tsc --noEmit && pnpm test` → clean. In `pnpm dev`: a full conversation with a manual question and a shop question, a model switch, a reload that restores messages and sources. Screenshots at 390×844 with the keyboard open; review before continuing.
- [ ] **Step 5:** Commit `feat: assistant conversation screen`.

### Task 9: Ship check

- [ ] **Step 1:** `pnpm build` → success. `pnpm test` → all pass.
- [ ] **Step 2:** Confirm Hugo set `OPENAI_API_KEY`, `OPENAI_VECTOR_STORE_ID` on Vercel and a monthly budget limit in OpenAI.
- [ ] **Step 3:** Commit any remaining fixes; ask Hugo before pushing.
