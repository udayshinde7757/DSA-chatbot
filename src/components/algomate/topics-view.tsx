import { BookOpen, ChevronRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useAppState } from "./state";
import { topics, categoryLabels, categoryOrder, quickActions } from "./data";
import type { Topic } from "./data";

const DIFF_LABEL: Record<Topic["difficulty"], string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

function TopicCard({ topic }: { topic: Topic }) {
  const { newChat } = useAppState();
  return (
    <button
      className="card card-interactive text-left"
      onClick={() => {
        newChat();
        sessionStorage.setItem("algomate.pendingPrompt", topic.prompt);
      }}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <BookOpen
            size={16}
            style={{ color: "var(--color-ember-400)" }}
            className="flex-shrink-0"
          />
          <span className="truncate font-medium" style={{ color: "var(--color-charcoal-100)" }}>
            {topic.title}
          </span>
        </div>
        <span className={`badge badge-${topic.difficulty} flex-shrink-0`}>
          {DIFF_LABEL[topic.difficulty]}
        </span>
      </div>
      <p
        className="mb-3 text-[13px] leading-relaxed"
        style={{ color: "var(--color-charcoal-400)" }}
      >
        {topic.description}
      </p>
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {topic.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="badge badge-muted" style={{ fontSize: 11 }}>
              {tag.replace(/-/g, " ")}
            </span>
          ))}
        </div>
        <ChevronRight
          size={15}
          style={{ color: "var(--color-charcoal-500)" }}
          className="flex-shrink-0"
        />
      </div>
    </button>
  );
}

export function TopicsView() {
  const { newChat } = useAppState();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return topics;
    return topics.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.replace(/-/g, " ").includes(q)),
    );
  }, [query]);

  const byCategory = useMemo(() => {
    const grouped: Record<string, Topic[]> = {};
    for (const c of categoryOrder) grouped[c] = [];
    for (const t of filtered) grouped[t.category].push(t);
    return grouped;
  }, [filtered]);

  return (
    <div className="view-scroll">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: "var(--color-charcoal-100)" }}
          >
            Topics
          </h1>
          <p className="mt-1 text-[14px]" style={{ color: "var(--color-charcoal-400)" }}>
            {topics.length} topics across core structures, algorithmic patterns, and advanced
            techniques. Click any topic to start a guided lesson with your mentor.
          </p>
        </div>

        {/* Search */}
        <div
          className="mb-8 flex items-center gap-3 rounded-xl px-4 py-3"
          style={{
            background: "var(--color-charcoal-800)",
            border: "1px solid var(--color-charcoal-700)",
          }}
        >
          <Search size={16} style={{ color: "var(--color-charcoal-500)" }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="search"
            placeholder="Search topics, e.g. “heap”, “backtracking”…"
            aria-label="Search topics"
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "var(--color-charcoal-100)",
              fontSize: 14,
            }}
          />
        </div>

        {categoryOrder.map((cat) => {
          const items = byCategory[cat] ?? [];
          if (items.length === 0) return null;
          return (
            <section key={cat} className="mb-10">
              <h2
                className="mb-3 text-[14px] font-semibold uppercase tracking-wide"
                style={{ color: "var(--color-charcoal-400)" }}
              >
                {categoryLabels[cat]}
                <span
                  className="ml-2 font-normal normal-case"
                  style={{ color: "var(--color-charcoal-600)" }}
                >
                  {items.length}
                </span>
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {items.map((t) => (
                  <TopicCard key={t.id} topic={t} />
                ))}
              </div>
            </section>
          );
        })}

        {filtered.length === 0 && (
          <div className="card text-center" style={{ padding: "48px 24px" }}>
            <p className="font-medium" style={{ color: "var(--color-charcoal-300)" }}>
              No topics match “{query}”
            </p>
            <p className="mt-1 text-[13px]" style={{ color: "var(--color-charcoal-500)" }}>
              Try “tree”, “sort”, or “window”. Or just ask your mentor anything.
            </p>
          </div>
        )}

        {/* Quick action strip */}
        {!query && (
          <div className="mt-4">
            <h3
              className="mb-3 text-[14px] font-semibold"
              style={{ color: "var(--color-charcoal-400)" }}
            >
              Can't find it? Ask these…
            </h3>
            <div className="flex flex-wrap gap-2">
              {quickActions.slice(0, 3).map((qa) => (
                <button
                  key={qa.id}
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    newChat();
                    sessionStorage.setItem("algomate.pendingPrompt", qa.prompt);
                  }}
                >
                  {qa.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
