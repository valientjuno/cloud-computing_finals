"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import type { User, Entry, Collection, Page } from "./types";
import { SAMPLE_ENTRIES } from "./constants";
import { storage, uid } from "./utils";
import { Toast } from "./components/Toast";
import { Landing } from "./pages/Landing";
import { AuthPage } from "./pages/AuthPage";
import { Dashboard } from "./pages/Dashboard";
import { Editor } from "./pages/Editor";
import { Detail } from "./pages/Detail";
import { Settings } from "./pages/Settings";
import { CalendarPage } from "./pages/CalendarPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { CollectionsPage } from "./pages/CollectionsPage";

// ─── App Shell ─────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState<Page>("landing");
  const [user, setUser] = useState<User | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const toastRef = useRef<(m: string, t?: "ok" | "err") => void>(() => {});

  useEffect(() => {
    const e: Entry[] = storage.get("folio_entries") || [];
    const c: Collection[] = storage.get("folio_collections") || [];
    setEntries(e);
    setCollections(c);
    const cid = storage.get("folio_current");
    if (cid) {
      const users: User[] = storage.get("folio_users") || [];
      const u = users.find((u: User) => u.id === cid);
      if (u) {
        setUser(u);
        setPage("dashboard");
      }
    }
  }, []);

  const saveEntry = (entry: Entry) => {
    setEntries((prev) => {
      const next = prev.find((e) => e.id === entry.id)
        ? prev.map((e) => (e.id === entry.id ? entry : e))
        : [entry, ...prev];
      storage.set("folio_entries", next);
      return next;
    });
    toastRef.current?.("Entry saved ✓");
  };
  const deleteEntry = (id: string) => {
    setEntries((prev) => {
      const next = prev.filter((e) => e.id !== id);
      storage.set("folio_entries", next);
      return next;
    });
    setPage("dashboard");
    toastRef.current?.("Entry deleted");
  };
  const handleAuth = (u: User) => {
    setUser(u);
    setPage("dashboard");
  };
  const handleLogout = () => {
    storage.set("folio_current", null);
    setUser(null);
    setPage("landing");
  };
  const navTo = (p: Page) => {
    if (
      [
        "dashboard",
        "editor",
        "settings",
        "calendar",
        "analytics",
        "collections",
      ].includes(p) &&
      !user
    ) {
      setAuthMode("login");
      setPage("login");
      return;
    }
    setPage(p);
  };
  const regToast = useCallback((fn: (m: string, t?: "ok" | "err") => void) => {
    toastRef.current = fn;
  }, []);
  const detailEntry = entries.find((e) => e.id === detailId) || null;

  return (
    <>
      {page === "landing" && (
        <Landing
          onNav={(p) => {
            if (p === "signup" || p === "login") {
              setAuthMode(p as "login" | "signup");
            }
            setPage(p);
          }}
        />
      )}
      {(page === "login" || page === "signup") && (
        <AuthPage
          mode={authMode}
          onNav={(p) => {
            if (p === "signup" || p === "login") {
              setAuthMode(p as "login" | "signup");
            }
            setPage(p);
          }}
          onAuth={handleAuth}
        />
      )}
      {page === "dashboard" && user && (
        <Dashboard
          user={user}
          entries={entries}
          collections={collections}
          onNav={navTo}
          onSelectEntry={(id) => {
            setDetailId(id);
            setPage("detail");
          }}
          onNewEntry={() => {
            setEditId(null);
            setPage("editor");
          }}
          onLogout={handleLogout}
        />
      )}
      {page === "editor" && user && (
        <Editor
          user={user}
          entries={entries}
          collections={collections}
          editId={editId}
          onSave={saveEntry}
          onNav={navTo}
          onBack={() => setPage(editId && detailId ? "detail" : "dashboard")}
        />
      )}
      {page === "detail" && detailEntry && (
        <Detail
          entry={detailEntry}
          collections={collections}
          onBack={() => setPage("dashboard")}
          onEdit={() => {
            setEditId(detailEntry.id);
            setPage("editor");
          }}
          onDelete={() => deleteEntry(detailEntry.id)}
        />
      )}
      {page === "settings" && user && (
        <Settings
          user={user}
          onUpdate={(u) => {
            setUser(u);
          }}
          onBack={() => setPage("dashboard")}
          onLogout={handleLogout}
        />
      )}
      {page === "calendar" && user && (
        <CalendarPage
          user={user}
          entries={entries}
          onNav={navTo}
          onSelectEntry={(id) => {
            setDetailId(id);
            setPage("detail");
          }}
          onNewEntry={() => {
            setEditId(null);
            setPage("editor");
          }}
        />
      )}
      {page === "analytics" && user && (
        <AnalyticsPage
          user={user}
          entries={entries}
          onNav={navTo}
          onNewEntry={() => {
            setEditId(null);
            setPage("editor");
          }}
        />
      )}
      {page === "collections" && user && (
        <CollectionsPage
          user={user}
          entries={entries}
          collections={collections}
          onNav={navTo}
          onUpdateCollections={(c) => {
            setCollections(c);
          }}
          onSelectEntry={(id) => {
            setDetailId(id);
            setPage("detail");
          }}
          onNewEntry={() => {
            setEditId(null);
            setPage("editor");
          }}
        />
      )}

      <Toast register={regToast} />
    </>
  );
}
