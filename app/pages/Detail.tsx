"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type { User, Entry, Collection, Page } from "../types";
import { MOODS, MOOD_LABELS, COLLECTION_COLORS, COLLECTION_EMOJIS, SAMPLE_ENTRIES } from "../constants";
import { storage, fmtDate, fmtShort, excerpt, uid, streakCount, isoDay } from "../utils";
import { Logo } from "../components/Logo";
import { Avatar } from "../components/Avatar";
import { MoodPicker } from "../components/MoodPicker";
import { TagInput } from "../components/TagInput";
import { EntryCard } from "../components/EntryCard";
import { AppNav } from "../components/AppNav";

function Detail({
  entry,
  collections,
  onBack,
  onEdit,
  onDelete,
}: {
  entry: Entry;
  collections: Collection[];
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [confirmDel, setConfirmDel] = useState(false);
  const collection = collections.find((c) => c.id === entry.collectionId);
  return (
    <div style={{ minHeight: "100vh", background: "#faf7f2" }}>
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1rem 5%",
          borderBottom: "1px solid rgba(26,20,16,0.08)",
          position: "sticky",
          top: 0,
          background: "rgba(250,247,242,0.95)",
          backdropFilter: "blur(12px)",
          zIndex: 100,
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "'DM Mono',monospace",
            fontSize: "0.72rem",
            color: "#7a6f62",
            padding: 0,
          }}
        >
          ← All entries
        </button>
        <div style={{ display: "flex", gap: "0.6rem" }}>
          <button
            onClick={onEdit}
            style={{
              background: "transparent",
              border: "1px solid rgba(26,20,16,0.15)",
              padding: "0.4rem 0.9rem",
              fontFamily: "'DM Mono',monospace",
              fontSize: "0.72rem",
              color: "#1a1410",
              cursor: "pointer",
              borderRadius: "2px",
            }}
          >
            Edit
          </button>
          <button
            onClick={() => setConfirmDel(true)}
            style={{
              background: "transparent",
              border: "1px solid rgba(192,57,43,0.3)",
              padding: "0.4rem 0.9rem",
              fontFamily: "'DM Mono',monospace",
              fontSize: "0.72rem",
              color: "#c0392b",
              cursor: "pointer",
              borderRadius: "2px",
            }}
          >
            Delete
          </button>
        </div>
      </nav>
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "3rem 5%" }}>
        <p
          style={{
            fontFamily: "'DM Mono',monospace",
            fontSize: "0.7rem",
            letterSpacing: "0.08em",
            color: "#c8873a",
            textTransform: "uppercase",
            marginBottom: "0.8rem",
          }}
        >
          {fmtDate(entry.createdAt)}
        </p>
        {collection && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              background: "rgba(26,20,16,0.05)",
              padding: "0.3rem 0.8rem",
              borderRadius: "2px",
              marginBottom: "1rem",
              fontFamily: "'DM Mono',monospace",
              fontSize: "0.68rem",
              color: "#7a6f62",
            }}
          >
            {collection.emoji} {collection.name}
          </div>
        )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.8rem",
            marginBottom: "1.5rem",
          }}
        >
          <h1
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: "clamp(1.6rem,3vw,2.2rem)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "#1a1410",
              flex: 1,
            }}
          >
            {entry.title || "Untitled"}
          </h1>
          <span style={{ fontSize: "1.6rem" }}>{entry.mood}</span>
        </div>
        {entry.tags.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: "0.4rem",
              flexWrap: "wrap",
              marginBottom: "2rem",
            }}
          >
            {entry.tags.map((t) => (
              <span
                key={t}
                style={{
                  background: "rgba(200,135,58,0.12)",
                  color: "#c8873a",
                  fontFamily: "'DM Mono',monospace",
                  fontSize: "0.68rem",
                  padding: "0.2rem 0.6rem",
                  borderRadius: "2px",
                }}
              >
                {t}
              </span>
            ))}
          </div>
        )}
        <div
          style={{
            fontFamily: "'Lora',serif",
            fontSize: "1.05rem",
            lineHeight: 1.85,
            color: "#1a1410",
            whiteSpace: "pre-wrap",
          }}
        >
          {entry.content}
        </div>
        {entry.updatedAt !== entry.createdAt && (
          <p
            style={{
              fontFamily: "'DM Mono',monospace",
              fontSize: "0.65rem",
              color: "#7a6f62",
              marginTop: "3rem",
              paddingTop: "1.5rem",
              borderTop: "1px solid rgba(26,20,16,0.08)",
            }}
          >
            Last edited {fmtShort(entry.updatedAt)}
          </p>
        )}
      </main>
      {confirmDel && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(26,20,16,0.45)",
            zIndex: 500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#fffdf8",
              border: "1px solid rgba(26,20,16,0.1)",
              borderRadius: "3px",
              padding: "2rem",
              maxWidth: 360,
              width: "90%",
              textAlign: "center",
            }}
          >
            <h3
              style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: "1.2rem",
                fontWeight: 700,
                marginBottom: "0.6rem",
              }}
            >
              Delete this entry?
            </h3>
            <p
              style={{
                fontFamily: "'DM Mono',monospace",
                fontSize: "0.75rem",
                color: "#7a6f62",
                marginBottom: "1.5rem",
              }}
            >
              This can't be undone.
            </p>
            <div
              style={{
                display: "flex",
                gap: "0.6rem",
                justifyContent: "center",
              }}
            >
              <button
                onClick={() => setConfirmDel(false)}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(26,20,16,0.2)",
                  padding: "0.6rem 1.2rem",
                  fontFamily: "'DM Mono',monospace",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  borderRadius: "2px",
                }}
              >
                Cancel
              </button>
              <button
                onClick={onDelete}
                style={{
                  background: "#c0392b",
                  color: "#fff",
                  border: "none",
                  padding: "0.6rem 1.2rem",
                  fontFamily: "'DM Mono',monospace",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  borderRadius: "2px",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


export { Detail };
