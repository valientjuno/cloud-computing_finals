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

function CollectionsPage({
  user,
  entries,
  collections,
  onNav,
  onUpdateCollections,
  onSelectEntry,
  onNewEntry,
}: {
  user: User;
  entries: Entry[];
  collections: Collection[];
  onNav: (p: Page) => void;
  onUpdateCollections: (c: Collection[]) => void;
  onSelectEntry: (id: string) => void;
  onNewEntry: () => void;
}) {
  const myCollections = collections.filter((c) => c.userId === user.id);
  const myEntries = entries.filter((e) => e.userId === user.id);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(COLLECTION_COLORS[0]);
  const [newEmoji, setNewEmoji] = useState(COLLECTION_EMOJIS[0]);
  const [activeCollection, setActiveCollection] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const createCollection = () => {
    if (!newName.trim()) return;
    const c: Collection = {
      id: uid(),
      userId: user.id,
      name: newName.trim(),
      color: newColor,
      emoji: newEmoji,
      createdAt: new Date().toISOString(),
    };
    const next = [...collections, c];
    storage.set("folio_collections", next);
    onUpdateCollections(next);
    setNewName("");
    setShowNew(false);
  };
  const deleteCollection = (id: string) => {
    const next = collections.filter((c) => c.id !== id);
    storage.set("folio_collections", next);
    onUpdateCollections(next);
    if (activeCollection === id) setActiveCollection(null);
  };

  const getEntries = (cid: string | null) =>
    cid === null
      ? myEntries.filter((e) => !e.collectionId)
      : myEntries.filter((e) => e.collectionId === cid);
  const displayed =
    activeCollection !== undefined ? getEntries(activeCollection) : myEntries;

  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)" }}>
      <AppNav
        user={user}
        onNav={onNav}
        onNewEntry={onNewEntry}
        activeMenuItems={["collections"]}
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "240px 1fr",
          minHeight: "calc(100vh - 60px)",
        }}
      >
        {/* Sidebar */}
        <aside
          style={{
            borderRight: "1px solid rgba(26,20,16,0.08)",
            background: "#fffdf8",
            padding: "2rem 0",
          }}
        >
          <div style={{ padding: "0 1.25rem", marginBottom: "1.5rem" }}>
            <p
              style={{
                fontFamily: "'DM Mono',monospace",
                fontSize: "0.65rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "#7a6f62",
                marginBottom: "0.8rem",
              }}
            >
              Notebooks
            </p>
            {/* All entries */}
            <div
              onClick={() =>
                setActiveCollection(undefined as unknown as string)
              }
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                padding: "0.6rem 0.75rem",
                borderRadius: "2px",
                cursor: "pointer",
                background:
                  activeCollection === undefined
                    ? "rgba(200,135,58,0.1)"
                    : "transparent",
                marginBottom: "0.2rem",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => {
                if (activeCollection !== undefined)
                  (e.currentTarget as HTMLDivElement).style.background =
                    "#f5f0e8";
              }}
              onMouseLeave={(e) => {
                if (activeCollection !== undefined)
                  (e.currentTarget as HTMLDivElement).style.background =
                    "transparent";
              }}
            >
              <span style={{ fontSize: "1rem" }}>📋</span>
              <span
                style={{
                  fontFamily: "'DM Mono',monospace",
                  fontSize: "0.75rem",
                  color:
                    activeCollection === undefined ? "#c8873a" : "var(--ink)",
                  fontWeight: activeCollection === undefined ? 500 : 400,
                }}
              >
                All entries
              </span>
              <span
                style={{
                  marginLeft: "auto",
                  fontFamily: "'DM Mono',monospace",
                  fontSize: "0.65rem",
                  color: "#7a6f62",
                }}
              >
                {myEntries.length}
              </span>
            </div>
            {/* Uncategorized */}
            {myEntries.filter((e) => !e.collectionId).length > 0 && (
              <div
                onClick={() => setActiveCollection(null)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  padding: "0.6rem 0.75rem",
                  borderRadius: "2px",
                  cursor: "pointer",
                  background:
                    activeCollection === null
                      ? "rgba(200,135,58,0.1)"
                      : "transparent",
                  marginBottom: "0.2rem",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (activeCollection !== null)
                    (e.currentTarget as HTMLDivElement).style.background =
                      "#f5f0e8";
                }}
                onMouseLeave={(e) => {
                  if (activeCollection !== null)
                    (e.currentTarget as HTMLDivElement).style.background =
                      "transparent";
                }}
              >
                <span style={{ fontSize: "1rem" }}>📄</span>
                <span
                  style={{
                    fontFamily: "'DM Mono',monospace",
                    fontSize: "0.75rem",
                    color: activeCollection === null ? "#c8873a" : "var(--ink)",
                    fontWeight: activeCollection === null ? 500 : 400,
                  }}
                >
                  Uncategorized
                </span>
                <span
                  style={{
                    marginLeft: "auto",
                    fontFamily: "'DM Mono',monospace",
                    fontSize: "0.65rem",
                    color: "#7a6f62",
                  }}
                >
                  {myEntries.filter((e) => !e.collectionId).length}
                </span>
              </div>
            )}
          </div>
          {/* Collection list */}
          <div style={{ padding: "0 1.25rem" }}>
            {myCollections.map((c) => {
              const count = getEntries(c.id).length;
              const isActive = activeCollection === c.id;
              return (
                <div
                  key={c.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    padding: "0.6rem 0.75rem",
                    borderRadius: "2px",
                    cursor: "pointer",
                    background: isActive
                      ? "rgba(200,135,58,0.1)"
                      : "transparent",
                    marginBottom: "0.2rem",
                    position: "relative",
                    transition: "background 0.15s",
                  }}
                  onClick={() => setActiveCollection(c.id)}
                  onMouseEnter={(e) => {
                    if (!isActive)
                      (e.currentTarget as HTMLDivElement).style.background =
                        "#f5f0e8";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive)
                      (e.currentTarget as HTMLDivElement).style.background =
                        "transparent";
                  }}
                >
                  <span style={{ fontSize: "1rem" }}>{c.emoji}</span>
                  <span
                    style={{
                      fontFamily: "'DM Mono',monospace",
                      fontSize: "0.75rem",
                      color: isActive ? "#c8873a" : "var(--ink)",
                      fontWeight: isActive ? 500 : 400,
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {c.name}
                  </span>
                  <span
                    style={{
                      fontFamily: "'DM Mono',monospace",
                      fontSize: "0.65rem",
                      color: "#7a6f62",
                    }}
                  >
                    {count}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCollection(c.id);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#ccc",
                      fontSize: "0.75rem",
                      padding: "0 0.1rem",
                      opacity: 0,
                      position: "absolute",
                      right: "0.5rem",
                    }}
                    className="del-btn"
                    onMouseEnter={(ev) =>
                      ((ev.currentTarget as HTMLButtonElement).style.color =
                        "#c0392b")
                    }
                    onMouseLeave={(ev) =>
                      ((ev.currentTarget as HTMLButtonElement).style.color =
                        "#ccc")
                    }
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
          {/* New collection */}
          <div style={{ padding: "0 1.25rem", marginTop: "1rem" }}>
            {!showNew && (
              <button
                onClick={() => setShowNew(true)}
                style={{
                  background: "transparent",
                  border: "1px dashed rgba(26,20,16,0.2)",
                  borderRadius: "2px",
                  padding: "0.5rem 0.75rem",
                  fontFamily: "'DM Mono',monospace",
                  fontSize: "0.72rem",
                  color: "#7a6f62",
                  cursor: "pointer",
                  width: "100%",
                  textAlign: "left",
                }}
              >
                + New notebook
              </button>
            )}
            {showNew && (
              <div
                style={{
                  background: "var(--paper)",
                  border: "1px solid rgba(26,20,16,0.12)",
                  borderRadius: "2px",
                  padding: "0.75rem",
                }}
              >
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Notebook name…"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") createCollection();
                    if (e.key === "Escape") setShowNew(false);
                  }}
                  style={{
                    marginBottom: "0.5rem",
                    fontSize: "0.78rem",
                    padding: "0.4rem 0.6rem",
                  }}
                  autoFocus
                />
                <div
                  style={{
                    display: "flex",
                    gap: "0.3rem",
                    marginBottom: "0.5rem",
                    flexWrap: "wrap",
                  }}
                >
                  {COLLECTION_EMOJIS.map((em) => (
                    <button
                      key={em}
                      onClick={() => setNewEmoji(em)}
                      style={{
                        fontSize: "1rem",
                        background:
                          newEmoji === em
                            ? "rgba(200,135,58,0.15)"
                            : "transparent",
                        border:
                          newEmoji === em
                            ? "1px solid #c8873a"
                            : "1px solid transparent",
                        borderRadius: "4px",
                        padding: "0.1rem 0.2rem",
                        cursor: "pointer",
                      }}
                    >
                      {em}
                    </button>
                  ))}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "0.3rem",
                    marginBottom: "0.6rem",
                  }}
                >
                  {COLLECTION_COLORS.map((col) => (
                    <button
                      key={col}
                      onClick={() => setNewColor(col)}
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        background: col,
                        border:
                          newColor === col
                            ? "3px solid #1a1410"
                            : "2px solid transparent",
                        cursor: "pointer",
                      }}
                    />
                  ))}
                </div>
                <div style={{ display: "flex", gap: "0.4rem" }}>
                  <button
                    onClick={createCollection}
                    style={{
                      background: "#1a1410",
                      color: "#f5f0e8",
                      border: "none",
                      padding: "0.4rem 0.8rem",
                      fontFamily: "'DM Mono',monospace",
                      fontSize: "0.7rem",
                      cursor: "pointer",
                      borderRadius: "2px",
                      flex: 1,
                    }}
                  >
                    Create
                  </button>
                  <button
                    onClick={() => setShowNew(false)}
                    style={{
                      background: "transparent",
                      border: "1px solid rgba(26,20,16,0.15)",
                      padding: "0.4rem 0.8rem",
                      fontFamily: "'DM Mono',monospace",
                      fontSize: "0.7rem",
                      cursor: "pointer",
                      borderRadius: "2px",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main content */}
        <main style={{ padding: "2.5rem 3rem", maxWidth: 680 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1.5rem",
            }}
          >
            <div>
              {activeCollection === undefined && (
                <h2
                  style={{
                    fontFamily: "'Playfair Display',serif",
                    fontSize: "1.4rem",
                    fontWeight: 700,
                    color: "var(--ink)",
                  }}
                >
                  All entries
                </h2>
              )}
              {activeCollection === null && (
                <h2
                  style={{
                    fontFamily: "'Playfair Display',serif",
                    fontSize: "1.4rem",
                    fontWeight: 700,
                    color: "var(--ink)",
                  }}
                >
                  Uncategorized
                </h2>
              )}
              {activeCollection &&
                myCollections.find((c) => c.id === activeCollection) &&
                (() => {
                  const col = myCollections.find(
                    (c) => c.id === activeCollection,
                  )!;
                  return (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.6rem",
                      }}
                    >
                      <span style={{ fontSize: "1.4rem" }}>{col.emoji}</span>
                      <h2
                        style={{
                          fontFamily: "'Playfair Display',serif",
                          fontSize: "1.4rem",
                          fontWeight: 700,
                          color: "var(--ink)",
                        }}
                      >
                        {col.name}
                      </h2>
                    </div>
                  );
                })()}
              <p
                style={{
                  fontFamily: "'DM Mono',monospace",
                  fontSize: "0.7rem",
                  color: "#7a6f62",
                  marginTop: "0.2rem",
                }}
              >
                {
                  displayed.sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime(),
                  ).length
                }{" "}
                entries
              </p>
            </div>
          </div>

          {/* Empty state */}
          {displayed.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "4rem 2rem",
                border: "1px dashed rgba(26,20,16,0.15)",
                borderRadius: "2px",
              }}
            >
              {myCollections.length === 0 && activeCollection === undefined ? (
                <>
                  <p
                    style={{
                      fontFamily: "'Playfair Display',serif",
                      fontSize: "1.1rem",
                      fontStyle: "italic",
                      color: "var(--ink)",
                      marginBottom: "0.6rem",
                    }}
                  >
                    Organize your writing.
                  </p>
                  <p
                    style={{
                      fontFamily: "'DM Mono',monospace",
                      fontSize: "0.72rem",
                      color: "#7a6f62",
                      marginBottom: "1.2rem",
                    }}
                  >
                    Create a notebook to group related entries — travel,
                    therapy, work, dreams.
                  </p>
                  <button
                    onClick={() => setShowNew(true)}
                    style={{
                      background: "#c8873a",
                      color: "#fff",
                      border: "none",
                      padding: "0.6rem 1.3rem",
                      fontFamily: "'DM Mono',monospace",
                      fontSize: "0.75rem",
                      cursor: "pointer",
                      borderRadius: "2px",
                    }}
                  >
                    Create your first notebook
                  </button>
                </>
              ) : (
                <>
                  <p
                    style={{
                      fontFamily: "'DM Mono',monospace",
                      fontSize: "0.75rem",
                      color: "#7a6f62",
                      marginBottom: "1rem",
                    }}
                  >
                    No entries here yet.
                  </p>
                  <button
                    onClick={onNewEntry}
                    style={{
                      background: "#c8873a",
                      color: "#fff",
                      border: "none",
                      padding: "0.6rem 1.3rem",
                      fontFamily: "'DM Mono',monospace",
                      fontSize: "0.75rem",
                      cursor: "pointer",
                      borderRadius: "2px",
                    }}
                  >
                    Write an entry →
                  </button>
                </>
              )}
            </div>
          )}

          {/* Entries */}
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {displayed
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime(),
              )
              .map((e) => (
                <EntryCard
                  key={e.id}
                  entry={e}
                  onClick={() => onSelectEntry(e.id)}
                />
              ))}
          </div>
        </main>
      </div>
      <style>{`.del-btn { opacity: 0 !important; } div:hover > .del-btn { opacity: 1 !important; }`}</style>
    </div>
  );
}

export { CollectionsPage };
