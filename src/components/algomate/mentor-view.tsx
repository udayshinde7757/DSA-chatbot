/**
 * MentorView — the AI chat interface.
 *
 * Uses a `key` on ChatSession so switching threads / starting new chat
 * creates a fresh useChat instance. Handles localStorage persistence,
 * the pending prompt mechanism from Dashboard/Topics/Practice, and
 * scroll-to-bottom for the message list.
 */

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { useEffect, useRef, useCallback } from "react";
import { Streamdown } from "streamdown";
import { cjk } from "@streamdown/cjk";
import { code } from "@streamdown/code";
import { math } from "@streamdown/math";
import { mermaid } from "@streamdown/mermaid";
import { Loader2, RotateCcw } from "lucide-react";
import { useStickToBottom } from "use-stick-to-bottom";

import { useAppState } from "./state";
import type { StoredThread } from "./state";
import { Composer } from "./composer";
import { EmptyChat } from "./empty-chat";

const streamdownPlugins = { cjk, code, math, mermaid };

// ── Helpers ─────────────────────────────────────────────────────────

function storedToUIMessages(msgs: StoredThread["messages"]): UIMessage[] {
  return msgs.map((m, i) => ({
    id: `restored-${i}-${m.content.length}`,
    role: m.role as "user" | "assistant",
    parts: [{ type: "text" as const, text: m.content }],
  }));
}

function uiMessagesToStored(msgs: UIMessage[]): StoredThread["messages"] {
  return msgs
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.parts
        .filter((p): p is { type: "text"; text: string } => p.type === "text")
        .map((p) => p.text)
        .join(""),
    }))
    .filter((m) => m.content.trim().length > 0);
}

function makeId(): string {
  return `msg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

// ── ChatSession (owns useChat) ──────────────────────────────────────

function ChatSession({
  threadId,
  initialMessages,
}: {
  threadId: string | null;
  initialMessages: UIMessage[];
}) {
  const { saveThread } = useAppState();
  const lastPersistedAt = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { messages, sendMessage, regenerate, stop, status, clearError } = useChat({
    id: threadId ?? undefined,
    messages: initialMessages.length > 0 ? initialMessages : undefined,
  });

  const busy = status === "streaming" || status === "submitted";

  // ── Persistence (debounced 600ms) ──
  const persist = useCallback(
    (msgs: UIMessage[]) => {
      const stored = uiMessagesToStored(msgs);
      if (stored.length === 0) return;
      const now = Date.now();
      if (now - lastPersistedAt.current < 500) return; // min gap
      lastPersistedAt.current = now;
      saveThread(stored);
    },
    [saveThread],
  );

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => persist(messages), 600);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [messages, persist]);

  // ── Pending prompt from sessionStorage (Dashboard/Topics/Practice) ──
  const pendingSent = useRef(false);
  useEffect(() => {
    if (pendingSent.current) return;
    const prompt = sessionStorage.getItem("algomate.pendingPrompt");
    if (prompt) {
      sessionStorage.removeItem("algomate.pendingPrompt");
      pendingSent.current = true;
      // Small tick so useChat is fully mounted
      queueMicrotask(() => sendMessage({ text: prompt }));
    }
  }, [sendMessage]);

  // ── Scroll to bottom ──
  const { scrollRef, contentRef, scrollToBottom, isAtBottom } = useStickToBottom({
    initial: "smooth",
    resize: "smooth",
  });

  const didUserScrollUp = useRef(false);
  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    didUserScrollUp.current = !atBottom;
  }, [scrollRef]);

  // Auto-scroll on new assistant content (unless user scrolled up)
  const prevMsgCount = useRef(messages.length);
  useEffect(() => {
    if (messages.length > prevMsgCount.current && !didUserScrollUp.current) {
      scrollToBottom();
    }
    prevMsgCount.current = messages.length;
  }, [messages.length, scrollToBottom]);

  // ── Send handler ──
  const handleSend = useCallback(
    (text: string) => {
      clearError();
      sendMessage({ text });
      didUserScrollUp.current = false;
      queueMicrotask(scrollToBottom);
    },
    [sendMessage, clearError, scrollToBottom],
  );

  const lastAssistant = messages[messages.length - 1];
  const isLastAssistantIncomplete =
    lastAssistant?.role === "assistant" &&
    lastAssistant.parts.some((p) => p.type === "text" && "state" in p && p.state === "streaming");

  return (
    <div className="flex h-full flex-col">
      {/* Messages */}
      <div ref={scrollRef} onScroll={onScroll} className="flex-1 overflow-y-auto overflow-x-hidden">
        <div ref={contentRef} className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
          {messages.length === 0 ? (
            <EmptyChat onPrompt={handleSend} />
          ) : (
            <div className="space-y-6">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}

              {/* Typing indicator (shown during submission before first token) */}
              {status === "submitted" && (
                <div className="msg-assistant inline-flex items-center gap-2">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Error banner */}
      {status === "error" && (
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div
            className="mb-2 flex items-center justify-between gap-2 rounded-lg px-4 py-3 text-[13px]"
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              color: "var(--color-error)",
            }}
          >
            <span>Something went wrong. Please try again.</span>
            <button
              className="btn btn-sm"
              onClick={() => {
                clearError();
                regenerate();
              }}
              style={{ color: "var(--color-error)", background: "rgba(239,68,68,0.08)" }}
            >
              <RotateCcw size={13} />
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Composer */}
      <div className="border-t" style={{ borderColor: "var(--color-charcoal-700)" }}>
        <div className="mx-auto max-w-3xl px-4 py-3 sm:px-6">
          <Composer onSend={handleSend} onStop={stop} busy={busy} />
        </div>
      </div>
    </div>
  );
}

// ── MessageBubble ───────────────────────────────────────────────────

function MessageBubble({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";
  const textContent = message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");

  if (!textContent.trim()) return null;

  if (isUser) {
    return <div className="msg-user">{textContent}</div>;
  }

  return (
    <div className="msg-assistant">
      <Streamdown
        className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
        plugins={streamdownPlugins}
      >
        {textContent}
      </Streamdown>
    </div>
  );
}

// ── MentorView (wrapper with thread switching) ──────────────────────

export function MentorView() {
  const { activeThreadId, threads } = useAppState();

  const thread = threads.find((t) => t.meta.id === activeThreadId);
  const initialMessages = thread ? storedToUIMessages(thread.messages) : [];

  // key = threadId or 'new' — changing key remounts ChatSession
  const chatKey = activeThreadId ?? `new-${Date.now()}`;

  return (
    <div className="flex h-full flex-col min-h-0 overflow-hidden">
      <ChatSession key={chatKey} threadId={activeThreadId} initialMessages={initialMessages} />
    </div>
  );
}
