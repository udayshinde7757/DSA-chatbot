import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

import { DSA_SYSTEM_PROMPT } from "@/lib/system-prompt";

type ChatMessage = {
  role?: unknown;
  content?: unknown;
  parts?: unknown;
};

type ChatRequestBody = { messages?: unknown };

const OPENROUTER_MODEL = "google/gemma-4-26b-a4b-it:free";
const GEMINI_MODEL = "gemini-3.6-flash";
const GEMINI_OPENAI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai";
const FALLBACK_ERROR_PATTERNS = [
  "rate limit",
  "rate_limit",
  "quota exceeded",
  "quota_exceeded",
  "daily limit",
  "daily_limit",
  "provider unavailable",
  "provider_unavailable",
];

// Limit on number of messages per request (prevent abuse)
const MAX_MESSAGES = 100;
// Max length of a single message content
const MAX_MESSAGE_LENGTH = 50000;

function isValidMessage(msg: unknown): msg is ChatMessage {
  if (!msg || typeof msg !== "object") return false;

  const m = msg as Record<string, unknown>;

  // role must be a valid string
  if (typeof m.role !== "string") return false;
  if (!["system", "user", "assistant", "data"].includes(m.role)) return false;

  // At least one of content or parts must be present
  const hasContent = typeof m.content === "string";
  const hasParts = Array.isArray(m.parts);

  if (!hasContent && !hasParts) return false;

  // If content is present, validate length
  if (hasContent && (m.content as string).length > MAX_MESSAGE_LENGTH) return false;

  // If parts is present, validate structure
  if (hasParts) {
    const parts = m.parts as unknown[];
    if (parts.length > 200) return false; // reasonable cap

    for (const part of parts) {
      if (!part || typeof part !== "object") return false;
      const p = part as Record<string, unknown>;
      if (typeof p.type !== "string") return false;
      if (p.type === "text" && typeof p.text !== "string") return false;
    }
  }

  return true;
}

function shouldFallbackToGemini(status: number, body: string) {
  if (status === 429 || status === 503) return true;

  const normalizedBody = body.toLowerCase();
  return FALLBACK_ERROR_PATTERNS.some((pattern) => normalizedBody.includes(pattern));
}

function createOpenRouterFetchWithGeminiFallback() {
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const openRouterResponse = await fetch(input, init);
    const errorBody = openRouterResponse.ok ? "" : await openRouterResponse.clone().text();

    if (openRouterResponse.ok || !shouldFallbackToGemini(openRouterResponse.status, errorBody)) {
      return openRouterResponse;
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return openRouterResponse;
    }

    const openRouterUrl = input instanceof Request ? input.url : input.toString();
    const geminiUrl = openRouterUrl.replace("https://openrouter.ai/api/v1", GEMINI_OPENAI_BASE_URL);
    const headers = new Headers(init?.headers);
    headers.set("Authorization", `Bearer ${geminiApiKey}`);
    headers.delete("HTTP-Referer");
    headers.delete("X-Title");

    const body =
      typeof init?.body === "string"
        ? init.body.replace(`"model":"${OPENROUTER_MODEL}"`, `"model":"${GEMINI_MODEL}"`)
        : init?.body;

    return fetch(geminiUrl, {
      ...init,
      headers,
      body,
    });
  };
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: ChatRequestBody;
        try {
          body = (await request.json()) as ChatRequestBody;
        } catch {
          return new Response("Invalid JSON body", { status: 400 });
        }

        // Validate messages array
        if (!Array.isArray(body.messages)) {
          return new Response("Missing or invalid 'messages' array", { status: 400 });
        }

        if (body.messages.length === 0) {
          return new Response("'messages' array cannot be empty", { status: 400 });
        }

        if (body.messages.length > MAX_MESSAGES) {
          return new Response(`Too many messages (max ${MAX_MESSAGES})`, { status: 400 });
        }

        // Validate each message
        if (!body.messages.every(isValidMessage)) {
          return new Response("Invalid message structure in 'messages'", { status: 400 });
        }

        const key = process.env.OPENROUTER_API_KEY;
        if (!key) {
          return new Response("Missing OPENROUTER_API_KEY", { status: 500 });
        }

        const openrouter = createOpenAICompatible({
          name: "openrouter",
          baseURL: "https://openrouter.ai/api/v1",
          apiKey: key,
          fetch: createOpenRouterFetchWithGeminiFallback(),
        });
        const model = openrouter(OPENROUTER_MODEL);

        try {
          const result = streamText({
            model,
            system: DSA_SYSTEM_PROMPT,
            messages: await convertToModelMessages(body.messages as UIMessage[]),
            temperature: 0.4,
            maxTokens: 2048,
          });

          return result.toUIMessageStreamResponse({
            originalMessages: body.messages as UIMessage[],
          });
        } catch (error) {
          console.error("[api/chat] error", error);
          const message = error instanceof Error ? error.message : "Unknown error";
          return new Response(message, { status: 500 });
        }
      },
    },
  },
});
