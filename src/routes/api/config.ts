import { createFileRoute } from "@tanstack/react-router";
import { MODELS } from "@/lib/models";

/**
 * Public, safe model status endpoint.
 * Returns only model metadata — never API keys.
 */
export const Route = createFileRoute("/api/config")({
  server: {
    handlers: {
      GET: async () => {
        const primary = { ...MODELS.primary };
        const fallback = { ...MODELS.fallback };
        return Response.json({
          model: primary,
          fallback,
          status: "ok" as const,
        });
      },
    },
  },
});
