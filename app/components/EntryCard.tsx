"use client";
import type { Entry } from "../types";
import { MOOD_LABELS } from "../constants";
import { fmtShort, excerpt } from "../utils";

function EntryCard({ entry, onClick }: { entry: Entry; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "var(--card-bg)",
        border: "1px solid rgba(26,20,16,0.08)",
        borderRadius: "2px",
        padding: "1.5rem 1.75rem",
        cursor: "pointer",
        transition: "transform 0.18s,box-shadow 0.18s",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform =
          "translateY(-2px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 6px 24px rgba(26,20,16,0.1)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "";
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "0.5rem",
        }}
      >
        <span
          style={{
            fontFamily: "'DM Mono',monospace",
            fontSize: "0.68rem",
            color: "#7a6f62",
            letterSpacing: "0.06em",
          }}
        >
          {fmtShort(entry.createdAt)}
        </span>
        <span style={{ fontSize: "1.1rem" }}>{entry.mood}</span>
      </div>
      <h3
        style={{
          fontFamily: "'Playfair Display',serif",
          fontSize: "1.15rem",
          fontWeight: 700,
          marginBottom: "0.5rem",
          color: "var(--ink)",
        }}
      >
        {entry.title || "Untitled"}
      </h3>
      <p
        style={{
          fontSize: "0.88rem",
          lineHeight: 1.6,
          color: "#7a6f62",
          marginBottom: "0.8rem",
        }}
      >
        {excerpt(entry.content)}
      </p>
      {entry.tags.length > 0 && (
        <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
          {entry.tags.map((t) => (
            <span
              key={t}
              style={{
                background: "rgba(200,135,58,0.12)",
                color: "#c8873a",
                fontFamily: "'DM Mono',monospace",
                fontSize: "0.65rem",
                padding: "0.15rem 0.5rem",
                borderRadius: "2px",
              }}
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// Shared top nav for authenticated pages

export { EntryCard };
