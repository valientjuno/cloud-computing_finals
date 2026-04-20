"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { User, Entry, Collection, Page } from "../types";
import { fmtDate } from "../utils";
import { MoodPicker } from "../components/MoodPicker";
import { TagInput } from "../components/TagInput";

function Editor({
  user,
  entries,
  collections,
  editId,
  onSave,
  onNav,
  onBack,
}: {
  user: User;
  entries: Entry[];
  collections: Collection[];
  editId: string | null;
  onSave: (e: Entry) => Promise<void>;
  onNav: (p: Page) => void;
  onBack: () => void;
}) {
  const existing = editId ? entries.find((e) => e.id === editId) || null : null;
  const [title, setTitle] = useState(existing?.title || "");
  const [content, setContent] = useState(existing?.content || "");
  const [mood, setMood] = useState(existing?.mood || "😊");
  const [tags, setTags] = useState<string[]>(existing?.tags || []);
  const [collectionId, setCollectionId] = useState<string | undefined>(
    existing?.collectionId,
  );
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle",
  );
  const [wordCount, setWordCount] = useState(0);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const myCollections = collections.filter((c) => c.userId === user.id);

  useEffect(() => {
    setWordCount(content.trim() ? content.trim().split(/\s+/).length : 0);
  }, [content]);

  const save = useCallback(async () => {
    if (!content.trim() && !title.trim()) return;

    setSaveStatus("saving");

    const entry: Entry = {
      id: existing?.id || editId || "",
      userId: user.id,
      title: title || "Untitled",
      content,
      mood,
      tags,
      collectionId,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await onSave(entry);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("idle");
    }
  }, [
    title,
    content,
    mood,
    tags,
    collectionId,
    editId,
    user.id,
    existing,
    onSave,
  ]);

  const applyFmt = (before: string, after: string) => {
    const ta = taRef.current;
    if (!ta) return;

    const s = ta.selectionStart;
    const e = ta.selectionEnd;
    const sel = content.slice(s, e);
    const nc = content.slice(0, s) + before + sel + after + content.slice(e);

    setContent(nc);

    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(s + before.length, e + before.length);
    }, 0);
  };

  const prompts = [
    "What made you pause today?",
    "Describe a moment that surprised you.",
    "What are you grateful for right now?",
    "What would you tell your past self?",
    "What's taking up the most space in your mind?",
  ];

  const [prompt] = useState(
    prompts[Math.floor(Math.random() * prompts.length)],
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#faf7f2",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1rem 5%",
          borderBottom: "1px solid rgba(26,20,16,0.08)",
          background: "rgba(250,247,242,0.95)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
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
            ← Back
          </button>

          <span
            style={{
              fontFamily: "'DM Mono',monospace",
              fontSize: "0.68rem",
              color: "rgba(26,20,16,0.2)",
            }}
          >
            |
          </span>

          <span
            style={{
              fontFamily: "'DM Mono',monospace",
              fontSize: "0.68rem",
              color: "#7a6f62",
            }}
          >
            {wordCount} words
          </span>

          {myCollections.length > 0 && (
            <select
              value={collectionId || ""}
              onChange={(e) => setCollectionId(e.target.value || undefined)}
              style={{
                border: "1px solid rgba(26,20,16,0.15)",
                background: "transparent",
                fontFamily: "'DM Mono',monospace",
                fontSize: "0.68rem",
                color: "#7a6f62",
                padding: "0.2rem 0.4rem",
                borderRadius: "2px",
                cursor: "pointer",
                outline: "none",
              }}
            >
              <option value="">No collection</option>
              {myCollections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
          {saveStatus !== "idle" && (
            <span
              style={{
                fontFamily: "'DM Mono',monospace",
                fontSize: "0.68rem",
                color: saveStatus === "saved" ? "#6b7c5e" : "#7a6f62",
              }}
            >
              {saveStatus === "saving" ? "Saving…" : "Saved ✓"}
            </span>
          )}

          <button
            onClick={() => void save()}
            style={{
              background: "#1a1410",
              color: "#f5f0e8",
              border: "none",
              padding: "0.5rem 1.2rem",
              fontFamily: "'DM Mono',monospace",
              fontSize: "0.75rem",
              letterSpacing: "0.04em",
              cursor: "pointer",
              borderRadius: "2px",
            }}
          >
            Save
          </button>
        </div>
      </nav>

      <main
        style={{
          flex: 1,
          maxWidth: 720,
          margin: "0 auto",
          width: "100%",
          padding: "3rem 5%",
        }}
      >
        <p
          style={{
            fontFamily: "'DM Mono',monospace",
            fontSize: "0.7rem",
            letterSpacing: "0.08em",
            color: "#c8873a",
            textTransform: "uppercase",
            marginBottom: "1.2rem",
          }}
        >
          {fmtDate(existing?.createdAt || new Date().toISOString())}
        </p>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give this entry a title…"
          style={{
            width: "100%",
            border: "none",
            background: "transparent",
            fontFamily: "'Playfair Display',serif",
            fontSize: "clamp(1.6rem,3vw,2.2rem)",
            fontWeight: 700,
            color: "#1a1410",
            outline: "none",
            marginBottom: "0.8rem",
            letterSpacing: "-0.02em",
            boxSizing: "border-box",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.3rem",
            padding: "0.5rem 0",
            borderTop: "1px solid rgba(26,20,16,0.08)",
            borderBottom: "1px solid rgba(26,20,16,0.08)",
            marginBottom: "1.5rem",
            flexWrap: "wrap",
          }}
        >
          {[
            { label: "B", fmt: ["**", "**"] },
            { label: "I", fmt: ["_", "_"] },
          ].map((t) => (
            <button
              key={t.label}
              onClick={() => applyFmt(t.fmt[0], t.fmt[1])}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily:
                  t.label === "B" ? "'Playfair Display',serif" : "'Lora',serif",
                fontWeight: t.label === "B" ? 700 : 400,
                fontStyle: t.label === "I" ? "italic" : "normal",
                fontSize: "0.9rem",
                color: "#7a6f62",
                padding: "0.25rem 0.5rem",
                borderRadius: "2px",
              }}
            >
              {t.label}
            </button>
          ))}

          <div
            style={{
              width: 1,
              height: 16,
              background: "rgba(26,20,16,0.12)",
              margin: "0 0.2rem",
            }}
          />

          <MoodPicker value={mood} onChange={setMood} />

          <div style={{ marginLeft: "auto" }}>
            <TagInput tags={tags} onChange={setTags} />
          </div>
        </div>

        {!content && (
          <p
            style={{
              fontFamily: "'Playfair Display',serif",
              fontStyle: "italic",
              fontSize: "1rem",
              color: "rgba(26,20,16,0.25)",
              marginBottom: "0.8rem",
              pointerEvents: "none",
            }}
          >
            {prompt}
          </p>
        )}

        <textarea
          ref={taRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing…"
          style={{
            width: "100%",
            minHeight: 480,
            border: "none",
            background: "transparent",
            fontFamily: "'Lora',serif",
            fontSize: "1.05rem",
            lineHeight: 1.8,
            color: "#1a1410",
            outline: "none",
            resize: "none",
            boxSizing: "border-box",
          }}
        />
      </main>
    </div>
  );
}

export { Editor };
