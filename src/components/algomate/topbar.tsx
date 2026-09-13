import { Menu, Cpu, ChevronRight } from "lucide-react";
import { useEffect } from "react";
import { useAppState } from "./state";

const VIEW_TITLES: Record<string, string> = {
  home: "Dashboard",
  mentor: "AI Mentor",
  topics: "Topics",
  practice: "Practice",
};

const VIEW_SUBTITLES: Record<string, string> = {
  home: "Your DSA learning workspace",
  mentor: "Personal DSA tutor — explain, walk through, and code",
  topics: "Explore the full DSA curriculum",
  practice: "Solve problems with guided mentorship",
};

export function Topbar() {
  const { view, setMobileNavOpen, modelInfo, setModelInfo } = useAppState();

  useEffect(() => {
    // Fetch model info once for the model badge
    if (!modelInfo) {
      fetch("/api/config")
        .then((r) => (r.ok ? r.json() : null))
        .then((d: { model?: { label: string; provider: string; tier: string } } | null) => {
          if (d?.model) {
            setModelInfo(d.model);
          } else {
            setModelInfo({
              label: "Gemma 4 26B",
              provider: "OpenRouter",
              tier: "Primary",
            });
          }
        })
        .catch(() => {
          setModelInfo({
            label: "Gemma 4 26B",
            provider: "OpenRouter",
            tier: "Primary",
          });
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <header className="topbar">
      <div className="flex items-center gap-2">
        <button
          className="btn btn-ghost btn-icon lg:hidden"
          onClick={() => setMobileNavOpen(true)}
          aria-label="Open navigation"
        >
          <Menu size={18} />
        </button>
        <div className="flex items-center gap-1.5">
          <span
            className="text-[15px] font-semibold"
            style={{ color: "var(--color-charcoal-100)" }}
          >
            {VIEW_TITLES[view]}
          </span>
          <span
            className="hidden sm:inline-flex items-center gap-1 text-[12px]"
            style={{ color: "var(--color-charcoal-500)" }}
          >
            <ChevronRight size={13} />
            {VIEW_SUBTITLES[view]}
          </span>
        </div>
      </div>

      <div
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
        style={{
          background: "var(--color-charcoal-800)",
          border: "1px solid var(--color-charcoal-700)",
        }}
      >
        <Cpu size={14} style={{ color: "var(--color-ember-400)" }} />
        <span className="text-[12px] font-medium" style={{ color: "var(--color-charcoal-300)" }}>
          {modelInfo ? `${modelInfo.label} · ${modelInfo.provider}` : "Connecting…"}
        </span>
        <span
          className="status-dot"
          data-status={modelInfo ? "ok" : "offline"}
          style={{ width: 6, height: 6 }}
        />
      </div>
    </header>
  );
}
