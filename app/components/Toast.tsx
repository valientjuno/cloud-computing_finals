"use client";
import { useState, useEffect } from "react";

// ─── Global toast ─────────────────────────────────────────
let _toast: ((msg: string, type?: "ok" | "err") => void) | null = null;
function Toast({
  register,
}: {
  register: (fn: (m: string, t?: "ok" | "err") => void) => void;
}) {
  const [msg, setMsg] = useState("");
  const [type, setType] = useState<"ok" | "err">("ok");
  const [vis, setVis] = useState(false);
  useEffect(() => {
    register((m, t = "ok") => {
      setMsg(m);
      setType(t);
      setVis(true);
      setTimeout(() => setVis(false), 2200);
    });
  }, [register]);
  return (
    <div
      style={{
        position: "fixed",
        bottom: "2rem",
        left: "50%",
        transform: `translateX(-50%) translateY(${vis ? 0 : "80px"})`,
        transition: "transform 0.35s cubic-bezier(.34,1.56,.64,1)",
        background: type === "ok" ? "#1a1410" : "#c0392b",
        color: "#f5f0e8",
        padding: "0.65rem 1.5rem",
        borderRadius: "2px",
        fontFamily: "'DM Mono',monospace",
        fontSize: "0.78rem",
        letterSpacing: "0.04em",
        zIndex: 9999,
        whiteSpace: "nowrap",
        pointerEvents: "none",
      }}
    >
      {msg}
    </div>
  );
}

export { Toast, _toast };
