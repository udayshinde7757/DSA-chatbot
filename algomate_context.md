# AlgoMate — Codebase Context File

> Generated: 2026-08-18
> Purpose: Single structured reference for further enhancement of the AlgoMate DSA chatbot.
> Project root: `C:\Programming\dsa-chatbot\dsa-chatbot\` (note: app lives inside `dsa-chatbot/dsa-chatbot`, one level below the git repo root).
> Framework: TanStack Start (React 19 + SSR, file-based routing) + Vite + Nitro (Vercel preset).

---

## 🔒 SECURITY NOTE

`.env` contains local API credentials and must never be committed.

`OPENROUTER_API_KEY` and `GEMINI_API_KEY` must remain server-side environment variables and must never be included in source files, documentation, or client-side bundles.

---

## 1. Current System Prompt (exact, verbatim)

File: `src/lib/system-prompt.ts`

```text
You are a Data structure and Algorithm Instructor. You will only reply to the Data structure and Algorithm. You have to solve query of user in simplest way.
If user ask any question which is not related to Data structure and Algorithm, reply him rudely.
Example: If user ask, How are you,
You will reply: You dumb ask me some sensible question.dont use this reply in all non dsa questions you can make your own reply rudely like this message you can reply anything to user rudely if question is not related to Data structure and Algorithm.

You have to reply him Rudely if question is not related to Data structure and Algorithm.
Else reply him politely with simple explanation.
```

- Exported as `DSA_SYSTEM_PROMPT` (const, single string).
- Injected server-side in `src/routes/api/chat.ts` via `streamText({ system: DSA_SYSTEM_PROMPT, ... })`.
- **Notable drift from `.lovable/plan.md`:** the plan described a different, friendlier persona ("explain complexity, show pseudocode + C++/Python snippet, suggest edge cases, ask clarifying questions when ambiguous"). The shipped prompt is a stricter "DSA-only, be rude to off-topic" persona. The plan also expected code snippets in C++/Python by default; nothing in code enforces a language.
- No temperature, max tokens, top-p, or stop sequences are configured anywhere.

---

## 2. Project Structure

```
dsa-chatbot/
├── .env                          # Local environment variables (ignored by git)
├── .env.example                  # Template: OPENROUTER_API_KEY= (server-only, no VITE_ prefix)
├── .gitignore                    # ignores .env, node_modules, .tanstack, .vercel, etc.
├── .lovable/
│   ├── plan.md                   # Original design spec ("Midnight Indigo" palette, friendlier persona)
│   └── project.json              # Lovable template metadata (tanstack_start_ts_current)
├── .tanstack/                    # TanStack build cache (auto)
├── .vercel/                      # Vercel build output (auto)
├── .prettierrc / .prettierignore
├── AGENTS.md                     # Lovable sync warning (don't rewrite pushed history)
├── bun.lock / package-lock.json  # lockfiles (bun + npm)
├── bunfig.toml                   # bun config: 24h supply-chain guard (minimumReleaseAge=86400)
├── components.json               # shadcn/ui config (new-york style, slate base, lucide icons)
├── eslint.config.js
├── package.json                  # deps + scripts (dev/build/preview/lint/format)
├── public/
│   └── favicon.ico
├── vercel.json                   # { "framework": "tanstack-start" }
├── vite.config.ts                # Lovable TanStack config; Nitro preset "vercel"; server entry = src/server.ts
├── src/
│   ├── assets/
│   │   └── algomate-logo.png     # logo asset (referenced in plan, see notes)
│   ├── components/
│   │   ├── ai-elements/          # shadcn "AI Elements" primitives (installed)
│   │   │   ├── conversation.tsx  # Conversation, ConversationContent, ScrollButton, Download(md)
│   │   │   ├── message.tsx       # Message, MessageContent, MessageResponse (Streamdown), branching
│   │   │   ├── prompt-input.tsx  # Full composer (attachments, screenshot, paste/drag, keyboard)
│   │   │   └── shimmer.tsx       # Animated shimmer text ("compiling response…")
│   │   ├── dsa-background.tsx    # Animated floating DSA code-snippet background layer
│   │   └── ui/                   # 49 shadcn/ui components (accordion…tooltip) — boilerplate, unmodified
│   ├── hooks/
│   │   └── use-mobile.tsx        # useIsMobile() media-query hook (currently unused?)
│   ├── lib/
│   │   ├── ai-gateway.server.ts  # Lovable AI Gateway provider (createLovableAiGatewayProvider) — NOT USED
│   │   ├── error-capture.ts      # Out-of-band error capture (TTL 5s) for h3-swallowed throws
│   │   ├── error-page.ts         # Static HTML error page string (renderErrorPage)
│   │   ├── lovable-error-reporting.ts # reportLovableError → window.__lovable* hooks
│   │   ├── system-prompt.ts      # DSA_SYSTEM_PROMPT (see section 1)
│   │   └── utils.ts              # cn() = clsx + tailwind-merge
│   ├── routes/
│   │   ├── __root.tsx            # App shell: meta/OG/Twitter, 404, error boundary, fonts, Analytics
│   │   ├── index.tsx             # MAIN CHAT PAGE (sidebar + chat surface + composer)
│   │   ├── api/chat.ts           # AI streaming endpoint (OpenRouter → Gemini fallback)
│   │   ├── README.md             # TanStack routing conventions
│   │   └── routeTree.gen.ts      # AUTO-GENERATED route tree (do not edit)
│   ├── router.tsx                # getRouter(): createRouter with QueryClient
│   ├── server.ts                 # SSR entry wrapper: normalize h3 500s into error page
│   ├── start.ts                  # createStart + errorMiddleware (catch → error page)
│   ├── styles.css                # Tailwind v4 + "Charcoal & Ember" theme tokens
│   └── routeTree.gen.ts          # (also referenced; same gen file)
└── (root-level files: package.json, Run.txt — Run.txt is just setup instructions)
```

### Purpose of key files

| File | Purpose |
|------|---------|
| `src/routes/index.tsx` | Entire UI: sidebar (sessions/topics), chat surface, empty state, composer, message rendering, status bar. |
| `src/routes/api/chat.ts` | Server route that calls the LLM and streams the response. |
| `src/routes/__root.tsx` | HTML shell, SEO meta, fonts (Work Sans + JetBrains Mono), Vercel Analytics, error/404 pages. |
| `src/lib/system-prompt.ts` | The AI persona/instruction text. |
| `src/components/ai-elements/*` | Reusable chat UI primitives (conversation list, message, prompt input, shimmer). |
| `src/components/dsa-background.tsx` | Decorative animated DSA snippet background (aria-hidden). |
| `src/server.ts` + `src/start.ts` | SSR error handling that surfaces a friendly HTML error page. |
| `src/lib/ai-gateway.server.ts` | Lovable AI Gateway provider — **dead code; the chat route does not use it.** |

---

## 3. Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | React 19.2 (`react`, `react-dom`) | Function components, hooks only. |
| Framework | TanStack Start (`@tanstack/react-start`) + TanStack Router (`@tanstack/react-router`) | File-based routing; SSR enabled; `ssr: true` in Register. |
| Build | Vite 8 + `@lovable.dev/vite-tanstack-config` | Lovable's preset wraps TanStack/Nitro/Tailwind/ts path alias. |
| Server runtime | Nitro (preset `vercel`) | Deploys as Vercel serverless functions. |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) + tw-animate-css | CSS-first `@theme` tokens in `styles.css`. |
| UI primitives | shadcn/ui (new-york, slate) + Radix UI | 49 components in `src/components/ui`. |
| AI SDK | `ai` v7 + `@ai-sdk/react` v4 + `@ai-sdk/openai-compatible` v3 | `useChat`, `streamText`, `convertToModelMessages`, `DefaultChatTransport`, `toUIMessageStreamResponse`. |
| AI gateway (alt) | `@google/genai` (GoogleGenAI) | Used ONLY for the fallback path; Lovable gateway module is unused. |
| Markdown render | `streamdown` v2 + `@streamdown/{cjk,code,math,mermaid}` | Renders assistant markdown (incl. code, LaTeX, mermaid). |
| State | React `useState` / `useMemo` / `useRef` + `@tanstack/react-query` (QueryClient in router context) | Chat state is local component state — **no persistence**. |
| Icons | `lucide-react` | Terminal, Send, Square, Plus, Trash2, Zap, etc. |
| Animation | `motion` (motion/react) | Shimmer + background drift. |
| Analytics | `@vercel/analytics` | `<Analytics />` in root component. |
| Package mgr | bun (lockfile) + npm fallback | `bunfig.toml` enforces 24h package-age guard. |
| Node | `>=20.19.0` | engines field. |

### AI API integration details

- **Primary provider:** OpenRouter via OpenAI-compatible SDK.
  - Base URL: `https://openrouter.ai/api/v1`
  - Auth: `apiKey: process.env.OPENROUTER_API_KEY`
  - Model: `google/gemma-4-26b-a4b-it:free` (constant `OPENROUTER_MODEL`)
- **Fallback provider:** Google Gemini (OpenAI-compatible endpoint).
  - Base URL: `https://generativelanguage.googleapis.com/v1beta/openai`
  - Auth: `Bearer ${process.env.GEMINI_API_KEY}`
  - Model: `gemini-3.6-flash` (constant `GEMINI_MODEL`)
  - Triggered by a custom `fetch` wrapper (`createOpenRouterFetchWithGeminiFallback`) that intercepts OpenRouter errors.

### Model being used

- Active model: **`google/gemma-4-26b-a4b-it:free`** (OpenRouter Gemma 4 26B).
- Fallback model: **`gemini-3.6-flash`**.
- **Mismatch with UI label:** the sidebar footer hardcodes `gemini-2.5-flash · ready` (see `index.tsx` status element) — that label is incorrect/outdated; the actual primary model is Gemma 4, not Gemini 2.5 Flash. The `.lovable/plan.md` also references `google/gemini-2.5-flash` as the "default model," so the label is a leftover from an earlier design.
- **Mismatch with plan:** plan said `default model google/gemini-2.5-flash`; code uses Gemma 4 free.

---

## 4. All Features (currently implemented)

1. **Single-page DSA chat tutor** at `/`.
2. **Streaming AI responses** via Server-Sent Events (`toUIMessageStreamResponse`).
3. **DSA-only persona** — polite for DSA, intentionally rude for off-topic (per system prompt).
4. **Multi-session (threads) sidebar** — create "new session," switch between sessions, delete sessions (hover trash icon). Sessions are **in-memory only** (no persistence; lost on reload).
5. **Session auto-rename** — first user message text becomes the thread title (`text.slice(0, 40)`).
6. **Empty state** with logo + 4 quick-start prompt chips (quicksort, Two Sum O(n), heap vs BST, DP intro). Clicking a chip sends it.
7. **Composer** (`PromptInput`):
   - Multiline textarea (JetBrains Mono).
   - Enter = send, Shift+Enter = newline; disabled + shimmer while streaming.
   - Auto-focus on load, after send, and after stream ends.
   - Stop button (Square icon) during generation; Send (arrow) otherwise.
   - **Built-in attachment support** (file picker, paste images, drag-drop, screenshot capture via `getDisplayMedia`) — though the page currently does NOT wire attachments into the message send (only `text` is sent; see section 6 gaps).
8. **Markdown rendering** of assistant replies with `Streamdown` plugins: `cjk`, `code`, `math`, `mermaid`. Code gets the ember-themed prose treatment.
9. **User/assistant message styling:** user as `you@dsa:~$` terminal bubble (ember); assistant as `◆ algomate` labeled streamed response.
10. **Auto-scroll** conversation to bottom (`use-stick-to-bottom`) with a scroll-to-bottom button when not at bottom.
11. **Error banner** inline in chat (`error.message`) when a request fails.
12. **"Compiling response…" shimmer** while `status === "submitted"`.
13. **IDE-style chrome:** top tab strip (`<session>.chat — algomate`), traffic-light dots, UTF-8/LF/streaming indicators; bottom status bar (`Ln N`, `Col 1`, `Spaces: 2`, msg count, idle/streaming).
14. **Animated DSA background** — 22 floating code snippets (Big-O, pseudocode) drifting, aria-hidden, low opacity.
15. **Topics list** in sidebar (12 DSA topics) — **display-only**; clicking does nothing (not wired to send).
16. **SSR error page** — friendly "This page didn't load" HTML page for catastrophic 500s (h3-swallowed errors).
17. **404 page** and **React error boundary** (Try again / Go home).
18. **Vercel Analytics** loaded on every page.
19. **SEO/meta** — title "AlgoMate — DSA Chatbot for Coders," description, OG/Twitter tags, fonts preconnect.
20. **OpenRouter → Gemini fallback** — automatic retry on rate-limit/quota/unavailable.

---

## 5. UI Components / Screens

### Screen: `/` (ChatPage)
Layout: flex row → `Sidebar` (hidden on mobile, `md:flex`) + main chat column.

**Sidebar** (`w-72`, `bg-sidebar`):
- Brand: `algomate_` + `dsa · repl` (Terminal icon in ember box).
- "new session" button (ember).
- "sessions" list: each row = MessageSquare icon + truncated title + hover Trash2 (delete). Active session highlighted.
- "topics" chips: 12 DSA topics (Arrays & Hashing … Bit Manipulation) — decorative.
- Footer status: green pulse dot + `gemini-2.5-flash · ready` (label is inaccurate — see section 3).

**Chat column:**
- **Top bar** (sticky): traffic-light dots, tab strip `{threadTitle}.chat — algomate`, right-side `UTF-8 · LF · ⚡ streaming`.
- **Body** (max-w-3xl, centered):
  - If empty → `EmptyState` (logo, `algomate.repl` with blinking caret, tagline, 4 quick-prompt cards, tip line).
  - Else → `Conversation` with messages; inline shimmer while "submitted"; inline error banner if `error`.
- **Composer** (below body): `>_` prompt glyph + `PromptInputTextarea` + footer (kbd hints + `PromptInputSubmit` with Send/Stop).
- **Status bar** (bottom): `algomate · main · N msg` (left); `Ln N+1, Col 1 · Spaces: 2 · idle|streaming` (right, sm+).

### Components breakdown

| Component | File | Role |
|-----------|------|------|
| `ChatPage` | `index.tsx` | Top-level state (threads, activeId) + layout. |
| `Sidebar` | `index.tsx` | Brand, new session, sessions list, topics, footer. |
| `ChatSurface` | `index.tsx` | `useChat` hook, header, body, composer, status bar. |
| `ChatMessage` | `index.tsx` | Renders one user/assistant message. |
| `EmptyState` | `index.tsx` | Logo, title, quick prompts, tip. |
| `Conversation*` | `ai-elements/conversation.tsx` | Scroll container, content, scroll button, markdown download. |
| `Message*` | `ai-elements/message.tsx` | Message bubble, response (Streamdown), branching UI. |
| `PromptInput*` | `ai-elements/prompt-input.tsx` | Full composer (text + attachments + submit). |
| `Shimmer` | `ai-elements/shimmer.tsx` | Animated gradient text. |
| `DsaBackground` | `dsa-background.tsx` | Decorative animated snippets. |
| `RootShell/RootComponent` | `__root.tsx` | HTML document, QueryClient, Analytics. |
| 49 shadcn/ui | `components/ui/*` | Standard primitives (button, dialog, select, etc.) — unused by chat UI mostly. |

### Color system ("Charcoal & Ember")
Defined in `src/styles.css` `:root` + `@theme inline`:
- `--background: oklch(0.18 0.005 60)` (near-black charcoal)
- `--surface / --surface-elevated`: dark grays
- `--primary / --ember: oklch(0.68 0.17 40)` (ember orange #e85d3a)
- `--ember-glow: oklch(0.78 0.15 45)`
- `--destructive: oklch(0.62 0.24 25)`
- `--sidebar: oklch(0.15 0.005 60)`
- Fonts: `--font-sans: "Work Sans"`, `--font-mono: "JetBrains Mono"`
- Utilities: `.bg-ide-grid` (subtle 32px grid), `.text-ember` (glow), `.ring-ember`, `.caret` (blinking).
- `.bg-dsa-ambient` / `.bg-dsa-grid` / `.dsa-snippet` classes are **referenced by `dsa-background.tsx` but NOT defined in `styles.css`** (likely injected by the Lovable config or missing — see gaps).

> Note: `.lovable/plan.md` specified a different "Midnight Indigo" palette (`#0a0a1a`/`#4f46e5`). The shipped theme is "Charcoal & Ember." The plan is stale.

---

## 6. Known Bugs, TODOs & Gaps

### Confirmed issues
1. **Security & Credentials**: `.env` contains local API credentials and must never be committed. `OPENROUTER_API_KEY` and `GEMINI_API_KEY` must remain server-side environment variables.
2. **Inaccurate model label:** sidebar says `gemini-2.5-flash · ready` but the model is Gemma 4 (OpenRouter). Misleads users.
3. **Unused Lovable AI Gateway** (`src/lib/ai-gateway.server.ts`) — the chat route bypasses it and calls OpenRouter/Gemini directly. Dead code; `LOVABLE_API_KEY` is not even read anywhere in the chat path.
4. **Missing CSS classes:** `dsa-background.tsx` uses `bg-dsa-ambient`, `bg-dsa-grid`, and `.dsa-snippet`, but `styles.css` only defines `bg-ide-grid`, `text-ember`, `ring-ember`. Those three background classes are **undefined** → the animated background's container styling/grid background may not render (snippets still render via inline styles). Verify whether the Lovable config injects them.
5. **`GEMINI_API_KEY` undocumented:** `.env.example` only documents `OPENROUTER_API_KEY`; the fallback needs `GEMINI_API_KEY` but it's not in the example/template. If unset, fallback silently returns the original OpenRouter error.
6. **Topics chips do nothing:** the 12 sidebar topics are display-only; no click handler to inject a topic prompt.
7. **Attachments not actually sent:** `PromptInput` supports files/screenshots, but `ChatSurface.submit()` only calls `sendMessage({ text: value })`. Files are never transmitted to `/api/chat`. The server also only reads `messages`, not attachments.
8. **No temperature / maxTokens / top-p / stop:** `streamText` uses only `model`, `system`, `messages`. Responses are fully default. (Functional, but worth configuring for consistency.)
9. **No streaming timeout / abort to client error mapping:** if the LLM hangs, the UI stays in "submitted" until the SDK times out.
10. **`use-mobile.tsx` appears unused** (sidebar uses Tailwind `md:` breakpoint instead). Dead file unless used elsewhere.
11. **`@google/genai` `GoogleGenAI` is constructed but result unused** in the fallback (`new GoogleGenAI({ apiKey })`) — only serves as a validation side-effect; the actual fetch uses raw `fetch` to the OpenAI-compatible Gemini URL. Minor dead code.
12. **Single conversation history per session:** switching threads keeps each thread's messages in the `useChat` state keyed by `id`, but nothing persists across reloads. Reloading loses everything (expected, but worth noting for "enhancement").

### Error-handling gaps
- `api/chat.ts` catches errors and returns `error.message` with status 500 — but the fallback `fetch` path can itself throw (network) without a try/catch around the Gemini retry; an exception there bubbles to the outer try/catch and returns a 500 (acceptable, but the fallback failure is not distinguished from a primary failure).
- `shouldFallbackToGemini` only inspects status 429/503 and a fixed keyword list. Other transient errors (e.g., 500, timeouts, partial JSON) won't trigger fallback.
- The fallback only rewrites the model name in the JSON body via string `.replace('"model":"..."')`. If the body format differs, the model won't be swapped and Gemini may reject it.

### Commented / noted intent (from code comments)
- `prompt-input.tsx`: `syncHiddenInput` prop "is no longer functional" (commented).
- `error-capture.ts`: captures errors out-of-band because h3 swallows throws into `{"unhandled":true,"message":"HTTPError"}`.
- `server.ts`: documents the h3-swallow behavior.
- `lovable-error-reporting.ts`: forwards boundary errors to Lovable telemetry (editor-only).

---

## 7. API Calls — How the AI is Called

### Client → Server
- `ChatSurface` (`index.tsx`) uses `useChat({ id, transport: new DefaultChatTransport({ api: "/api/chat" }) })`.
- On submit: `sendMessage({ text })` → POST `/api/chat` with `body.messages` (Vercel AI SDK UIMessage array).
- Streaming response consumed via the SDK's UI message stream.

### Server (`src/routes/api/chat.ts`)
Route: `POST /api/chat` (TanStack Start server handler).

Flow:
1. Parse JSON body; **validate** `body.messages` is an array → else `400 "Messages are required"`.
2. **Validate** `process.env.OPENROUTER_API_KEY` present → else `500 "Missing OPENROUTER_API_KEY"`.
3. Build OpenRouter provider (`createOpenAICompatible`, baseURL `https://openrouter.ai/api/v1`, `apiKey`, custom `fetch` wrapper).
4. `streamText({ model: openrouter(OPENROUTER_MODEL), system: DSA_SYSTEM_PROMPT, messages: convertToModelMessages(body.messages) })`.
5. Return `result.toUIMessageStreamResponse({ originalMessages: body.messages })`.

### Streaming / Generation parameters
- **temperature:** not set (SDK default).
- **maxTokens:** not set.
- **topP / topK / frequencyPenalty / presencePenalty:** not set.
- **stopSequences:** not set.
- **system:** `DSA_SYSTEM_PROMPT` (fixed).
- **messages:** converted from UI messages.

### Fallback logic (`createOpenRouterFetchWithGeminiFallback`)
- Intercepts the OpenRouter `fetch`. If the OpenRouter response is **not ok** AND `shouldFallbackToGemini(status, body)` is true:
  - `shouldFallbackToGemini` returns true if `status === 429 || 503`, OR body text contains any of:
    - `rate limit`, `rate_limit`, `quota exceeded`, `quota_exceeded`, `daily limit`, `daily_limit`, `provider unavailable`, `provider_unavailable`.
  - Then, if `process.env.GEMINI_API_KEY` exists:
    - Construct `GoogleGenAI({ apiKey })` (validation side-effect only).
    - Swap base URL `https://openrouter.ai/api/v1` → `https://generativelanguage.googleapis.com/v1beta/openai`.
    - Set `Authorization: Bearer <GEMINI_API_KEY>`, delete `HTTP-Referer` and `X-Title` headers.
    - Replace model string `"model":"google/gemma-4-26b-a4b-it:free"` → `"model":"gemini-3.6-flash"` in the request body.
    - Re-fetch against Gemini.
  - If no `GEMINI_API_KEY`, returns the original (failed) OpenRouter response as-is.

### Error handling in route
- Outer `try/catch` around `streamText`: logs `[api/chat] error`, returns `500` with `error.message`.

---

## 8. User Flow (start → finish)

1. User opens `/` (SSR-rendered by TanStack Start + Nitro on Vercel).
2. `ChatPage` mounts with **one default thread** (`"New session"`, `crypto.randomUUID()`).
3. Empty state shows: `algomate.repl` logo, tagline, 4 quick-prompt chips, tip.
4. **First interaction** — user either:
   - Clicks a quick-prompt chip → `submit(label)`; **or**
   - Types in the composer + presses Enter → `submit(value)`.
5. `submit()`: trims input; ignores if empty or busy; on first message calls `onFirstMessage(text)` which **renames the thread** to the first 40 chars; clears input; calls `sendMessage({ text })`.
6. `useChat` POSTs messages to `/api/chat`. Server streams tokens via `streamText` → `toUIMessageStreamResponse`.
7. UI renders streamed assistant text with `Streamdown` (markdown/code/math/mermaid). A `">_"` shimmer shows while `submitted`; Stop button available while generating.
8. Auto-scroll keeps the latest message in view; scroll-to-bottom button appears when scrolled up.
9. If the request errors, an inline `error: <message>` banner shows. If the server catastrophically fails (h3 500), the SSR wrapper renders the "This page didn't load" HTML page.
10. **Sidebar actions** (anytime):
    - "new session" → adds a fresh thread, switches to it.
    - Click a session → switches active thread (its own message history via `useChat` keyed by `id`).
    - Hover + Trash2 → deletes that session (auto-creates a new one if list becomes empty).
11. User can keep chatting in the active thread; **no persistence** — reloading the page resets to a single "New session" thread.
12. Optional (unused): attachments/screenshots could be added via the composer's file/screenshot menu, but they are not sent (see gaps).

---

## 9. Hardcoded Values & Labels

| Value | Location | Notes |
|-------|----------|-------|
| `OPENROUTER_MODEL = "google/gemma-4-26b-a4b-it:free"` | `api/chat.ts:10` | Primary model. |
| `GEMINI_MODEL = "gemini-3.6-flash"` | `api/chat.ts:11` | Fallback model. |
| `GEMINI_OPENAI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai"` | `api/chat.ts:12` | Fallback base URL. |
| OpenRouter base URL `"https://openrouter.ai/api/v1"` | `api/chat.ts:83` | Primary base URL. |
| Fallback error keywords (8 strings) | `api/chat.ts:13-22` | Rate-limit/quota/provider patterns. |
| `400 "Messages are required"` | `api/chat.ts:73` | Validation message. |
| `500 "Missing OPENROUTER_API_KEY"` | `api/chat.ts:78` | Missing-key message. |
| Thread title cap `text.slice(0, 40)` | `index.tsx:109` | First-message rename length. |
| `"New session"` default title | `index.tsx:66,73,82` | New thread label. |
| Sidebar footer `gemini-2.5-flash · ready` | `index.tsx:218` | **Inaccurate** (actual model is Gemma 4). |
| 4 `QUICK_PROMPTS` | `index.tsx:42-47` | quicksort / Two Sum / heap vs BST / DP intro. |
| 12 `TOPICS` | `index.tsx:49-62` | Arrays & Hashing … Bit Manipulation (display-only). |
| Placeholder text | `index.tsx:326` | "ask about any DSA topic — algorithm, complexity, problem…" |
| Status bar `Spaces: 2` | `index.tsx:372` | Decorative IDE label. |
| Error banner prefix `error:` | `index.tsx:302` | Inline error styling. |
| Shimmer text `"compiling response…"` | `index.tsx:297` | Loading indicator. |
| Empty-state tip | `index.tsx:447` | "paste raw problem statements — I'll break them down step-by-step." |
| `TTL_MS = 5_000` | `error-capture.ts:5` | Error capture TTL. |
| App title `AlgoMate — DSA Chatbot for Coders` | `__root.tsx:76` | SEO title. |
| App description | `__root.tsx:77-78` | SEO description. |
| Fonts: Work Sans (400-700) + JetBrains Mono (400-700) | `__root.tsx:101` | Google Fonts link. |
| 22 background snippets | `dsa-background.tsx:3-28` | Hardcoded DSA snippet strings. |
| Background animation `18-40s` duration, `-30-0s` delay | `dsa-background.tsx:48-49` | Seeded pseudo-random. |
| Nitro preset `"vercel"` | `vite.config.ts:12` | Deploy target. |
| `engines.node >=20.19.0` | `package.json:7` | Node requirement. |
| `minimumReleaseAge = 86400` (24h) | `bunfig.toml:4` | Supply-chain guard. |
| `react` / `react-dom` `^19.2.0` | `package.json` | React version. |

### Fallback / empty-state strings
- Composer submit disabled when `!isBusy && input.trim().length === 0`.
- Stop triggered via `status === "submitted" || status === "streaming"`.

---

## 10. Quick Enhancement Checklist (derived from gaps)

- [ ] **Rotate OpenRouter key** (complete manual rotation in OpenRouter dashboard).
- [ ] Fix sidebar model label to reflect the real model (`google/gemma-4-26b-a4b-it:free` or "Gemma 4 (OpenRouter)").
- [ ] Document `GEMINI_API_KEY` in `.env.example` (fallback is dead without it).
- [ ] Wire the 12 topics chips to send a prompt (or remove them).
- [ ] Either enable attachments end-to-end or hide the unused file/screenshot UI.
- [ ] Set `temperature`/max tokens on `streamText` for deterministic tutoring.
- [ ] Verify `bg-dsa-ambient`/`bg-dsa-grid`/`.dsa-snippet` CSS exists (add to `styles.css` if missing).
- [ ] Remove dead `ai-gateway.server.ts` and `GoogleGenAI` no-op, or actually use the Lovable gateway.
- [ ] Reconcile `.lovable/plan.md` with the shipped "Charcoal & Ember" theme + rude persona (update plan or align code).
- [ ] Consider persistence (localStorage / DB) if multi-session should survive reload.
```


✅ AlgoMate rebuild — done

Build chain — all green:
- tsc --noEmit — 0 errors
- vite build (Vercel/Nitro production) — passes
- eslint src — 0 errors, 10 cosmetic react-refresh warnings (by-design files that export hooks + components)
- Live app healthy at localhost:8080 (200s on / and /api/config)

This session's refinements (task #7–#9):

1. animated-button.tsx — fixed the TS2589/TS2590 deep-type errors by dropping the polymorphic as prop (now always motion.button), and added useReducedMotion() so the infinite ember shine disables for users with prefers-reduced-motion (accessibility was a spec requirement).
2. Mobile sidebar bug fix — if the desktop sidebar was collapsed and you opened the mobile nav, the sheet stayed invisible (opacity:0/pointer-events:none from data-collapsed weren't overridden). Now the open state always wins.
3. Sidebar — the close (X) button is now lg:hidden; desktop no longer shows a dead button.
4. Dashboard — removed the unused recent stat.
5. CSS polish — :active press states on all buttons, disabled-primary styling, subtle shadows on user/assistant bubbles for depth.
6. Deleted src/components/ai-elements/ — the unused pre-rebuild chat components (verified zero references).
7. Normalized CRLF → LF across the whole src tree (the pre-existing shadcn boilerplate and lib/ files had Windows line endings that failed prettier/eslint). This is exactly what the repo's own format script does — it fixes npm run lint, but it does mean a broad whitespace-only diff across those files.

Note on chat testing: /api/chat correctly returns Missing OPENROUTER_API_KEY in this shell because no key is exported here — the route logic itself is sound (streamText → toUIMessageStreamResponse, Gemini fallback wiring, input validation all in place). With OPENROUTER_API_KEY (and optionally GEMINI_API_KEY for fallback) in the environment it will stream normally, matching how it behaved before the rebuild.

What the product now delivers:
- Dashboard — ember-glow hero with the VengeanceUI shine CTA, action cards, stats, quick-start grid, "Continue learning" recent threads
- AI Mentor — streaming chat with Streamdown rendering (Shiki code + copy buttons, math, mermaid), local persistence, thread switching, error+retry, typing indicator, scroll-aware sticky-to-bottom
- Topics — 18 topics across 3 categories, searchable, difficulty badges, one-click guided lessons
- Practice — 10 classic problems, difficulty filters, guided-solve prompts
- Shell — charcoal+ember design system, ambient background, collapsible sidebar, model badge, full mobile responsiveness, reduced-motion support, SEO/OG metadata

The dev server is still running if you want to open it and click through. One optional cleanup for a later commit: the README still describes the old positioning — say the word if you'd like it updated to match the new product.