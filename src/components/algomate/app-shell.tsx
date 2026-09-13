import { AppStateProvider, useAppState } from "./state";
import { AmbientBackground } from "./ambient-background";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { Dashboard } from "./dashboard";
import { TopicsView } from "./topics-view";
import { PracticeView } from "./practice-view";
import { MentorView } from "./mentor-view";

function AppContent() {
  const { view } = useAppState();

  return (
    <div className="app-shell">
      <AmbientBackground />
      <Sidebar />
      <div className="main-content">
        <Topbar />
        <div className="relative z-[1] flex-1 flex flex-col min-h-0 overflow-hidden">
          {view === "home" && <Dashboard />}
          {view === "mentor" && <MentorView />}
          {view === "topics" && <TopicsView />}
          {view === "practice" && <PracticeView />}
        </div>
      </div>
    </div>
  );
}

export function AppShell() {
  return (
    <AppStateProvider>
      <AppContent />
    </AppStateProvider>
  );
}
