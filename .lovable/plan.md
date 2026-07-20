## DSA Chatbot Frontend

Single-page chat UI for a Data Structures & Algorithms assistant. One ongoing conversation, no persistence, streaming responses via Lovable AI Gateway.

### Visual direction

- **Palette (Midnight Indigo):** bg `#0a0a1a`, surface `#141432`, border `#1e1e5a`, accent `#4f46e5` with an electric indigo glow. Tokens go into `src/styles.css` under `:root` + `@theme inline` as oklch values.
- **Typography:** JetBrains Mono for code/inline snippets and headings, Inter for body — coding-friendly but readable. Loaded via `<link>` in `__root.tsx`.
- **DSA background:** faint animated layer with floating algorithm snippets (Big-O labels like `O(log n)`, `O(n²)`, pseudocode fragments `while (lo <= hi)`, `dp[i] = min(...)`, `dfs(node)`), plus a subtle indigo grid gradient. Pure CSS + a small Motion-driven drift, low opacity so it never fights the chat.
- **Chat surface:** transparent assistant messages on the app background; user bubbles use `primary` / `primary-foreground` (indigo → white). Code blocks get a distinct darker surface with syntax-highlighted feel and a copy button.

### Layout

```text
┌─────────────────────────────────────────────┐
│  ◆ AlgoMate            [New chat]  [Model]  │  top bar
├─────────────────────────────────────────────┤
│                                             │
│   Empty state (before first message):       │
│   - Logo mark + tagline                     │
│   - 4 quick-start prompt chips              │
│     "Explain quicksort", "Two Sum in O(n)", │
│     "When to use a heap?", "DP intro"       │
│                                             │
│   After first message: streamed transcript  │
│                                             │
├─────────────────────────────────────────────┤
│  [ Ask about any DSA topic…        ] [ ▶ ]  │  composer
└─────────────────────────────────────────────┘
```

Centered max-width ~ 780px column, full-height, subtle animated background behind everything.

### Functionality

- Single conversation kept in component state via `useChat` from `@ai-sdk/react`; "New chat" clears messages. No localStorage, no DB.
- Streaming endpoint `src/routes/api/chat.ts` using `streamText` + `toUIMessageStreamResponse` with the Lovable AI Gateway (default model `google/gemini-2.5-flash`).
- System prompt tuned for DSA tutoring: explain complexity, show pseudocode + a language snippet (default C++/Python), suggest edge cases, ask a clarifying question when the problem is ambiguous.
- Render `message.parts` with `react-markdown` + GFM + `remark`/`rehype` for fenced code; code blocks have language label + copy button.
- Composer: multiline textarea, Enter to send / Shift+Enter newline, disabled + shimmer indicator while `status === "submitted" | "streaming"`, textarea auto-focus on load, after send, and after stream ends.

### AI Elements

Install and compose the UI from AI Elements: `conversation`, `message`, `prompt-input`, `shimmer`. Assistant messages use `MessageResponse` (no bubble background); user messages use `MessageContent` with indigo bubble. Prompt input uses `PromptInput` → `PromptInputTextarea` → `PromptInputFooter` (right-aligned `PromptInputSubmit`, `size="icon-sm"`).

### Files to add / edit

- `src/styles.css` — Midnight Indigo tokens, font families, background utilities.
- `src/routes/__root.tsx` — real title/description/og for "AlgoMate — DSA Chatbot"; JetBrains Mono + Inter `<link>`.
- `src/routes/index.tsx` — chat page (replaces placeholder), background layer, header, empty state, transcript, composer.
- `src/routes/api/chat.ts` — streaming server route wired to Lovable AI Gateway.
- `src/components/dsa-background.tsx` — animated code/algorithm snippet background.
- `src/components/chat/*` — `Message`, `MessageList`, `Composer`, `QuickPrompts`, `CodeBlock` built on AI Elements primitives.
- `src/components/ai-elements/*` — installed via `bunx ai-elements@latest add conversation message prompt-input shimmer`.
- `src/lib/system-prompt.ts` — DSA tutor system prompt.
- Logo asset generated to `src/assets/algomate-logo.png` (small indigo-glow mark, not a Sparkles icon).

### Technical notes

- Lovable Cloud enabled only for the AI Gateway key (`LOVABLE_API_KEY`); no DB tables, no auth.
- No thread list, no route params — single conversation lives at `/`.
- Background snippets are decorative text with `aria-hidden`; content is real HTML so it feels authentic without hurting a11y.
- Verify build + a quick Playwright screenshot of `/` before finishing.
