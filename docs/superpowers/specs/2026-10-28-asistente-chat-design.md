# Asistente: AI chat for Pitstop

Date: 2026-10-28
Status: design approved in conversation, pending spec review

## Goal

Ask questions about the car from inside the app instead of using Claude Code. The chat knows the service history and the Mazda 6 2015 owner's manual.

Typical questions, roughly in this order of frequency:

- General car questions and troubleshooting, grounded in this car ("hace un ruido al frenar").
- Questions about this car: specs from the manual, history ("¿cuándo cambié balatas?"), what is due.
- Finding shops in Chihuahua for a specific job.

The chat reads data. It never writes services, readings or maintenance items.

## Decisions

| Topic | Decision |
|---|---|
| Library | Vercel AI SDK (`ai`, `@ai-sdk/openai`, `@ai-sdk/react`) over the OpenAI Responses API |
| Models | Switch per chat between `gpt-6-luna` and `gpt-6.1-terra`; server-side allowlist |
| Manual | Converted to Markdown with one heading per page, uploaded to an OpenAI vector store, searched with `fileSearch` |
| Shops | `webSearch` with fixed `userLocation` Chihuahua, Chihuahua, MX; `searchContextSize: 'low'` |
| Conversations | Several saved chats; rename and delete |
| History sent to the model | Last 30 messages of the chat |
| Language | Spanish UI and answers |

## Data model

Migration `supabase/migrations/0007_chats.sql`. Same ownership pattern as `0001_schema.sql`: `user_id default auth.uid()`, RLS `owner_all`.

```sql
create table chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  title text not null default 'Nueva conversación',
  model text not null default 'gpt-6-luna' check (model in ('gpt-6-luna', 'gpt-6.1-terra')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index chats_user_updated on chats (user_id, updated_at desc);

create table chat_messages (
  id text primary key,               -- AI SDK UIMessage id, kept as generated
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  chat_id uuid not null references chats on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  parts jsonb not null,              -- UIMessage parts: text, sources, citations
  metadata jsonb,                    -- { "model": "gpt-6-luna" }
  created_at timestamptz not null default now()
);
create index chat_messages_chat_created on chat_messages (chat_id, created_at);
```

Both tables get RLS enabled and the `owner_all` policy.

Messages are stored in the `useChat` `UIMessage` format, as the AI SDK message persistence guide recommends. The car context and the manual are not stored here: context is rebuilt per request, the manual lives in the vector store.

The title starts as "Nueva conversación" and becomes the first ~6 words of the first question once the first answer is saved. No extra model call.

## Configuration

- `OPENAI_API_KEY`: server only.
- `OPENAI_VECTOR_STORE_ID`: printed by the setup script.

Both in `.env.local`, `.env.example` (empty) and Vercel. A monthly budget limit is set by hand in the OpenAI dashboard.

## Server route

`app/api/chat/route.ts`, POST. The client sends only `{ id, message }` (`prepareSendMessagesRequest` on `DefaultChatTransport`).

1. **Auth.** Supabase server client from `lib/supabase/server.ts`. No user → 401. RLS means a chat that is not the user's is not found → 404.
2. **Load.** The chat row (model) and its messages ordered by `created_at`. Append the new message, run `validateUIMessages` with the tool definitions. Keep the last 30 for the model.
3. **Car context.** `lib/assistant/context.ts` builds a text block from existing data:
   - Vehicle name, current km (latest odometer reading), average km per day.
   - Every service: date, km, whether the km is estimated (notes contain "Km estimado"), workshop, items, total, notes.
   - Every active maintenance item with its due status from `lib/due`: overdue, upcoming, or never recorded.
   - Today's date, location Chihuahua.
4. **Model call.** `streamText` with:
   - `model: openai(chat.model)` after the allowlist check in `lib/assistant/models.ts`.
   - System instructions: answer in Spanish, direct and practical; cite manual pages when used; flag safety items (brakes, tyres, steering) as urgent; never invent specs, look them up in the manual or say it is unknown; recommend a mechanic when a job is not DIY.
   - `tools.file_search = openai.tools.fileSearch({ vectorStoreIds: [OPENAI_VECTOR_STORE_ID], maxNumResults: 5 })`.
   - `tools.web_search = openai.tools.webSearch({ searchContextSize: 'low', userLocation: { type: 'approximate', country: 'MX', region: 'Chihuahua', city: 'Chihuahua', timezone: 'America/Chihuahua' } })`. The instructions say to use it only for shops, prices or current information.
   - `maxOutputTokens: 1500`.
5. **Respond.** `toUIMessageStreamResponse` with `sendSources: true`, server-generated assistant ids (`createIdGenerator`), and `consumeStream()` so the answer finishes even if the client disconnects. On end: insert the user and assistant messages (`metadata.model`), set `updated_at`, set the title on the first exchange.

Stop: the stop button only stops the display. The server keeps generating (`consumeStream`) and saves the full answer, the same as when the phone drops the connection, so a reload shows the complete answer and the question stays in history.

Limits: a question is text only, at most 10 parts of 4,000 characters each; anything else is a 400.

Errors: OpenAI failures (timeout, quota, unknown model) return an error part. Nothing is saved for the failed answer; the client shows a retry.

## UI

All components from the showroom kit in `components/ui`.

- **Bottom nav.** A fourth tab "Asistente", grid of 4, max width about 400px.
- **`/asistente`: chat list.** `PageHeader` with a "Nueva conversación" action. Rows: title, model `Chip`, relative date. A row menu with Renombrar (inline field) and Eliminar (in-app confirmation sheet, no browser dialogs). Empty state: one line and three suggestion chips that start a chat with that question.
- **`/asistente/[id]`: conversation.** Header with back, title (tap to rename) and a "Luna | Terra" segmented switch that updates the chat's model. User messages as right-aligned bubbles, answers as formatted text, source chips below each answer ("Manual p. 6-14", web site names linking out). Input fixed above the nav; send turns into stop while streaming. Status text "Pensando…", "Buscando en el manual…", "Buscando talleres…" from tool parts. Inline `Alert` with "Reintentar" on error.
- List, create, rename, delete and model change are server actions in `app/(app)/asistente/actions.ts`, matching the existing `actions.ts` files. The conversation page loads its messages on the server and passes them to `useChat`.
- Accessibility: `aria-live="polite"` on the message list, tap targets at least 44px, input visible above the iOS keyboard.

## Manual setup

`scripts/manual-to-vector-store.mjs`, run by hand once:

1. `pdftotext` per page (requires poppler). Detect the page label (`6-14`, `4-250`) from the page text and write `## Página <label>` before each page into `context/manual.md`.
2. Upload `manual.md` to OpenAI, create or reuse the vector store named `pitstop-manual`, replace any previous file in it.
3. Print `OPENAI_VECTOR_STORE_ID`.

The PDF is copy-protected (RC4), which is why the Markdown file is uploaded instead of the PDF. The text layer was checked: 813 pages, about 179,000 words, known specs present ("4,5 litros", "230 kPa (2,3 bar, 33 psi)").

## Testing

Unit tests (vitest):

- `lib/assistant/context.ts`: sample history → output contains current km, estimated-km labels, overdue and never-recorded items.
- History trimming keeps the last 30 messages in order.
- Model allowlist rejects anything other than the two models.
- Title from the first message: about 6 words, trimmed.
- Page-label detection in the conversion script on sample page texts.

Manual-answer check, `scripts/check-assistant.mjs`, prints answers and citations for both models:

- Oil capacity (4.5 L), tyre pressure (33 psi), TPMS reset, brake fluid type (DOT-3/DOT-4), oil interval (10,000 km / 6 months), one warning light.
- "¿Cuándo cambié balatas?" and "¿Qué me toca hacer?" against the real history.
- One shop search in Chihuahua.

Wrong manual answers mean the conversion is improved before the UI is built.

Real app: run locally, one full conversation, rename, delete, model switch; phone-size screenshots of both screens reviewed before calling it done.

## Before building

- Confirm with the key that `gpt-6-luna` and `gpt-6.1-terra` exist and support `file_search` and `web_search` in the Responses API.
- Read the Next.js 16 route handler docs in `node_modules/next/dist/docs/` (AGENTS.md).

## Out of scope

- The chat writing data (logging services or readings).
- Image upload (photo of a warning light).
- Voice input.
- Search across chats.
