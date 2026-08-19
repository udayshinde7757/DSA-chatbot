import { useChat } from "@ai-sdk/react";
import { createFileRoute } from "@tanstack/react-router";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Binary,
  BrainCircuit,
  ChevronRight,
  Cpu,
  MessageSquare,
  Network,
  Plus,
  Send,
  Square,
  Terminal,
  Trash2,
  Zap,
} from "lucide-react";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { DsaBackground } from "@/components/dsa-background";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")(
  { component: ChatPage },
);

type Thread = {
  id: string;
  title: string;
  createdAt: number;
};

const QUICK_PROMPTS = [
  {
    label: "Explain quicksort with a dry-run",
    tag: "sort",
    icon: <BrainCircuit className="size-4" />,
    color: "amber",
  },
  {
    label: "Two Sum in O(n) — walk me through it",
    tag: "array",
    icon: <Binary className="size-4" />,
    color: "cyan",
  },
  {
    label: "When should I reach for a heap vs a BST?",
    tag: "tree",
    icon: <Network className="size-4" />,
    color: "purple",
  },
  {
    label: "Introduce dynamic programming with an example",
    tag: "dp",
    icon: <Cpu className="size-4" />,
    color: "amber",
  },
];

const TOPICS = [
  "Arrays & Hashing",
  "Two Pointers",
  "Sliding Window",
  "Binary Search",
  "Linked List",
  "Trees & BST",
  "Heaps / Priority Queue",
  "Graphs (BFS/DFS)",
  "Dynamic Programming",
  "Greedy",
  "Backtracking",
  "Bit Manipulation",
];

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ChatPage — root layout
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function ChatPage() {
  const [threads, setThreads] = useState<Thread[]>([
    { id: crypto.randomUUID(), title: "New session", createdAt: Date.now() },
  ]);
  const [activeId, setActiveId] = useState<string>(() => threads[0].id);

  const activeThread = threads.find((t) => t.id === activeId) ?? threads[0];

  const newChat = useCallback(() => {
    const t = {
      id: crypto.randomUUID(),
      title: "New session",
      createdAt: Date.now(),
    };
    setThreads((prev) => [t, ...prev]);
    setActiveId(t.id);
  }, []);

  const removeChat = useCallback(
    (id: string) => {
      setThreads((prev) => {
        const next = prev.filter((t) => t.id !== id);
        if (next.length === 0) {
          const t = {
            id: crypto.randomUUID(),
            title: "New session",
            createdAt: Date.now(),
          };
          setActiveId(t.id);
          return [t];
        }
        if (id === activeId) setActiveId(next[0].id);
        return next;
      });
    },
    [activeId],
  );

  const renameThread = useCallback((id: string, title: string) => {
    setThreads((prev) =>
      prev.map((t) => (t.id === id ? { ...t, title } : t)),
    );
  }, []);

  return (
    <div className="flex min-h-screen w-full bg-ide-grid text-foreground">
      {/* 3D animated background */}
      <DsaBackground />

      <Sidebar
        threads={threads}
        activeId={activeId}
        onSelect={setActiveId}
        onNew={newChat}
        onDelete={removeChat}
      />

      <div className="flex min-h-screen flex-1 flex-col">
        <ChatSurface
          key={activeThread.id}
          threadId={activeThread.id}
          threadTitle={activeThread.title}
          onFirstMessage={(text) =>
            renameThread(activeThread.id, text.slice(0, 40))
          }
        />
      </div>
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Sidebar — 3D floating panel
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function Sidebar({
  threads,
  activeId,
  onSelect,
  onNew,
  onDelete,
}: {
  threads: Thread[];
  activeId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setTimeout(() => {
      onDelete(id);
      setDeletingId(null);
    }, 350);
  };

  return (
    <aside
      className={cn(
        "sidebar-flip hidden w-72 shrink-0 flex-col md:flex",
        "glass-panel",
        "border-r-0",
      )}
      style={{
        borderRight: "1px solid oklch(0.35 0.025 268 / 35%)",
      }}
    >
      {/* ── Brand ── */}
      <div
        className="flex h-16 items-center gap-3 px-4"
        style={{
          borderBottom: "1px solid oklch(0.35 0.025 268 / 35%)",
          background:
            "linear-gradient(180deg, oklch(0.18 0.025 268 / 60%) 0%, transparent 100%)",
        }}
      >
        {/* Animated logo icon */}
        <div className="relative grid size-9 shrink-0 place-items-center rounded-lg pulse-amber">
          <div
            className="absolute inset-0 rounded-lg"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.72 0.20 40) 0%, oklch(0.62 0.25 290) 100%)",
            }}
          />
          <Terminal
            className="relative size-4.5 text-white"
            strokeWidth={2.5}
          />
        </div>

        <div className="flex flex-col leading-tight">
          <span className="font-mono text-sm font-bold tracking-tight">
            algo
            <span
              className="text-cyan"
              style={{ fontWeight: 800 }}
            >
              mate
            </span>
            <span className="text-ember">_</span>
          </span>
          <span
            className="font-mono text-[0.58rem] uppercase tracking-[0.22em]"
            style={{ color: "oklch(0.78 0.18 200 / 70%)" }}
          >
            AI · Coding Lab
          </span>
        </div>
      </div>

      {/* ── New session button ── */}
      <div className="p-3">
        <button
          onClick={onNew}
          className={cn(
            "group relative w-full overflow-hidden rounded-lg px-3 py-2.5",
            "font-mono text-sm font-semibold text-white",
            "transition-all duration-300",
          )}
          style={{
            background:
              "linear-gradient(135deg, oklch(0.72 0.20 40) 0%, oklch(0.62 0.25 290 / 80%) 100%)",
            boxShadow:
              "0 0 20px oklch(0.72 0.20 40 / 30%), inset 0 1px 0 oklch(1 0 0 / 15%)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow =
              "0 0 30px oklch(0.72 0.20 40 / 50%), inset 0 1px 0 oklch(1 0 0 / 20%)";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow =
              "0 0 20px oklch(0.72 0.20 40 / 30%), inset 0 1px 0 oklch(1 0 0 / 15%)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <span className="flex items-center justify-center gap-2">
            <Plus className="size-4" />
            new session
          </span>
          {/* Shimmer sweep on hover */}
          <span
            className="pointer-events-none absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-[100%]"
            aria-hidden
          />
        </button>
      </div>

      {/* ── Sessions ── */}
      <div className="px-3 pb-2">
        <div
          className="mb-2 flex items-center gap-1.5 px-1 font-mono text-[0.60rem] uppercase tracking-[0.20em]"
          style={{ color: "oklch(0.78 0.18 200 / 55%)" }}
        >
          <ChevronRight className="size-3" />
          sessions
        </div>
        <div className="flex flex-col gap-1">
          {threads.map((t) => (
            <div
              key={t.id}
              className={cn(
                "group flex items-center gap-2 rounded-lg px-2.5 py-2 transition-all duration-250",
                deletingId === t.id && "scale-95 opacity-0",
                t.id === activeId
                  ? "glass-card neon-border-amber"
                  : "hover:glass-card",
              )}
              style={
                t.id === activeId
                  ? {
                      background: "oklch(0.20 0.025 268 / 80%)",
                    }
                  : {}
              }
            >
              <button
                onClick={() => onSelect(t.id)}
                className="flex min-w-0 flex-1 items-center gap-2 text-left"
              >
                <MessageSquare
                  className={cn(
                    "size-3.5 shrink-0 transition-colors",
                    t.id === activeId
                      ? "text-ember"
                      : "text-muted-foreground group-hover:text-cyan-glow",
                  )}
                  style={
                    t.id !== activeId
                      ? {}
                      : { filter: "drop-shadow(0 0 4px oklch(0.72 0.20 40))" }
                  }
                />
                <span
                  className={cn(
                    "truncate font-mono text-[0.78rem] transition-colors",
                    t.id === activeId
                      ? "text-foreground"
                      : "text-muted-foreground group-hover:text-foreground",
                  )}
                >
                  {t.title}
                </span>
              </button>
              <button
                onClick={() => handleDelete(t.id)}
                className="opacity-0 transition-all duration-200 group-hover:opacity-100 hover:text-red-400"
                aria-label="Delete session"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Topics ── */}
      <div className="px-3 pb-4 pt-2">
        <div
          className="mb-2 flex items-center gap-1.5 px-1 font-mono text-[0.60rem] uppercase tracking-[0.20em]"
          style={{ color: "oklch(0.78 0.18 200 / 55%)" }}
        >
          <ChevronRight className="size-3" />
          topics
        </div>
        <div className="flex flex-wrap gap-1.5">
          {TOPICS.map((topic, i) => (
            <span
              key={topic}
              className="cursor-default rounded-md px-2 py-1 font-mono text-[0.62rem] transition-all duration-200"
              style={{
                background: "oklch(0.18 0.020 268 / 60%)",
                border: `1px solid oklch(${i % 3 === 0 ? "0.72 0.20 40" : i % 3 === 1 ? "0.78 0.18 200" : "0.62 0.25 290"} / 25%)`,
                color: "oklch(0.72 0.010 268)",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                const colors = [
                  "oklch(0.72 0.20 40)",
                  "oklch(0.78 0.18 200)",
                  "oklch(0.62 0.25 290)",
                ];
                const c = colors[i % 3];
                e.currentTarget.style.color = c;
                e.currentTarget.style.borderColor = `${c.slice(0, -1)} / 60%)`.replace(
                  "oklch(",
                  "oklch(",
                );
                e.currentTarget.style.transform =
                  "translateY(-2px) scale(1.05)";
                e.currentTarget.style.boxShadow = `0 4px 12px ${c.slice(0, -1)} / 25%)`.replace(
                  "oklch(",
                  "oklch(",
                );
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "oklch(0.72 0.010 268)";
                e.currentTarget.style.borderColor = `oklch(${i % 3 === 0 ? "0.72 0.20 40" : i % 3 === 1 ? "0.78 0.18 200" : "0.62 0.25 290"} / 25%)`;
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {topic}
            </span>
          ))}
        </div>
      </div>

      {/* ── Footer status ── */}
      <div
        className="mt-auto px-4 py-3"
        style={{ borderTop: "1px solid oklch(0.25 0.020 268 / 40%)" }}
      >
        {/* Holographic status badge */}
        <div className="holo-badge flex items-center gap-2.5 rounded-lg px-3 py-2">
          <span
            className="relative inline-flex size-2 rounded-full bg-emerald-400"
            style={{ boxShadow: "0 0 8px #34d399, 0 0 16px #34d39966" }}
          >
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          </span>
          <div className="flex flex-col">
            <span className="font-mono text-[0.62rem] font-semibold text-foreground">
              AI CODING LAB
            </span>
            <span
              className="font-mono text-[0.55rem] uppercase tracking-[0.18em] stream-pulse"
              style={{ color: "oklch(0.72 0.20 40)" }}
            >
              gemini · online
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ChatSurface — main chat area
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function ChatSurface({
  threadId,
  threadTitle,
  onFirstMessage,
}: {
  threadId: string;
  threadTitle: string;
  onFirstMessage: (text: string) => void;
}) {
  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat" }),
    [],
  );
  const { messages, sendMessage, status, stop, error } = useChat({
    id: threadId,
    transport,
  });

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const isEmpty = messages.length === 0;
  const isBusy = status === "submitted" || status === "streaming";

  useEffect(() => {
    textareaRef.current?.focus();
  }, [status, threadId]);

  const submit = async (text: string) => {
    const value = text.trim();
    if (!value || isBusy) return;
    if (isEmpty) onFirstMessage(value);
    setInput("");
    setIsTyping(false);
    await sendMessage({ text: value });
  };

  return (
    <>
      {/* ── Top bar — cyberpunk IDE tab strip ── */}
      <header
        className="sticky top-0 z-20 flex h-12 items-center"
        style={{
          background: "oklch(0.10 0.015 268 / 85%)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid oklch(0.30 0.022 268 / 50%)",
          boxShadow:
            "0 1px 0 oklch(0.78 0.18 200 / 8%), 0 4px 20px oklch(0 0 0 / 30%)",
        }}
      >
        {/* Macos-style traffic lights */}
        <div className="flex h-full items-center gap-1.5 pl-4">
          <span
            className="size-2.5 rounded-full transition-opacity hover:opacity-80"
            style={{ background: "oklch(0.65 0.22 25)" }}
          />
          <span
            className="size-2.5 rounded-full transition-opacity hover:opacity-80"
            style={{ background: "oklch(0.75 0.16 80)" }}
          />
          <span
            className="size-2.5 rounded-full transition-opacity hover:opacity-80"
            style={{ background: "oklch(0.65 0.18 145)" }}
          />
        </div>

        {/* Tab label */}
        <div
          className="ml-3 flex h-full items-center gap-2 px-4 font-mono text-[0.78rem]"
          style={{
            background: "oklch(0.16 0.020 268 / 70%)",
            borderLeft: "1px solid oklch(0.30 0.022 268 / 40%)",
            borderRight: "1px solid oklch(0.30 0.022 268 / 40%)",
          }}
        >
          <Terminal
            className="size-3.5"
            style={{ color: "oklch(0.72 0.20 40)" }}
          />
          <span className="max-w-[260px] truncate text-foreground/90">
            {threadTitle}.chat
          </span>
          <span className="text-muted-foreground">—</span>
          <span
            className="text-cyan"
            style={{ fontSize: "0.70rem" }}
          >
            algomate
          </span>
        </div>

        {/* Right meta */}
        <div className="ml-auto flex items-center gap-4 pr-4 font-mono text-[0.68rem] text-muted-foreground">
          <span className="hidden sm:inline">UTF-8</span>
          <span className="hidden sm:inline">LF</span>
          <span
            className={cn(
              "flex items-center gap-1.5",
              isBusy ? "text-ember stream-pulse" : "text-muted-foreground",
            )}
          >
            <Zap
              className="size-3"
              style={
                isBusy
                  ? { filter: "drop-shadow(0 0 4px oklch(0.72 0.20 40))" }
                  : {}
              }
            />
            {isBusy ? "streaming" : "ready"}
          </span>
        </div>
      </header>

      {/* ── Body ── */}
      <main className="flex flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pb-4 pt-6">
          {isEmpty ? (
            <EmptyState onPick={submit} />
          ) : (
            <Conversation className="flex-1">
              <ConversationContent className="pb-6">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}

                {/* Thinking indicator */}
                {status === "submitted" && (
                  <div
                    className="flex items-center gap-2.5 rounded-xl px-4 py-3 font-mono text-sm"
                    style={{
                      background: "oklch(0.16 0.020 268 / 60%)",
                      border: "1px solid oklch(0.30 0.022 268 / 40%)",
                      backdropFilter: "blur(12px)",
                    }}
                  >
                    <span
                      className="text-ember"
                      style={{
                        filter: "drop-shadow(0 0 6px oklch(0.72 0.20 40))",
                      }}
                    >
                      ◆
                    </span>
                    <Shimmer>synthesizing response…</Shimmer>
                    <span className="ml-auto flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="inline-block size-1.5 rounded-full bg-ember"
                          style={{
                            animation: `breatheNeon 1.2s ease-in-out ${i * 0.2}s infinite`,
                          }}
                        />
                      ))}
                    </span>
                  </div>
                )}

                {/* Error state */}
                {error && (
                  <div
                    className="mt-3 rounded-xl px-4 py-3 font-mono text-sm"
                    style={{
                      background: "oklch(0.62 0.24 25 / 12%)",
                      border: "1px solid oklch(0.62 0.24 25 / 40%)",
                      boxShadow: "0 0 20px oklch(0.62 0.24 25 / 15%)",
                    }}
                  >
                    <span style={{ color: "oklch(0.72 0.22 25)" }}>
                      error:
                    </span>{" "}
                    {error.message}
                  </div>
                )}
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>
          )}

          {/* ── Composer — 3D floating command center ── */}
          <div className="mt-4">
            <PromptInput
              onSubmit={(msg) => {
                void submit(msg.text ?? input);
              }}
              className={cn(
                "rounded-2xl transition-all duration-300",
                isTyping ? "glass-input" : "glass-input",
              )}
              style={{
                boxShadow: isTyping
                  ? "0 0 0 2px oklch(0.78 0.18 200 / 25%), 0 0 40px oklch(0.78 0.18 200 / 12%), 0 20px 60px oklch(0 0 0 / 40%)"
                  : "0 0 0 1px oklch(0.72 0.20 40 / 15%), 0 20px 60px oklch(0 0 0 / 40%)",
                borderRadius: "16px",
              }}
            >
              <div className="flex items-start gap-2 px-4 pt-3.5">
                <span
                  className="mt-2 select-none font-mono text-sm font-bold"
                  style={{
                    color: isTyping
                      ? "oklch(0.78 0.18 200)"
                      : "oklch(0.72 0.20 40)",
                    textShadow: isTyping
                      ? "0 0 12px oklch(0.78 0.18 200)"
                      : "0 0 12px oklch(0.72 0.20 40)",
                    transition: "all 0.3s ease",
                  }}
                >
                  &gt;_
                </span>
                <PromptInputTextarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    setIsTyping(e.target.value.length > 0);
                  }}
                  placeholder="ask about any DSA topic — algorithm, complexity, problem…"
                  className="min-h-[56px] border-0 bg-transparent p-0 font-mono text-sm placeholder:text-muted-foreground/50 focus-visible:ring-0"
                />
              </div>

              <PromptInputFooter
                className="justify-between px-4 py-2.5"
                style={{ borderTop: "1px solid oklch(0.28 0.020 268 / 40%)" }}
              >
                <span className="font-mono text-[0.65rem] text-muted-foreground/70">
                  <kbd className="rounded border border-border/50 bg-background/60 px-1.5 py-0.5">
                    Enter
                  </kbd>{" "}
                  send
                  <span className="mx-2">·</span>
                  <kbd className="rounded border border-border/50 bg-background/60 px-1.5 py-0.5">
                    Shift
                  </kbd>
                  +
                  <kbd className="rounded border border-border/50 bg-background/60 px-1.5 py-0.5">
                    ↵
                  </kbd>{" "}
                  newline
                </span>

                <PromptInputSubmit
                  status={status}
                  onStop={stop}
                  disabled={!isBusy && input.trim().length === 0}
                  className="rounded-xl transition-all duration-200 active:scale-95"
                  style={{
                    background: isBusy
                      ? "oklch(0.62 0.24 25 / 80%)"
                      : "linear-gradient(135deg, oklch(0.72 0.20 40) 0%, oklch(0.62 0.25 290 / 80%) 100%)",
                    boxShadow: isBusy
                      ? "0 0 15px oklch(0.62 0.24 25 / 40%)"
                      : "0 0 15px oklch(0.72 0.20 40 / 40%)",
                    color: "white",
                  }}
                >
                  {isBusy ? (
                    <Square className="size-4" />
                  ) : (
                    <Send className="size-4" />
                  )}
                </PromptInputSubmit>
              </PromptInputFooter>
            </PromptInput>
          </div>
        </div>

        {/* ── Status bar ── */}
        <footer
          style={{
            borderTop: "1px solid oklch(0.25 0.020 268 / 40%)",
            background: "oklch(0.08 0.012 268 / 90%)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="mx-auto flex h-7 w-full items-center justify-between px-4 font-mono text-[0.65rem] text-muted-foreground">
            <div className="flex items-center gap-3">
              <span
                className="flex items-center gap-1.5"
                style={{ color: "oklch(0.72 0.20 40)" }}
              >
                <span
                  className="inline-block size-1.5 rounded-full"
                  style={{
                    background: "oklch(0.72 0.20 40)",
                    boxShadow: "0 0 6px oklch(0.72 0.20 40)",
                  }}
                />
                algomate
              </span>
              <span>main</span>
              <span>{messages.length} msg</span>
            </div>
            <div className="hidden items-center gap-3 sm:flex">
              <span>Ln {messages.length + 1}, Col 1</span>
              <span>Spaces: 2</span>
              <span
                className={cn(isBusy && "text-ember stream-pulse")}
              >
                {isBusy ? "streaming" : "idle"}
              </span>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ChatMessage — individual message card
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function ChatMessage({ message }: { message: UIMessage }) {
  const text = message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("");

  if (message.role === "user") {
    return (
      <Message from="user">
        <MessageContent
          variant="user"
          className="border-0"
          style={{
            background: "oklch(0.16 0.022 268 / 75%)",
            backdropFilter: "blur(16px)",
            border: "1px solid oklch(0.78 0.18 200 / 35%)",
            boxShadow:
              "0 0 0 1px oklch(0.78 0.18 200 / 10%), 0 0 20px oklch(0.78 0.18 200 / 12%), 0 10px 30px oklch(0 0 0 / 30%)",
          }}
        >
          <div className="flex items-start gap-2">
            <span
              className="mt-0.5 select-none font-mono text-xs font-bold"
              style={{
                color: "oklch(0.78 0.18 200)",
                textShadow: "0 0 10px oklch(0.78 0.18 200 / 60%)",
              }}
            >
              you@dsa:~$
            </span>
            <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-foreground/95">
              {text}
            </div>
          </div>
        </MessageContent>
      </Message>
    );
  }

  return (
    <Message from="assistant">
      <MessageContent
        className="bg-transparent p-0 shadow-none"
        style={{ border: "none", backdropFilter: "none" }}
      >
        {/* Assistant label */}
        <div
          className="mb-2 flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.16em]"
          style={{ color: "oklch(0.72 0.20 40 / 70%)" }}
        >
          <span
            style={{
              color: "oklch(0.72 0.20 40)",
              textShadow: "0 0 8px oklch(0.72 0.20 40 / 60%)",
            }}
          >
            ◆
          </span>
          algomate
        </div>

        {/* Response content with scanline code blocks */}
        <MessageResponse
          className={cn(
            "prose prose-invert prose-sm max-w-none",
            "prose-headings:font-mono prose-headings:tracking-tight",
            "prose-p:leading-relaxed",
            "prose-code:font-mono prose-code:text-[0.85em]",
            "prose-a:text-ember",
            "prose-strong:text-foreground",
            // Code blocks styled as 3D terminal windows
            "[&_pre]:code-scanline",
            "[&_pre]:rounded-xl [&_pre]:border",
            "[&_code]:text-cyan",
          )}
          style={
            {
              "--tw-prose-pre-bg": "oklch(0.10 0.015 268)",
              "--tw-prose-pre-border": "oklch(0.30 0.022 268 / 50%)",
            } as React.CSSProperties
          }
        >
          {text}
        </MessageResponse>
      </MessageContent>
    </Message>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   EmptyState — holographic welcome screen
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function EmptyState({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
      {/* 3D floating logo */}
      <div className="float-anim relative mb-8">
        {/* Outer orbit ring */}
        <div
          className="absolute -inset-6 rounded-full"
          style={{
            border: "1px solid oklch(0.72 0.20 40 / 20%)",
            boxShadow: "0 0 20px oklch(0.72 0.20 40 / 10%)",
          }}
        />
        {/* Inner orbit ring */}
        <div
          className="absolute -inset-3 rounded-full"
          style={{
            border: "1px solid oklch(0.78 0.18 200 / 25%)",
            boxShadow: "0 0 12px oklch(0.78 0.18 200 / 15%)",
          }}
        />
        {/* Logo core */}
        <div
          className="relative grid size-20 place-items-center rounded-2xl pulse-amber"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.72 0.20 40) 0%, oklch(0.62 0.25 290) 100%)",
            boxShadow:
              "0 0 40px oklch(0.72 0.20 40 / 40%), 0 0 80px oklch(0.62 0.25 290 / 20%), inset 0 1px 0 oklch(1 0 0 / 20%)",
          }}
        >
          <Terminal
            className="size-10 text-white"
            strokeWidth={2}
            style={{ filter: "drop-shadow(0 2px 8px oklch(0 0 0 / 40%))" }}
          />
        </div>
      </div>

      {/* Title */}
      <h1 className="font-mono text-4xl font-bold tracking-tight sm:text-5xl">
        <span className="text-foreground">algo</span>
        <span
          className="text-cyan"
          style={{ textShadow: "0 0 30px oklch(0.78 0.18 200 / 60%)" }}
        >
          mate
        </span>
        <span
          className="text-ember"
          style={{ textShadow: "0 0 20px oklch(0.72 0.20 40 / 60%)" }}
        >
          .repl
        </span>
        <span className="caret" />
      </h1>

      {/* Subtitle */}
      <p
        className="mt-4 max-w-md font-mono text-sm leading-relaxed"
        style={{ color: "oklch(0.62 0.012 268)" }}
      >
        <span style={{ color: "oklch(0.78 0.18 200 / 70%)" }}>{"// "}</span>
        your futuristic DSA copilot. drop a problem, ask about complexity, or
        riff on data structures.
      </p>

      {/* Quick prompt cards */}
      <div className="mt-10 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
        {QUICK_PROMPTS.map((prompt, i) => {
          const glowColors = {
            amber: "oklch(0.72 0.20 40)",
            cyan: "oklch(0.78 0.18 200)",
            purple: "oklch(0.62 0.25 290)",
          };
          const borderColors = {
            amber: "oklch(0.72 0.20 40 / 30%)",
            cyan: "oklch(0.78 0.18 200 / 30%)",
            purple: "oklch(0.62 0.25 290 / 30%)",
          };
          const c = prompt.color as keyof typeof glowColors;
          return (
            <button
              key={prompt.label}
              onClick={() => onPick(prompt.label)}
              className="group relative overflow-hidden rounded-xl text-left transition-all duration-300"
              style={{
                background: "oklch(0.14 0.018 268 / 70%)",
                border: `1px solid ${borderColors[c]}`,
                backdropFilter: "blur(12px)",
                padding: "12px 14px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = `0 8px 30px ${glowColors[c].replace(")", " / 20%)")}, 0 0 0 1px ${borderColors[c]}`;
                e.currentTarget.style.borderColor = glowColors[c].replace(
                  ")",
                  " / 50%)",
                );
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = borderColors[c];
              }}
            >
              {/* Icon & tag row */}
              <div className="flex items-center justify-between">
                <span
                  className="flex items-center gap-1.5 font-mono text-[0.62rem] uppercase tracking-[0.18em]"
                  style={{ color: glowColors[c], opacity: 0.8 }}
                >
                  {prompt.icon}#{prompt.tag}
                </span>
                <span
                  className="font-mono text-[0.62rem] uppercase tracking-[0.14em] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  style={{ color: glowColors[c] }}
                >
                  run →
                </span>
              </div>

              {/* Label */}
              <p className="mt-2 font-mono text-sm text-foreground/85 leading-snug">
                {prompt.label}
              </p>

              {/* Shimmer effect on hover */}
              <span
                className="pointer-events-none absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent to-transparent transition-transform duration-700 group-hover:translate-x-[100%]"
                style={{
                  background: `linear-gradient(90deg, transparent 0%, ${glowColors[c].replace(")", " / 6%)")} 50%, transparent 100%)`,
                }}
                aria-hidden
              />
            </button>
          );
        })}
      </div>

      {/* Tip */}
      <div
        className="mt-8 flex items-center gap-2 rounded-lg px-3 py-2 font-mono text-[0.65rem]"
        style={{
          background: "oklch(0.14 0.018 268 / 60%)",
          border: "1px solid oklch(0.30 0.022 268 / 40%)",
          color: "oklch(0.62 0.012 268)",
        }}
      >
        <span
          className="rounded px-1.5 py-0.5 font-semibold"
          style={{
            background: "oklch(0.72 0.20 40 / 15%)",
            color: "oklch(0.72 0.20 40)",
            border: "1px solid oklch(0.72 0.20 40 / 30%)",
          }}
        >
          tip
        </span>
        paste raw problem statements — I'll break them down step-by-step.
      </div>
    </div>
  );
}
