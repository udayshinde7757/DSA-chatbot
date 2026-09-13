import { Home, MessageSquare, BookOpen, Dumbbell, Plus, Trash2, X } from "lucide-react";
import { useAppState } from "./state";
import type { View } from "./state";
import { Brand } from "./brand";

const NAV_ITEMS: { view: View; label: string; icon: typeof Home }[] = [
  { view: "home", label: "Dashboard", icon: Home },
  { view: "mentor", label: "AI Mentor", icon: MessageSquare },
  { view: "topics", label: "Topics", icon: BookOpen },
  { view: "practice", label: "Practice", icon: Dumbbell },
];

function SidebarInner() {
  const {
    view,
    setView,
    sidebarOpen,
    setSidebarOpen,
    mobileNavOpen,
    setMobileNavOpen,
    threads,
    activeThreadId,
    openThread,
    newChat,
    deleteThread,
  } = useAppState();

  return (
    <>
      {/* overlay for mobile */}
      <div
        className="sidebar-overlay"
        data-open={mobileNavOpen}
        onClick={() => setMobileNavOpen(false)}
      />

      <aside className="sidebar" data-collapsed={!sidebarOpen} data-open={mobileNavOpen}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4">
          <Brand />
          <div className="flex items-center gap-1">
            <button
              className="btn btn-ghost btn-icon lg:hidden"
              onClick={() => setMobileNavOpen(false)}
              aria-label="Close navigation"
            >
              <X size={18} />
            </button>
            <button
              className="btn btn-ghost btn-icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {/* panel toggle */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect
                  x="3"
                  y="4"
                  width="18"
                  height="16"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <path
                  d={sidebarOpen ? "M15 4v16" : "M9 4v16"}
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 px-3 pb-2">
          {NAV_ITEMS.map(({ view: v, label, icon: Icon }) => (
            <button
              key={v}
              className="nav-item"
              data-active={view === v}
              onClick={() => setView(v)}
            >
              <Icon size={17} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {/* New chat */}
        <div className="px-3 pt-2">
          <button className="btn btn-primary w-full" onClick={newChat}>
            <Plus size={16} />
            New conversation
          </button>
        </div>

        {/* Threads */}
        <div className="mt-4 flex-1 overflow-y-auto px-3 pb-4">
          <div
            className="px-2 pb-2 text-[11px] uppercase tracking-wider"
            style={{ color: "var(--color-charcoal-500)" }}
          >
            {threads.length > 0 ? `Recent · ${threads.length}` : "No conversations yet"}
          </div>
          {threads.length === 0 && (
            <p
              className="px-2 text-[13px] leading-relaxed"
              style={{ color: "var(--color-charcoal-500)" }}
            >
              Start a conversation with your DSA mentor.
            </p>
          )}
          {[...threads].reverse().map((t) => (
            <div key={t.meta.id} className="group relative">
              <button
                className="thread-item pr-10"
                data-active={activeThreadId === t.meta.id}
                onClick={() => openThread(t.meta.id)}
                title={t.meta.title}
              >
                {t.meta.title}
              </button>
              <button
                className="btn btn-ghost btn-icon absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                style={{ width: 26, height: 26 }}
                onClick={() => deleteThread(t.meta.id)}
                aria-label={`Delete ${t.meta.title}`}
              >
                <Trash2 size={13} style={{ color: "var(--color-charcoal-500)" }} />
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          className="px-4 py-3 border-t text-center text-[11px]"
          style={{ borderColor: "var(--color-charcoal-700)", color: "var(--color-charcoal-600)" }}
        >
          Conversations stay on this device
        </div>
      </aside>
    </>
  );
}

export function Sidebar() {
  return <SidebarInner />;
}
