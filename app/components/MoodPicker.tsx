"use client";
import { MOODS } from "../constants";

function MoodPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (m: string) => void;
}) {
  return (
    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
      {MOODS.map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          style={{
            fontSize: "1.3rem",
            background: m === value ? "rgba(200,135,58,0.2)" : "transparent",
            border:
              m === value ? "1.5px solid #c8873a" : "1.5px solid transparent",
            borderRadius: "6px",
            padding: "0.2rem 0.3rem",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          {m}
        </button>
      ))}
    </div>
  );
}

export { MoodPicker };
