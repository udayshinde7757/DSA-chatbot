import {
  MessageSquare,
  BookOpen,
  Dumbbell,
  TrendingUp,
  GitBranch,
  Layers,
  Network,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useMemo } from "react";
import { useAppState } from "./state";
import AnimatedButton from "@/components/ui/animated-button";
import { topics, quickActions } from "./data";

export function Dashboard() {
  const { setView, threads, newChat, openThread } = useAppState();

  const stats = useMemo(() => ({ totalConv: threads.length }), [threads]);

  const byDifficulty = useMemo(() => {
    return {
      easy: topics.filter((t) => t.difficulty === "easy").length,
      medium: topics.filter((t) => t.difficulty === "medium").length,
      hard: topics.filter((t) => t.difficulty === "hard").length,
    };
  }, []);

  const recommended = topics.slice(0, 3);

  return (
    <div className="view-scroll">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        {/* Hero */}
        <div className="mb-10">
          <div
            className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[12px] font-medium"
            style={{ background: "rgba(217,119,6,0.1)", color: "var(--color-ember-400)" }}
          >
            <Sparkles size={13} />
            Your personal DSA co-pilot
          </div>
          <h1
            className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl"
            style={{ color: "var(--color-charcoal-100)" }}
          >
            Learn data structures &{" "}
            <span style={{ color: "var(--color-ember-400)" }}>algorithms</span>, the smart way.
          </h1>
          <p
            className="max-w-xl text-[15px] leading-relaxed"
            style={{ color: "var(--color-charcoal-400)" }}
          >
            Audit every concept, work through problems step by step, and get code in Python and C++
            — all in one place. Your AI mentor explains like a senior engineer, not a textbook.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <AnimatedButton onClick={newChat} className="px-7 py-2.5 text-[14px]">
              Start learning
            </AnimatedButton>
            <button
              className="btn btn-secondary"
              onClick={() => setView("topics")}
              style={{ padding: "11px 20px" }}
            >
              Browse topics
            </button>
          </div>
        </div>

        {/* Action cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <button className="card card-interactive text-left" onClick={newChat}>
            <MessageSquare size={22} style={{ color: "var(--color-ember-400)" }} className="mb-3" />
            <div className="mb-1 font-semibold" style={{ color: "var(--color-charcoal-100)" }}>
              Start a conversation
            </div>
            <p className="text-[13px]" style={{ color: "var(--color-charcoal-400)" }}>
              Ask anything — walk me through two pointers, why is my DP slow…
            </p>
          </button>
          <button className="card card-interactive text-left" onClick={() => setView("topics")}>
            <BookOpen size={22} style={{ color: "var(--color-sky-400)" }} className="mb-3" />
            <div className="mb-1 font-semibold" style={{ color: "var(--color-charcoal-100)" }}>
              Browse topics
            </div>
            <p className="text-[13px]" style={{ color: "var(--color-charcoal-400)" }}>
              {topics.length} topics from arrays to advanced graphs and DP.
            </p>
          </button>
          <button className="card card-interactive text-left" onClick={() => setView("practice")}>
            <Dumbbell size={22} style={{ color: "var(--color-ember-400)" }} className="mb-3" />
            <div className="mb-1 font-semibold" style={{ color: "var(--color-charcoal-100)" }}>
              Practice problems
            </div>
            <p className="text-[13px]" style={{ color: "var(--color-charcoal-400)" }}>
              Ten classic problems with guided mentorship sessions.
            </p>
          </button>
        </div>

        {/* Stats row */}
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="card flex items-center gap-3" style={{ padding: "14px 16px" }}>
            <TrendingUp size={18} style={{ color: "var(--color-ember-400)" }} />
            <div>
              <div
                className="text-lg font-semibold leading-none"
                style={{ color: "var(--color-charcoal-100)" }}
              >
                {stats.totalConv}
              </div>
              <div className="mt-1 text-[12px]" style={{ color: "var(--color-charcoal-500)" }}>
                Conversations
              </div>
            </div>
          </div>
          <div className="card flex items-center gap-3" style={{ padding: "14px 16px" }}>
            <BookOpen size={18} style={{ color: "var(--color-sky-400)" }} />
            <div>
              <div
                className="text-lg font-semibold leading-none"
                style={{ color: "var(--color-charcoal-100)" }}
              >
                {topics.length}
              </div>
              <div className="mt-1 text-[12px]" style={{ color: "var(--color-charcoal-500)" }}>
                Topics
              </div>
            </div>
          </div>
          <div className="card flex items-center gap-3" style={{ padding: "14px 16px" }}>
            <GitBranch size={18} style={{ color: "var(--color-warning)" }} />
            <div>
              <div
                className="text-lg font-semibold leading-none"
                style={{ color: "var(--color-charcoal-100)" }}
              >
                {byDifficulty.easy + byDifficulty.medium + byDifficulty.hard}
              </div>
              <div className="mt-1 text-[12px]" style={{ color: "var(--color-charcoal-500)" }}>
                Concepts
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="mt-10">
          <h2
            className="mb-4 flex items-center gap-2 text-lg font-semibold"
            style={{ color: "var(--color-charcoal-100)" }}
          >
            <Layers size={18} style={{ color: "var(--color-ember-400)" }} />
            Quick start
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {quickActions.slice(0, 4).map((qa) => (
              <button
                key={qa.id}
                className="card card-interactive text-left flex flex-col gap-2"
                style={{ padding: "16px" }}
                onClick={() => {
                  newChat();
                  // Sends prompt after navigating — handled by MentorView prompt passthrough
                  sessionStorage.setItem("algomate.pendingPrompt", qa.prompt);
                }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-[14px] font-medium"
                    style={{ color: "var(--color-charcoal-100)" }}
                  >
                    {qa.label}
                  </span>
                  <ChevronRight size={15} style={{ color: "var(--color-charcoal-500)" }} />
                </div>
                <span className="text-[12.5px]" style={{ color: "var(--color-charcoal-500)" }}>
                  {qa.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent conversations */}
        {threads.length > 0 && (
          <div className="mt-10">
            <h2
              className="mb-4 flex items-center gap-2 text-lg font-semibold"
              style={{ color: "var(--color-charcoal-100)" }}
            >
              <Network size={18} style={{ color: "var(--color-sky-400)" }} />
              Continue learning
            </h2>
            <div className="space-y-2">
              {[...threads]
                .reverse()
                .slice(0, 4)
                .map((t) => (
                  <button
                    key={t.meta.id}
                    className="card card-interactive text-left w-full flex items-center justify-between gap-3"
                    onClick={() => openThread(t.meta.id)}
                  >
                    <div className="min-w-0">
                      <div
                        className="truncate text-[14px] font-medium"
                        style={{ color: "var(--color-charcoal-100)" }}
                      >
                        {t.meta.title}
                      </div>
                      <div
                        className="mt-0.5 text-[12px]"
                        style={{ color: "var(--color-charcoal-500)" }}
                      >
                        {t.messages.length} messages ·{" "}
                        {new Date(t.meta.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <ChevronRight
                      size={15}
                      style={{ color: "var(--color-charcoal-500)" }}
                      className="flex-shrink-0"
                    />
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
