import { useChat } from "@ai-sdk/react";
import { createFileRoute } from "@tanstack/react-router";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronRight,
  MessageSquare,
  Plus,
  Send,
  Square,
  Terminal,
  Trash2,
  Zap,
  Menu,
} from "lucide-react";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DsaBackground } from "@/components/dsa-background";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: ChatPage,
});

type Thread = {
  id: string;
  title: string;
  createdAt: number;
};

const QUICK_PROMPTS = [
  { label: "Analyze time/space complexity of this code", tag: "complexity" },
  { label: "Solve Two Sum with O(n) approach", tag: "arrays" },
  { label: "Explain Dijkstra's algorithm step by step", tag: "graphs" },
  { label: "When to use DP vs Greedy? Trade-offs", tag: "dp" },
];

const TOPICS = [
  "Arrays & Hashing",
  "Strings",
  "Two Pointers",
  "Sliding Window",
  "Binary Search",
  "Linked List",
  "Stacks & Queues",
  "Trees & BST",
  "Heaps / Priority Queue",
  "Graphs (BFS/DFS)",
  "Dynamic Programming",
  "Greedy",
  "Backtracking",
  "Tries",
  "Bit Manipulation",
];

// Session persistence keys
const SESSIONS_STORAGE_KEY = "algomate-sessions";
const MESSAGES_STORAGE_KEY = "algomate-messages";
// Maximum stored messages per session (avoid unbounded growth)
const MAX_STORED_MESSAGES = 200;

type StoredMessage = {
  id: string;
  role: string;
  parts: { type: string; text?: string; [key: string]: unknown }[];
};

function loadSessions(): Thread[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    // Validate each thread has required fields
    const valid = parsed.filter(
      (t): t is Thread =>
        t &&
        typeof t.id === "string" &&
        typeof t.title === "string" &&
        typeof t.createdAt === "number"
    );
    // De-dupe ids (guard against malformed/corrupt data)
    const seen = new Set<string>();
    return valid.filter((t) => (seen.has(t.id) ? false : (seen.add(t.id), true)));
  } catch {
    return [];
  }
}

function saveSessions(threads: Thread[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(threads));
  } catch {
    // Ignore quota/storage errors
  }
}

function loadMessages(threadId: string): UIMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(MESSAGES_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!parsed || typeof parsed !== "object") return [];
    const arr = parsed[threadId];
    if (!Array.isArray(arr)) return [];
    // Validate basic shape
    return arr
      .filter(
        (m): m is UIMessage =>
          m &&
          typeof m.id === "string" &&
          typeof m.role === "string" &&
          Array.isArray(m.parts)
      )
      .slice(-MAX_STORED_MESSAGES) as UIMessage[];
  } catch {
    return [];
  }
}

function saveMessages(threadId: string, messages: UIMessage[]) {
  if (typeof window === "undefined") return;
  try {
    const stored = localStorage.getItem(MESSAGES_STORAGE_KEY);
    const all: Record<string, UIMessage[]> = stored ? JSON.parse(stored) : {};
    all[threadId] = messages.slice(-MAX_STORED_MESSAGES);
    localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(all));
  } catch {
    // Ignore quota/storage errors
  }
}

function ChatPage() {
  const [threads, setThreads] = useState<Thread[]>(() => {
    const loaded = loadSessions();
    return loaded.length > 0
      ? loaded
      : [{ id: crypto.randomUUID(), title: "New session", createdAt: Date.now() }];
  });
  const [activeId, setActiveId] = useState<string>(() => threads[0]?.id ?? "");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  // Ref to the current ChatSurface submit handler so topic chips can submit
  const submitRef = useRef<(text: string) => void>(() => {});

  // Persist sessions to localStorage
  useEffect(() => {
    saveSessions(threads);
  }, [threads]);

  const activeThread = threads.find((t) => t.id === activeId) ?? threads[0];

  const newChat = () => {
    const t = { id: crypto.randomUUID(), title: "New session", createdAt: Date.now() };
    setThreads((prev) => [t, ...prev]);
    setActiveId(t.id);
    setMobileSidebarOpen(false);
  };

  const removeChat = (id: string) => {
    setThreads((prev) => {
      const next = prev.filter((t) => t.id !== id);
      if (next.length === 0) {
        const t = { id: crypto.randomUUID(), title: "New session", createdAt: Date.now() };
        setActiveId(t.id);
        return [t];
      }
      if (id === activeId) setActiveId(next[0].id);
      return next;
    });
    // Also remove persisted messages for this thread
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(MESSAGES_STORAGE_KEY);
        if (stored) {
          const all = JSON.parse(stored);
          if (all && typeof all === "object" && id in all) {
            delete all[id];
            localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(all));
          }
        }
      } catch {
        // Ignore
      }
    }
  };

  const renameThread = (id: string, title: string) => {
    setThreads((prev) => prev.map((t) => (t.id === id ? { ...t, title } : t)));
  };

  const handleTopicSelect = (text: string) => {
    submitRef.current(text);
    setMobileSidebarOpen(false);
  };

  const sidebarProps = {
    threads,
    activeId,
    onSelect: (id: string) => {
      setActiveId(id);
      setMobileSidebarOpen(false);
    },
    onNew: newChat,
    onDelete: removeChat,
    onTopicSelect: handleTopicSelect,
  };

  return (
    <div className="flex min-h-screen w-full bg-ide-grid text-foreground">
      <DsaBackground />
      {/* Desktop Sidebar */}
      <aside className="hidden w-72 shrink-0 flex-col border-r border-border/60 bg-sidebar md:flex">
        <Sidebar {...sidebarProps} />
      </aside>

      {/* Mobile sidebar trigger */}
      <div className="fixed top-3 left-3 z-50 md:hidden">
        <Button
          onClick={() => setMobileSidebarOpen(true)}
          variant="ghost"
          size="icon"
          className="rounded-md bg-sidebar/80 backdrop-blur"
          aria-label="Open sidebar"
        >
          <Menu className="size-5 text-foreground" />
        </Button>
      </div>

      {/* Mobile Sidebar Sheet */}
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="w-72 bg-sidebar p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Sidebar</SheetTitle>
          </SheetHeader>
          <Sidebar {...sidebarProps} />
        </SheetContent>
      </Sheet>

      <div className="flex min-h-screen flex-1 flex-col">
        <ChatSurface
          key={activeThread.id}
          threadId={activeThread.id}
          threadTitle={activeThread.title}
          onFirstMessage={(text) => renameThread(activeThread.id, text.slice(0, 40))}
          registerSubmit={(fn) => {
            submitRef.current = fn;
          }}
        />
      </div>
    </div>
  );
}

function Sidebar({
  threads,
  activeId,
  onSelect,
  onNew,
  onDelete,
  onTopicSelect,
}: {
  threads: Thread[];
  activeId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onTopicSelect: (text: string) => void;
}) {
  return (
    <aside className="w-72 shrink-0 flex-col border-r border-border/60 bg-sidebar h-full">
      {/* Brand */}
      <div className="flex h-14 items-center gap-2.5 border-b border-border/60 px-4">
        <div className="grid size-8 place-items-center rounded-md bg-ember text-primary-foreground ring-ember">
          <Terminal className="size-4" strokeWidth={2.5} />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-mono text-sm font-semibold tracking-tight">
            algomate<span className="text-ember">_</span>
          </span>
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
            dsa · repl
          </span>
        </div>
      </div>

      {/* New chat */}
      <div className="p-3">
        <Button
          onClick={onNew}
          className="w-full justify-start gap-2 bg-ember font-mono text-sm font-medium text-primary-foreground hover:bg-ember-glow"
        >
          <Plus className="size-4" />
          new session
        </Button>
      </div>

      {/* Sessions */}
      <div className="px-3 pb-2">
        <div className="mb-1.5 flex items-center gap-1.5 px-1 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
          <ChevronRight className="size-3" /> sessions
        </div>
        <div className="flex flex-col gap-0.5">
          {threads.map((t) => (
            <div
              key={t.id}
              className={cn(
                "group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition",
                t.id === activeId
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
            >
              <button
                onClick={() => onSelect(t.id)}
                className="flex min-w-0 flex-1 items-center gap-2 text-left"
              >
                <MessageSquare
                  className={cn(
                    "size-3.5 shrink-0",
                    t.id === activeId ? "text-ember" : "text-muted-foreground",
                  )}
                />
                <span className="truncate font-mono text-[0.8rem]">{t.title}</span>
              </button>
              <button
                onClick={() => onDelete(t.id)}
                className="opacity-0 transition group-hover:opacity-100 hover:text-destructive"
                aria-label="Delete session"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Topics */}
      <div className="px-3 pb-4 pt-2">
        <div className="mb-1.5 flex items-center gap-1.5 px-1 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
          <ChevronRight className="size-3" /> topics
        </div>
        <div className="flex flex-wrap gap-1">
          {TOPICS.map((topic) => (
            <button
              key={topic}
              onClick={() => onTopicSelect(`Explain ${topic} with an example and complexity analysis.`)}
              className="rounded-sm border border-border/60 bg-surface/60 px-1.5 py-0.5 font-mono text-[0.68rem] text-muted-foreground hover:border-ember/60 hover:bg-surface hover:text-foreground transition cursor-pointer"
              type="button"
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Footer status */}
      <div className="mt-auto border-t border-border/60 px-4 py-2.5">
        <div className="flex items-center gap-2 font-mono text-[0.7rem] text-muted-foreground">
          <span className="inline-block size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_theme(colors.emerald.400)]" />
          gemma-4 (openrouter) · ready
        </div>
      </div>
    </aside>
  );
}

function ChatSurface({
  threadId,
  threadTitle,
  onFirstMessage,
  registerSubmit,
}: {
  threadId: string;
  threadTitle: string;
  onFirstMessage: (text: string) => void;
  registerSubmit: (fn: (text: string) => void) => void;
}) {
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);
  const { messages, sendMessage, status, stop, error } = useChat({
    id: threadId,
    transport,
  });

  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const isEmpty = messages.length === 0;
  const isBusy = status === "submitted" || status === "streaming";

  // Load persisted messages for this thread on mount
  useEffect(() => {
    const stored = loadMessages(threadId);
    if (stored.length > 0) {
      // The useChat transport will hydrate from the server using the threadId,
      // but we can also preload locally if needed. For now, just mark hydrated.
    }
    setHydrated(true);
  }, [threadId]);

  // Persist messages whenever they change
  useEffect(() => {
    if (hydrated && messages.length > 0) {
      saveMessages(threadId, messages);
    }
  }, [messages, threadId, hydrated]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, [status, threadId]);

  const submit = async (text: string) => {
    const value = text.trim();
    if (!value || isBusy) return;
    if (isEmpty) onFirstMessage(value);
    setInput("");
    await sendMessage({ text: value });
  };

  // Register submit with parent for topic chips
  useEffect(() => {
    registerSubmit(submit);
  }, [registerSubmit, submit]);

  return (
    <>
      {/* Top bar — IDE tab strip */}
      <header className="sticky top-0 z-20 flex h-11 items-center border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="flex h-full items-center gap-1 pl-3">
          <span className="size-2.5 rounded-full bg-red-500/70" />
          <span className="size-2.5 rounded-full bg-yellow-500/70" />
          <span className="size-2.5 rounded-full bg-emerald-500/70" />
        </div>
        <div className="ml-4 flex h-full items-center gap-2 border-x border-border/60 bg-surface/60 px-3 font-mono text-[0.78rem]">
          <Terminal className="size-3.5 text-ember" />
          <span className="max-w-[280px] truncate">{threadTitle}.chat</span>
          <span className="text-muted-foreground">—</span>
          <span className="text-muted-foreground">algomate</span>
        </div>
        <div className="ml-auto flex items-center gap-3 pr-4 font-mono text-[0.7rem] text-muted-foreground">
          <span className="hidden sm:inline">UTF-8</span>
          <span className="hidden sm:inline">LF</span>
          <span className="flex items-center gap-1">
            <Zap className="size-3 text-ember" />
            streaming
          </span>
        </div>
      </header>

      {/* Body */}
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
                {status === "submitted" && (
                  <div className="flex items-center gap-2 px-1 pt-2 font-mono text-sm text-muted-foreground">
                    <span className="text-ember">$</span>
                    <Shimmer>compiling response…</Shimmer>
                  </div>
                )}
                {error && (
                  <div className="mt-3 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 font-mono text-sm text-destructive-foreground">
                    <span className="text-destructive">error:</span> {error.message}
                    <span className="ml-2 text-muted-foreground">— Try rephrasing or check your connection.</span>
                    <button
                      onClick={() => submit(input)}
                      disabled={isBusy || !input.trim()}
                      className="ml-3 text-xs underline hover:text-ember transition"
                      type="button"
                    >
                      Retry
                    </button>
                  </div>
                )}
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>
          )}

          {/* Composer */}
          <div className="mt-4">
            <PromptInput
              onSubmit={(msg) => {
                void submit(msg.text ?? input);
              }}
              className="rounded-lg border border-border/70 bg-surface/70 shadow-[0_0_0_1px_oklch(0.68_0.17_40/0.12),0_18px_50px_-20px_oklch(0_0_0/0.6)] backdrop-blur"
            >
              <div className="flex items-start gap-2 px-3 pt-3">
                <span className="mt-2 select-none font-mono text-sm font-semibold text-ember">
                  &gt;_
                </span>
                <PromptInputTextarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="ask about any DSA topic — algorithm, complexity, problem…"
                  className="min-h-[64px] border-0 bg-transparent p-0 font-mono text-sm placeholder:text-muted-foreground/60 focus-visible:ring-0"
                />
              </div>
              <PromptInputFooter className="justify-between border-t border-border/60 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[0.68rem] text-muted-foreground/80">
                    <kbd className="rounded border border-border/70 bg-background/70 px-1 py-0.5">
                      Enter
                    </kbd>{" "}
                    send
                    <span className="mx-2">·</span>
                    <kbd className="rounded border border-border/70 bg-background/70 px-1 py-0.5">
                      Shift
                    </kbd>
                    +
                    <kbd className="rounded border border-border/70 bg-background/70 px-1 py-0.5">
                      ↵
                    </kbd>{" "}
                    newline
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => submit("Analyze the time and space complexity of this algorithm with a step-by-step breakdown.")}
                    disabled={isBusy}
                    className="h-7 w-7 text-muted-foreground/80 hover:text-foreground hover:bg-accent transition-colors"
                    aria-label="Complexity checker shortcut"
                    title="Complexity Checker (Ctrl+Shift+C)"
                  >
                    <Zap className="size-3.5" />
                  </Button>
                </div>
                <PromptInputSubmit
                  status={status}
                  onStop={stop}
                  disabled={!isBusy && input.trim().length === 0}
                  className="bg-ember text-primary-foreground hover:bg-ember-glow"
                >
                  {isBusy ? <Square className="size-4" /> : <Send className="size-4" />}
                </PromptInputSubmit>
              </PromptInputFooter>
            </PromptInput>
          </div>
        </div>

        {/* Status bar */}
        <footer className="border-t border-border/60 bg-sidebar">
          <div className="mx-auto flex h-7 w-full items-center justify-between px-4 font-mono text-[0.68rem] text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-ember">
                <span className="inline-block size-1.5 rounded-full bg-ember" />
                algomate
              </span>
              <span>main</span>
              <span>{messages.length} msg</span>
            </div>
            <div className="hidden items-center gap-3 sm:flex">
              <span>Ln {messages.length + 1}, Col 1</span>
              <span>Spaces: 2</span>
              <span>{isBusy ? "streaming" : "idle"}</span>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}

function ChatMessage({ message }: { message: UIMessage }) {
  const text = message.parts.map((part) => (part.type === "text" ? part.text : "")).join("");

  if (message.role === "user") {
    return (
      <Message from="user">
        <MessageContent className="border border-ember/40 bg-ember/10 text-foreground shadow-[0_10px_30px_-18px_oklch(0.68_0.17_40/0.7)]">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 select-none font-mono text-xs font-semibold text-ember">
              you@dsa:~$
            </span>
            <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed">{text}</div>
          </div>
        </MessageContent>
      </Message>
    );
  }

  return (
    <Message from="assistant">
      <MessageContent className="bg-transparent p-0 shadow-none">
        <div className="mb-1 flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-muted-foreground">
          <span className="text-ember">◆</span> algomate
        </div>
        <MessageResponse className="prose prose-invert prose-sm max-w-none prose-headings:font-mono prose-headings:tracking-tight prose-p:leading-relaxed prose-code:font-mono prose-code:text-[0.85em] prose-code:text-ember prose-pre:border prose-pre:border-border/60 prose-pre:bg-[oklch(0.13_0.005_60)] prose-a:text-ember prose-strong:text-foreground">
          {text}
        </MessageResponse>
      </MessageContent>
    </Message>
  );
}

function EmptyState({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
      <div className="grid size-14 place-items-center rounded-xl bg-ember text-primary-foreground ring-ember">
        <Terminal className="size-7" strokeWidth={2.5} />
      </div>
      <h1 className="mt-6 font-mono text-3xl font-bold tracking-tight sm:text-4xl">
        algomate<span className="text-ember">.repl</span>
        <span className="caret" />
      </h1>
      <p className="mt-3 max-w-md font-mono text-sm text-muted-foreground">
        <span className="text-ember">// </span>a coder-friendly DSA copilot. drop a problem, ask
        about complexity, or riff on data structures.
      </p>

      <div className="mt-8 grid w-full max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2">
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt.label}
            onClick={() => onPick(prompt.label)}
            className="group relative overflow-hidden rounded-md border border-border/60 bg-surface/60 px-3 py-3 text-left transition hover:border-ember/60 hover:bg-surface"
          >
            <div className="flex items-center justify-between font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
              <span>#{prompt.tag}</span>
              <span className="text-ember opacity-0 transition group-hover:opacity-100">run →</span>
            </div>
            <p className="mt-1.5 font-mono text-sm text-foreground/90">{prompt.label}</p>
          </button>
        ))}
      </div>

      <div className="mt-8 flex items-center gap-2 font-mono text-[0.68rem] text-muted-foreground">
        <span className="rounded border border-border/60 bg-surface/60 px-1.5 py-0.5">tip</span>
        paste raw problem statements — I'll break them down step-by-step.
      </div>
    </div>
  );
}
