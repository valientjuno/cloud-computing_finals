"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type { User, Entry, Collection, Page } from "../types";
import {
  MOODS,
  MOOD_LABELS,
  COLLECTION_COLORS,
  COLLECTION_EMOJIS,
  SAMPLE_ENTRIES,
} from "../constants";
import {
  storage,
  fmtDate,
  fmtShort,
  excerpt,
  uid,
  streakCount,
  isoDay,
} from "../utils";
import { Logo } from "../components/Logo";
import { Avatar } from "../components/Avatar";
import { MoodPicker } from "../components/MoodPicker";
import { TagInput } from "../components/TagInput";
import { EntryCard } from "../components/EntryCard";
import { AppNav } from "../components/AppNav";

function Dashboard({
  user,
  entries,
  collections,
  onNav,
  onSelectEntry,
  onNewEntry,
  onLogout,
}: {
  user: User;
  entries: Entry[];
  collections: Collection[];
  onNav: (p: Page) => void;
  onSelectEntry: (id: string) => void;
  onNewEntry: () => void;
  onLogout: () => void;
}) {
  const myEntries = entries
    .filter((e) => e.userId === user.id)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  const streak = streakCount(entries, user.id);
  const [searchQ, setSearchQ] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const filtered = searchQ
    ? myEntries.filter(
        (e) =>
          e.title.toLowerCase().includes(searchQ.toLowerCase()) ||
          e.content.toLowerCase().includes(searchQ.toLowerCase()) ||
          e.tags.some((t) => t.includes(searchQ.toLowerCase())),
      )
    : myEntries;

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const greet = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)" }}>
      <AppNav
        user={user}
        onNav={(p) => {
          if (p === "landing") {
            onLogout();
            return;
          }
          onNav(p);
        }}
        onNewEntry={onNewEntry}
        activeMenuItems={["dashboard"]}
      />

      {searchOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(26,20,16,0.4)",
            zIndex: 500,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingTop: "8rem",
          }}
          onClick={() => setSearchOpen(false)}
        >
          <div
            style={{
              background: "#fffdf8",
              borderRadius: "3px",
              width: "90%",
              maxWidth: 560,
              boxShadow: "0 24px 80px rgba(26,20,16,0.25)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <input
              autoFocus
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Search your entries…"
              style={{
                width: "100%",
                border: "none",
                borderBottom: "1px solid rgba(26,20,16,0.1)",
                padding: "1rem 1.25rem",
                fontFamily: "'Lora',serif",
                fontSize: "1rem",
                background: "transparent",
                outline: "none",
                boxSizing: "border-box",
                color: "#1a1410",
              }}
            />
            <div style={{ maxHeight: 320, overflowY: "auto" }}>
              {searchQ && filtered.length === 0 && (
                <p
                  style={{
                    padding: "1.5rem",
                    fontFamily: "'DM Mono',monospace",
                    fontSize: "0.78rem",
                    color: "#7a6f62",
                    textAlign: "center",
                  }}
                >
                  No entries found for "{searchQ}"
                </p>
              )}

              {filtered.slice(0, 8).map((e) => (
                <div
                  key={e.id}
                  onClick={() => {
                    onSelectEntry(e.id);
                    setSearchOpen(false);
                    setSearchQ("");
                  }}
                  style={{
                    padding: "0.9rem 1.25rem",
                    borderBottom: "1px solid rgba(26,20,16,0.06)",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(ev) =>
                    ((ev.currentTarget as HTMLDivElement).style.background =
                      "#f5f0e8")
                  }
                  onMouseLeave={(ev) =>
                    ((ev.currentTarget as HTMLDivElement).style.background =
                      "transparent")
                  }
                >
                  <div
                    style={{
                      fontFamily: "'Playfair Display',serif",
                      fontSize: "0.95rem",
                      fontWeight: 700,
                      color: "#1a1410",
                      marginBottom: "0.2rem",
                    }}
                  >
                    {e.title || "Untitled"}
                  </div>
                  <div
                    style={{
                      fontFamily: "'DM Mono',monospace",
                      fontSize: "0.68rem",
                      color: "#7a6f62",
                    }}
                  >
                    {fmtShort(e.createdAt)} · {excerpt(e.content, 60)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <main style={{ maxWidth: 760, margin: "0 auto", padding: "3rem 5%" }}>
        <div style={{ marginBottom: "2.5rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "0.5rem",
            }}
          >
            <h1
              style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: "1.8rem",
                fontWeight: 700,
                color: "var(--ink)",
              }}
            >
              {greet()}, {user.name}.
            </h1>

            <div
              style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}
            >
              {streak > 0 && (
                <div
                  style={{
                    background: "rgba(200,135,58,0.1)",
                    border: "1px solid rgba(200,135,58,0.25)",
                    padding: "0.4rem 0.9rem",
                    borderRadius: "2px",
                    fontFamily: "'DM Mono',monospace",
                    fontSize: "0.75rem",
                    color: "#c8873a",
                  }}
                >
                  🔥 {streak} day{streak !== 1 ? "s" : ""}
                </div>
              )}

              <button
                onClick={() => setSearchOpen(true)}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(26,20,16,0.15)",
                  padding: "0.4rem 0.9rem",
                  fontFamily: "'DM Mono',monospace",
                  fontSize: "0.7rem",
                  color: "#7a6f62",
                  cursor: "pointer",
                  borderRadius: "2px",
                }}
              >
                ⌘K
              </button>
            </div>
          </div>

          <p
            style={{
              fontFamily: "'DM Mono',monospace",
              fontSize: "0.75rem",
              color: "#7a6f62",
            }}
          >
            {myEntries.length} {myEntries.length === 1 ? "entry" : "entries"} ·{" "}
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {myEntries.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "5rem 2rem",
              background: "#fffdf8",
              border: "1px solid rgba(26,20,16,0.08)",
              borderRadius: "3px",
            }}
          >
            <p style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>✦</p>
            <h2
              style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: "1.4rem",
                fontWeight: 700,
                fontStyle: "italic",
                marginBottom: "0.6rem",
                color: "var(--ink)",
              }}
            >
              Your story starts here.
            </h2>
            <p
              style={{
                fontFamily: "'DM Mono',monospace",
                fontSize: "0.78rem",
                color: "#7a6f62",
                marginBottom: "1.5rem",
              }}
            >
              Write your first entry — it doesn't have to be perfect.
            </p>
            <button
              onClick={onNewEntry}
              style={{
                background: "#c8873a",
                color: "#fff",
                border: "none",
                padding: "0.75rem 1.5rem",
                fontFamily: "'DM Mono',monospace",
                fontSize: "0.78rem",
                cursor: "pointer",
                borderRadius: "2px",
              }}
            >
              Write your first entry →
            </button>
          </div>
        )}

        {myEntries.length > 0 && (
          <div style={{ display: "grid", gap: "1rem" }}>
            {filtered.map((e) => (
              <EntryCard
                key={e.id}
                entry={e}
                onClick={() => onSelectEntry(e.id)}
              />
            ))}

            {searchQ && filtered.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem",
                  fontFamily: "'DM Mono',monospace",
                  fontSize: "0.78rem",
                  color: "#7a6f62",
                }}
              >
                No entries match your search.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export { Dashboard };
