"use client";
import { useState } from "react";

function TagInput({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (t: string[]) => void;
}) {
  const [inp, setInp] = useState("");
  const add = () => {
    const t = inp.trim().toLowerCase();
    if (t && !tags.includes(t) && tags.length < 6) {
      onChange([...tags, t]);
      setInp("");
    }
  };
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.4rem",
        flexWrap: "wrap",
      }}
    >
      {tags.map((t) => (
        <span
          key={t}
          style={{
            background: "rgba(200,135,58,0.15)",
            color: "#c8873a",
            fontFamily: "'DM Mono',monospace",
            fontSize: "0.7rem",
            padding: "0.2rem 0.6rem",
            borderRadius: "2px",
            display: "flex",
            alignItems: "center",
            gap: "0.3rem",
          }}
        >
          {t}
          <span
            onClick={() => onChange(tags.filter((x) => x !== t))}
            style={{ cursor: "pointer", opacity: 0.6, fontSize: "0.9rem" }}
          >
            ×
          </span>
        </span>
      ))}
      {tags.length < 6 && (
        <input
          value={inp}
          onChange={(e) => setInp(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="add tag…"
          style={{
            border: "none",
            background: "transparent",
            fontFamily: "'DM Mono',monospace",
            fontSize: "0.75rem",
            color: "var(--ink)",
            outline: "none",
            width: "80px",
            padding: "0.2rem 0",
          }}
        />
      )}
    </div>
  );
}

export { TagInput };
