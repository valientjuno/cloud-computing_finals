"use client";
import type { User } from "../types";

function Avatar({ user, onClick }: { user: User; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        background: "#c8873a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        color: "#fff",
        fontFamily: "'DM Mono',monospace",
        fontSize: "0.75rem",
        fontWeight: 500,
        flexShrink: 0,
      }}
    >
      {user.name.slice(0, 2).toUpperCase()}
    </div>
  );
}

export { Avatar };
