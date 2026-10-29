import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  getChat: vi.fn(),
  loadMessages: vi.fn(),
  saveExchange: vi.fn(),
  streamText: vi.fn(),
  uiStreamOptions: undefined as undefined | Record<string, (...args: never[]) => unknown>,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { getUser: mocks.getUser } }),
}));
vi.mock("@/lib/data/chats", () => ({
  getChat: mocks.getChat,
  loadMessages: mocks.loadMessages,
  saveExchange: mocks.saveExchange,
}));
vi.mock("@/lib/data/assistant", () => ({ getCarContext: async () => "# Vehículo" }));
vi.mock("@ai-sdk/openai", () => {
  const openai = Object.assign((id: string) => ({ modelId: id }), {
    tools: { fileSearch: (o: unknown) => ({ kind: "file", o }), webSearch: (o: unknown) => ({ kind: "web", o }) },
  });
  return { openai };
});
vi.mock("ai", async (importOriginal) => ({
  ...(await importOriginal<typeof import("ai")>()),
  validateUIMessages: async ({ messages }: { messages: unknown[] }) => messages,
  convertToModelMessages: async (messages: unknown[]) => messages,
  streamText: mocks.streamText,
  toUIMessageStream: (options: Record<string, (...args: never[]) => unknown>) => {
    mocks.uiStreamOptions = options;
    return new ReadableStream();
  },
  createUIMessageStreamResponse: () => new Response("stream"),
}));

process.env.OPENAI_VECTOR_STORE_ID = "vs_test";
const { POST } = await import("./route");

const CHAT_ID = "6f1c2b4e-8d2a-4b8e-9a3f-1c2d3e4f5a6b";
const chatRow = (over: Record<string, unknown> = {}) => ({ id: CHAT_ID, title: "Nueva conversación", model: "gpt-6-luna", reasoning_effort: "low", max_output_tokens: 4000, updated_at: "", ...over });
const text = (id: string, role: "user" | "assistant", t: string) => ({ id, role, parts: [{ type: "text", text: t }] });
const request = (body: unknown) => new Request("http://localhost/api/chat", { method: "POST", body: JSON.stringify(body) });

beforeEach(() => {
  vi.clearAllMocks();
  mocks.uiStreamOptions = undefined;
  mocks.getUser.mockResolvedValue({ data: { user: { id: "u1" } } });
  mocks.getChat.mockResolvedValue(chatRow());
  mocks.loadMessages.mockResolvedValue([]);
  mocks.streamText.mockReturnValue({ stream: new ReadableStream(), consumeStream: vi.fn() });
});

describe("POST /api/chat", () => {
  it("rejects anonymous requests", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } });
    const res = await POST(request({ id: CHAT_ID, message: text("m1", "user", "hola") }));
    expect(res.status).toBe(401);
  });

  it("returns 404 for a chat that is missing or not the user's", async () => {
    mocks.getChat.mockResolvedValue(null);
    const res = await POST(request({ id: CHAT_ID, message: text("m1", "user", "hola") }));
    expect(res.status).toBe(404);
  });

  it("rejects an empty message without calling the model", async () => {
    const res = await POST(request({ id: CHAT_ID, message: text("m1", "user", "   ") }));
    expect(res.status).toBe(400);
    expect(mocks.streamText).not.toHaveBeenCalled();
  });

  it("rejects an oversized message without calling the model", async () => {
    const res = await POST(request({ id: CHAT_ID, message: text("m1", "user", "a".repeat(4001)) }));
    expect(res.status).toBe(400);
    const many = { id: "m1", role: "user", parts: Array.from({ length: 11 }, () => ({ type: "text", text: "hola" })) };
    expect((await POST(request({ id: CHAT_ID, message: many }))).status).toBe(400);
    expect(mocks.streamText).not.toHaveBeenCalled();
  });

  it("accepts only text parts from the user", async () => {
    const file = { id: "m1", role: "user", parts: [{ type: "text", text: "mira" }, { type: "file", url: "https://x.test/a.pdf", mediaType: "application/pdf" }] };
    const res = await POST(request({ id: CHAT_ID, message: file }));
    expect(res.status).toBe(400);
    expect(mocks.streamText).not.toHaveBeenCalled();
  });

  it("uses the chat's reasoning effort and output cap", async () => {
    mocks.getChat.mockResolvedValue(chatRow({ reasoning_effort: "high", max_output_tokens: 16000 }));
    await POST(request({ id: CHAT_ID, message: text("m1", "user", "hola") }));
    const args = mocks.streamText.mock.calls[0][0];
    expect(args.maxOutputTokens).toBe(16000);
    expect(args.providerOptions).toEqual({ openai: { reasoningEffort: "high" } });
  });

  it("tags the answer with its settings, finish reason and token use", async () => {
    await POST(request({ id: CHAT_ID, message: text("m1", "user", "hola") }));
    const meta = mocks.uiStreamOptions!.messageMetadata as (o: unknown) => unknown;
    const settings = { model: "gpt-6-luna", reasoningEffort: "low", maxOutputTokens: 4000 };
    expect(meta({ part: { type: "start" } })).toEqual(settings);
    expect(meta({ part: { type: "finish", finishReason: "length", totalUsage: { outputTokens: 4000 } } }))
      .toEqual({ ...settings, finishReason: "length", outputTokens: 4000 });
    expect(meta({ part: { type: "text-delta" } })).toBeUndefined();
  });

  it("rejects settings outside the allowed lists", async () => {
    mocks.getChat.mockResolvedValue(chatRow({ reasoning_effort: "max" }));
    expect((await POST(request({ id: CHAT_ID, message: text("m1", "user", "hola") }))).status).toBe(400);
    mocks.getChat.mockResolvedValue(chatRow({ max_output_tokens: 2000 }));
    expect((await POST(request({ id: CHAT_ID, message: text("m1", "user", "hola") }))).status).toBe(400);
    expect(mocks.streamText).not.toHaveBeenCalled();
  });

  it("rejects a chat whose model is not allowed", async () => {
    mocks.getChat.mockResolvedValue(chatRow({ model: "gpt-4o" }));
    const res = await POST(request({ id: CHAT_ID, message: text("m1", "user", "hola") }));
    expect(res.status).toBe(400);
    expect(mocks.streamText).not.toHaveBeenCalled();
  });

  it("calls the chat's model with both tools and at most 30 messages", async () => {
    mocks.loadMessages.mockResolvedValue(Array.from({ length: 40 }, (_, i) => text(`h${i}`, i % 2 ? "assistant" : "user", "x")));
    const res = await POST(request({ id: CHAT_ID, message: text("m1", "user", "¿qué aceite lleva?") }));
    expect(res.status).toBe(200);
    const args = mocks.streamText.mock.calls[0][0];
    expect(args.model).toEqual({ modelId: "gpt-6-luna" });
    expect(args.maxOutputTokens).toBe(4000); // includes reasoning tokens
    expect(args.providerOptions).toEqual({ openai: { reasoningEffort: "low" } });
    expect(Object.keys(args.tools).sort()).toEqual(["file_search", "web_search"]);
    expect(args.messages).toHaveLength(30);
    expect(args.messages.at(-1).id).toBe("m1");
    expect(args.system).toContain("<contexto_del_coche>\n# Vehículo");
  });

  it("saves the exchange only when the answer completes", async () => {
    const message = text("m1", "user", "hola");
    await POST(request({ id: CHAT_ID, message }));
    const reply = text("a1", "assistant", "respuesta");
    const onEnd = mocks.uiStreamOptions!.onEnd as (event: unknown) => Promise<void>;

    await onEnd({ isAborted: true, outcome: { status: "aborted" }, responseMessage: reply, messages: [] });
    await onEnd({ isAborted: false, outcome: { status: "failed" }, responseMessage: reply, messages: [] });
    expect(mocks.saveExchange).not.toHaveBeenCalled();

    await onEnd({ isAborted: false, outcome: { status: "completed" }, responseMessage: reply, messages: [] });
    expect(mocks.saveExchange).toHaveBeenCalledOnce();
    expect(mocks.saveExchange).toHaveBeenCalledWith(CHAT_ID, [message, reply]);
  });
});
