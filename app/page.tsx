"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { User, Entry, Collection, Page } from "./types";
import { storage } from "./utils";
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
import { getCurrentUser, logoutUser } from "./auth";
import { fetchEntries, addEntry, updateEntry, deleteEntry } from "./functions";

export default function Home() {
  const [page, setPage] = useState<Page>("landing");
  const [user, setUser] = useState<User | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const toastRef = useRef<(m: string, t?: "ok" | "err") => void>(() => {});

  useEffect(() => {
    const init = async () => {
      try {
        const current = await getCurrentUser();

        if (!current) {
          setPage("landing");
          const savedCollections: Collection[] =
            storage.get("folio_collections") || [];
          setCollections(savedCollections);
          return;
        }

        const appUser: User = {
          id: current.$id,
          name: current.name || current.email.split("@")[0],
          email: current.email,
          avatar: "",
          password: "",
          notifications: true,
        };

        setUser(appUser);
        setPage("dashboard");

        const docs = await fetchEntries(appUser.id);
        const mapped: Entry[] = docs.map((doc) => {
          const normalizedCollectionId =
            doc.collectionId == null ? undefined : doc.collectionId;

          return {
            id: doc.$id,
            userId: doc.userId,
            title: doc.title,
            content: doc.content,
            mood: doc.mood,
            tags: doc.tags ?? [],
            createdAt: doc.$createdAt,
            updatedAt: doc.$updatedAt,
            collectionId: normalizedCollectionId,
          };
        });

        setEntries(mapped);

        const savedCollections: Collection[] =
          storage.get("folio_collections") || [];
        setCollections(savedCollections);
      } catch (error) {
        console.error("Init error:", error);
        setUser(null);
        setPage("landing");

        const savedCollections: Collection[] =
          storage.get("folio_collections") || [];
        setCollections(savedCollections);
      }
    };

    init();
  }, []);

  const refreshEntries = async (userId: string) => {
    const docs = await fetchEntries(userId);

    const mapped: Entry[] = docs.map((doc) => {
      const normalizedCollectionId =
        doc.collectionId == null ? undefined : doc.collectionId;

      return {
        id: doc.$id,
        userId: doc.userId,
        title: doc.title,
        content: doc.content,
        mood: doc.mood,
        tags: doc.tags ?? [],
        createdAt: doc.$createdAt,
        updatedAt: doc.$updatedAt,
        collectionId: normalizedCollectionId,
      };
    });

    setEntries(mapped);
  };

  const saveEntry = async (entry: Entry) => {
    try {
      let savedRow: any;

      if (entry.id && entries.some((e) => e.id === entry.id)) {
        savedRow = await updateEntry(entry.id, {
          title: entry.title,
          content: entry.content,
          mood: entry.mood,
          tags: entry.tags,
          collectionId: entry.collectionId,
        });

        setEditId(entry.id);
      } else {
        savedRow = await addEntry({
          userId: user?.id || "",
          title: entry.title,
          content: entry.content,
          mood: entry.mood,
          tags: entry.tags,
          collectionId: entry.collectionId,
        });

        setEditId(savedRow.$id);
        setDetailId(savedRow.$id);
      }

      if (user) {
        await refreshEntries(user.id);
      }

      toastRef.current?.("Entry saved ✓");
    } catch (error) {
      console.error("Save entry error:", error);
      toastRef.current?.("Could not save entry", "err");
    }
  };

  const deleteEntryById = async (id: string) => {
    try {
      await deleteEntry(id);

      if (user) {
        await refreshEntries(user.id);
      }

      if (detailId === id) setDetailId(null);
      if (editId === id) setEditId(null);

      setPage("dashboard");
      toastRef.current?.("Entry deleted");
    } catch (error) {
      console.error("Delete entry error:", error);
      toastRef.current?.("Could not delete entry", "err");
    }
  };

  const handleAuth = async (nextUser: User) => {
    setUser(nextUser);
    setPage("dashboard");
    await refreshEntries(nextUser.id);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } finally {
      setUser(null);
      setEntries([]);
      setEditId(null);
      setDetailId(null);
      setPage("landing");
    }
  };

  const navTo = (nextPage: Page) => {
    if (
      [
        "dashboard",
        "editor",
        "settings",
        "calendar",
        "analytics",
        "collections",
      ].includes(nextPage) &&
      !user
    ) {
      setAuthMode("login");
      setPage("login");
      return;
    }

    setPage(nextPage);
  };

  const regToast = useCallback((fn: (m: string, t?: "ok" | "err") => void) => {
    toastRef.current = fn;
  }, []);

  const detailEntry = entries.find((e) => e.id === detailId) || null;

  return (
    <>
      {page === "landing" && (
        <Landing
          onNav={(nextPage) => {
            if (nextPage === "signup" || nextPage === "login") {
              setAuthMode(nextPage as "login" | "signup");
            }
            setPage(nextPage);
          }}
        />
      )}

      {(page === "login" || page === "signup") && (
        <AuthPage
          mode={authMode}
          onNav={(nextPage) => {
            if (nextPage === "signup" || nextPage === "login") {
              setAuthMode(nextPage as "login" | "signup");
            }
            setPage(nextPage);
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
          onDelete={() => deleteEntryById(detailEntry.id)}
        />
      )}

      {page === "settings" && user && (
        <Settings
          user={user}
          onUpdate={(updatedUser) => {
            setUser(updatedUser);
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
          onUpdateCollections={(nextCollections) => {
            setCollections(nextCollections);
            storage.set("folio_collections", nextCollections);
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
