import { useChat } from "@ai-sdk/react";
import { createFileRoute } from "@tanstack/react-router";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Send, Square } from "lucide-react";

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
import { DsaBackground } from "@/components/dsa-background";
import logoUrl from "@/assets/algomate-logo.png";

export const Route = createFileRoute("/")({
  component: ChatPage,
});

const QUICK_PROMPTS = [
  "Explain quicksort with a dry-run",
  "Two Sum in O(n) — walk me through it",
  "When should I reach for a heap vs a BST?",
  "Introduce dynamic programming with an example",
];

function ChatPage() {
  const [chatKey, setChatKey] = useState(0);
  return (
    <div className="relative flex min-h-screen flex-col text-foreground">
      <DsaBackground />
      <ChatSurface key={chatKey} onNewChat={() => setChatKey((k) => k + 1)} />
    </div>
  );
}

function ChatSurface({ onNewChat }: { onNewChat: () => void }) {
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);
  const { messages, sendMessage, status, stop, error } = useChat({
    transport,
  });

  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const isEmpty = messages.length === 0;
  const isBusy = status === "submitted" || status === "streaming";

  // Keep composer focused on load, after send, and after stream ends.
  useEffect(() => {
    textareaRef.current?.focus();
  }, [status]);

  const submit = async (text: string) => {
    const value = text.trim();
    if (!value || isBusy) return;
    setInput("");
    await sendMessage({ text: value });
  };

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/70 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <img
              src={logoUrl}
              alt=""
              width={28}
              height={28}
              className="h-7 w-7 drop-shadow-[0_0_10px_oklch(0.68_0.22_275/0.6)]"
            />
            <div className="flex flex-col leading-tight">
              <span className="font-mono text-sm font-semibold tracking-tight text-glow-indigo">
                AlgoMate
              </span>
              <span className="text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
                DSA copilot
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onNewChat}
            className="gap-1.5 border-border/60 bg-surface/60 text-foreground hover:bg-surface"
          >
            <Plus className="size-4" />
            New chat
          </Button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pb-6 pt-4">
        {isEmpty ? (
          <EmptyState onPick={submit} />
        ) : (
          <Conversation className="flex-1">
            <ConversationContent className="pb-6">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {status === "submitted" && (
                <div className="flex items-center gap-2 px-1 pt-2 text-sm text-muted-foreground">
                  <Shimmer>Thinking through the problem…</Shimmer>
                </div>
              )}
              {error && (
                <div className="mt-3 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive-foreground">
                  Something went wrong: {error.message}
                </div>
              )}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>
        )}

        <div className="mt-4">
          <PromptInput
            onSubmit={(msg) => {
              void submit(msg.text ?? input);
            }}
            className="rounded-2xl border border-border/70 bg-surface/70 shadow-[0_0_0_1px_oklch(0.58_0.24_275/0.15),0_20px_60px_-20px_oklch(0.58_0.24_275/0.35)] backdrop-blur"
          >
            <PromptInputTextarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about any DSA topic — algorithm, complexity, problem…"
              className="min-h-[64px] font-mono text-sm placeholder:text-muted-foreground/70"
            />
            <PromptInputFooter className="justify-between px-3 pb-2">
              <span className="font-mono text-[0.7rem] text-muted-foreground/70">
                Enter to send · Shift+Enter for newline
              </span>
              <PromptInputSubmit
                status={status}
                onStop={stop}
                disabled={!isBusy && input.trim().length === 0}
              >
                {isBusy ? <Square className="size-4" /> : <Send className="size-4" />}
              </PromptInputSubmit>
            </PromptInputFooter>
          </PromptInput>
        </div>
      </main>
    </>
  );
}

function ChatMessage({ message }: { message: UIMessage }) {
  const text = message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("");

  if (message.role === "user") {
    return (
      <Message from="user">
        <MessageContent className="bg-primary text-primary-foreground shadow-[0_10px_30px_-15px_oklch(0.58_0.24_275/0.9)]">
          <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
            {text}
          </div>
        </MessageContent>
      </Message>
    );
  }

  return (
    <Message from="assistant">
      <MessageContent className="bg-transparent p-0 shadow-none">
        <MessageResponse className="prose prose-invert prose-sm max-w-none prose-pre:bg-[oklch(0.11_0.05_275)] prose-pre:border prose-pre:border-border/60 prose-code:font-mono prose-code:text-[0.85em] prose-headings:font-mono prose-headings:tracking-tight prose-a:text-indigo-glow prose-strong:text-foreground">
          {text}
        </MessageResponse>
      </MessageContent>
    </Message>
  );
}

function EmptyState({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
      <img
        src={logoUrl}
        alt=""
        width={80}
        height={80}
        className="h-20 w-20 drop-shadow-[0_0_40px_oklch(0.68_0.22_275/0.5)]"
      />
      <h1 className="mt-6 font-mono text-3xl font-semibold tracking-tight text-glow-indigo sm:text-4xl">
        AlgoMate
      </h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Your DSA pair-programmer. Ask about algorithms, complexity, or paste a problem —
        I'll explain the intuition, complexity, and give you clean code.
      </p>
      <div className="mt-8 grid w-full max-w-xl grid-cols-1 gap-2 sm:grid-cols-2">
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onPick(prompt)}
            className="group rounded-lg border border-border/60 bg-surface/60 px-4 py-3 text-left text-sm text-foreground/90 transition hover:border-primary/60 hover:bg-surface hover:text-foreground"
          >
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-muted-foreground group-hover:text-indigo-glow">
              /prompt
            </span>
            <span className="mt-1 block font-mono text-sm">{prompt}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
