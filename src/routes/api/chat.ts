import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

import { DSA_SYSTEM_PROMPT } from "@/lib/system-prompt";

type ChatRequestBody = { messages?: unknown };

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
        });
        const model = openrouter("google/gemma-4-26b-a4b-it:free");

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
