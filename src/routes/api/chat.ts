import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { GoogleGenAI } from "@google/genai";

import { DSA_SYSTEM_PROMPT } from "@/lib/system-prompt";

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

    new GoogleGenAI({ apiKey: geminiApiKey });

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
        const body = (await request.json()) as ChatRequestBody;
        if (!Array.isArray(body.messages)) {
          return new Response("Messages are required", { status: 400 });
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
