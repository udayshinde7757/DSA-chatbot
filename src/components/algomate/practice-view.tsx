import { Dumbbell, Play, CheckCircle2, Timer } from "lucide-react";
import { useMemo, useState } from "react";
import { useAppState } from "./state";
import { practiceTemplates, topics } from "./data";
import type { PracticeTemplate } from "./data";

const DIFF_LABEL: Record<PracticeTemplate["difficulty"], string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

function PracticeCard({ template }: { template: PracticeTemplate }) {
  const { newChat } = useAppState();
  const topicNames = useMemo(() => {
    const lookup = new Map(topics.map((t) => [t.id, t.title]));
    return template.topics.map((id) => lookup.get(id) ?? id).slice(0, 3);
  }, [template]);

  return (
    <button
      className="card card-interactive text-left flex flex-col gap-3"
      onClick={() => {
        newChat();
        sessionStorage.setItem("algomate.pendingPrompt", template.prompt);
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Play size={15} style={{ color: "var(--color-ember-400)" }} />
          <span className="font-medium" style={{ color: "var(--color-charcoal-100)" }}>
            {template.title}
          </span>
        </div>
        <span className={`badge badge-${template.difficulty}`}>
          {DIFF_LABEL[template.difficulty]}
        </span>
      </div>
      <p className="text-[13px] leading-relaxed" style={{ color: "var(--color-charcoal-400)" }}>
        {template.description}
      </p>
      <div className="mt-auto flex flex-wrap items-center gap-2">
        {topicNames.map((name) => (
          <span key={name} className="badge badge-sky" style={{ fontSize: 11 }}>
            {name}
          </span>
        ))}
        <span
          className="ml-auto inline-flex items-center gap-1 text-[12px]"
          style={{ color: "var(--color-charcoal-500)" }}
        >
          <Timer size={12} />
          Guided solve
        </span>
      </div>
    </button>
  );
}

export function PracticeView() {
  const [filter, setFilter] = useState<"all" | PracticeTemplate["difficulty"]>("all");

  const filtered = useMemo(
    () =>
      filter === "all"
        ? practiceTemplates
        : practiceTemplates.filter((t) => t.difficulty === filter),
    [filter],
  );

  const counts = useMemo(
    () => ({
      all: practiceTemplates.length,
      easy: practiceTemplates.filter((t) => t.difficulty === "easy").length,
      medium: practiceTemplates.filter((t) => t.difficulty === "medium").length,
      hard: practiceTemplates.filter((t) => t.difficulty === "hard").length,
    }),
    [],
  );

  const FILTERS: { id: typeof filter; label: string }[] = [
    { id: "all", label: `All (${counts.all})` },
    { id: "easy", label: `Easy (${counts.easy})` },
    { id: "medium", label: `Medium (${counts.medium})` },
    { id: "hard", label: `Hard (${counts.hard})` },
  ];

  return (
    <div className="view-scroll">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: "var(--color-charcoal-100)" }}
          >
            Practice
          </h1>
          <p className="mt-1 max-w-xl text-[14px]" style={{ color: "var(--color-charcoal-400)" }}>
            Real interview problems, but you're never alone. Click a problem and your mentor walks
            you through the approach, code, and analysis.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              className={`btn btn-sm ${filter === f.id ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filtered.map((p) => (
            <PracticeCard key={p.id} template={p} />
          ))}
        </div>

        <div className="card mt-8 flex items-center gap-3" style={{ padding: "16px 20px" }}>
          <CheckCircle2
            size={18}
            style={{ color: "var(--color-success)" }}
            className="flex-shrink-0"
          />
          <p className="text-[13px]" style={{ color: "var(--color-charcoal-400)" }}>
            <span style={{ color: "var(--color-charcoal-200)" }}>New here?</span> Start with{" "}
            <strong>Two Sum</strong> — it teaches the hash-map optimization that appears in dozens
            of harder problems.
          </p>
          <Dumbbell
            size={18}
            style={{ color: "var(--color-ember-400)" }}
            className="flex-shrink-0 ml-auto"
          />
        </div>
      </div>
    </div>
  );
}
