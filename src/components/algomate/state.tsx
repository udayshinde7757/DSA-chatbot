/**
 * Client-side app state: active view, sidebar, thread list, model info.
 * Thread messenger payloads are persisted to localStorage.
 */

import { createContext, useCallback, useContext, useRef, useState } from "react";
import type { ReactNode } from "react";

export type View = "home" | "mentor" | "topics" | "practice";
export type Difficulty = "easy" | "medium" | "hard";

/** A chat thread persisted locally. */
export interface ThreadMeta {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  firstPrompt: string;
}

export interface StoredThread {
  meta: ThreadMeta;
  messages: { role: "user" | "assistant"; content: string }[];
}

interface AppState {
  view: View;
  setView: (v: View) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (o: boolean) => void;
  mobileNavOpen: boolean;
  setMobileNavOpen: (o: boolean) => void;
  threads: StoredThread[];
  activeThreadId: string | null;
  openThread: (id: string) => void;
  newChat: () => void;
  deleteThread: (id: string) => void;
  saveThread: (messages: StoredThread["messages"], firstPrompt?: string) => string;
  modelInfo: { label: string; provider: string; tier: string } | null;
  setModelInfo: (i: { label: string; provider: string; tier: string } | null) => void;
}

const STORAGE_KEY = "algomate.threads.v1";
const MODEL_KEY = "algomate.model.v1";

export function loadThreads(): StoredThread[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((t) => t && t.meta && Array.isArray(t.messages)) as StoredThread[];
  } catch {
    return [];
  }
}

function persistThreads(threads: StoredThread[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(threads.slice(0, 50)));
  } catch {
    /* storage full or unavailable — keep in-memory only */
  }
}

function summarizeTitle(firstPrompt: string): string {
  const clean = firstPrompt.trim().replace(/\s+/g, " ").slice(0, 60);
  return clean.length < firstPrompt.trim().length ? `${clean}…` : clean || "New chat";
}

function makeId(): string {
  return `thr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export const AppStateContext = createContext<AppState | null>(null);

export function useAppState(): AppState {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateContext");
  return ctx;
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [view, setViewState] = useState<View>("home");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [threads, setThreads] = useState<StoredThread[]>(() => {
    if (typeof window === "undefined") return [];
    return loadThreads();
  });
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [modelInfo, setModelInfoState] = useState<AppState["modelInfo"]>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(MODEL_KEY);
      return raw ? (JSON.parse(raw) as AppState["modelInfo"]) : null;
    } catch {
      return null;
    }
  });

  const threadsRef = useRef(threads);
  threadsRef.current = threads;

  const setView = useCallback((v: View) => {
    setViewState(v);
    setMobileNavOpen(false);
  }, []);

  const openThread = useCallback(
    (id: string) => {
      const t = threadsRef.current.find((x) => x.meta.id === id);
      setActiveThreadId(id);
      setView("mentor");
      setMobileNavOpen(false);
      if (t) {
        // refresh ordering — move to top
        setThreads((prev) => {
          const rest = prev.filter((x) => x.meta.id !== id);
          return [...rest, t];
        });
      }
    },
    [setView],
  );

  const newChat = useCallback(() => {
    setActiveThreadId(null);
    setView("mentor");
  }, [setView]);

  const deleteThread = useCallback(
    (id: string) => {
      setThreads((prev) => {
        const next = prev.filter((x) => x.meta.id !== id);
        persistThreads(next);
        return next;
      });
      if (activeThreadId === id) setActiveThreadId(null);
    },
    [activeThreadId],
  );

  const saveThread = useCallback(
    (messages: StoredThread["messages"], firstPrompt?: string): string => {
      const id = activeThreadId ?? makeId();
      const fp = firstPrompt ?? messages.find((m) => m.role === "user")?.content ?? "New chat";
      const now = Date.now();
      setThreads((prev) => {
        const existing = prev.find((x) => x.meta.id === id);
        const meta: ThreadMeta = {
          id,
          title: existing ? existing.meta.title : summarizeTitle(fp),
          createdAt: existing ? existing.meta.createdAt : now,
          updatedAt: now,
          firstPrompt: fp,
        };
        const next = [...prev.filter((x) => x.meta.id !== id), { meta, messages }];
        persistThreads(next);
        return next;
      });
      setActiveThreadId(id);
      return id;
    },
    [activeThreadId],
  );

  const setModelInfo = useCallback((i: AppState["modelInfo"]) => {
    setModelInfoState(i);
    if (i) {
      try {
        localStorage.setItem(MODEL_KEY, JSON.stringify(i));
      } catch {
        /* ignore */
      }
    }
  }, []);

  const value: AppState = {
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
    saveThread,
    modelInfo,
    setModelInfo,
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}
