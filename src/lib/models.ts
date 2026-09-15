/**
 * Centralized AI model configuration — single source of truth.
 *
 * The server uses this for both the chat endpoint and the public config
 * endpoint, so the client model label can never drift from reality again.
 * Never put API keys here or expose this file to the client bundle.
 */

export const MODELS = {
  primary: {
    id: "google/gemma-4-26b-a4b-it:free",
    label: "Gemma 4 26B",
    provider: "OpenRouter",
    tier: "Primary" as const,
  },
  fallback: {
    id: "gemini-3.6-flash",
    label: "Gemini 3.6 Flash",
    provider: "Google",
    tier: "Fallback" as const,
  },
} as const;

export const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
export const GEMINI_OPENAI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai";

/** Human-readable model card shown in the sidebar / topbar. */
export function describeModel() {
  return {
    primary: { ...MODELS.primary, label: MODELS.primary.label },
    fallback: { ...MODELS.fallback, label: MODELS.fallback.label },
  };
}
