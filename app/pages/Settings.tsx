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

function Settings({
  user,
  onUpdate,
  onBack,
  onLogout,
}: {
  user: User;
  onUpdate: (u: User) => void;
  onBack: () => void;
  onLogout: () => void;
}) {
  const [name, setName] = useState(user.name);
  const [pass, setPass] = useState("");
  const [passConf, setPassConf] = useState("");
  const [notif, setNotif] = useState(user.notifications);
  const [saved, setSaved] = useState(false);
  const save = () => {
    if (pass && pass !== passConf) {
      _toast?.("Passwords don't match", "err");
      return;
    }
    if (pass && pass.length < 6) {
      _toast?.("Password must be 6+ characters", "err");
      return;
    }
    const updated = {
      ...user,
      name: name || user.name,
      password: pass || user.password,
      notifications: notif,
    };
    const users: User[] = storage.get("folio_users") || [];
    storage.set(
      "folio_users",
      users.map((u) => (u.id === user.id ? updated : u)),
    );
    onUpdate(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    _toast?.("Settings saved ✓");
  };
  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)" }}>
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1rem 5%",
          borderBottom: "1px solid rgba(26,20,16,0.08)",
          position: "sticky",
          top: 0,
          background: "rgba(245,240,232,0.95)",
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
          ← Back
        </button>
        <Logo onClick={onBack} />
        <div style={{ width: 60 }} />
      </nav>
      <main style={{ maxWidth: 560, margin: "0 auto", padding: "3rem 5%" }}>
        <h1
          style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: "1.8rem",
            fontWeight: 700,
            marginBottom: "0.4rem",
            color: "var(--ink)",
          }}
        >
          Settings
        </h1>
        <p
          style={{
            fontFamily: "'DM Mono',monospace",
            fontSize: "0.72rem",
            color: "#7a6f62",
            marginBottom: "2.5rem",
          }}
        >
          {user.email}
        </p>
        {[
          {
            label: "Display name",
            val: name,
            set: setName,
            type: "text",
            ph: "Your name",
          },
          {
            label: "New password",
            val: pass,
            set: setPass,
            type: "password",
            ph: "Leave blank to keep current",
          },
          {
            label: "Confirm password",
            val: passConf,
            set: setPassConf,
            type: "password",
            ph: "Repeat new password",
          },
        ].map((f) => (
          <div key={f.label} style={{ marginBottom: "1.2rem" }}>
            <label
              style={{
                display: "block",
                fontFamily: "'DM Mono',monospace",
                fontSize: "0.68rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#7a6f62",
                marginBottom: "0.4rem",
              }}
            >
              {f.label}
            </label>
            <input
              value={f.val}
              onChange={(e) => f.set(e.target.value)}
              type={f.type}
              placeholder={f.ph}
              style={{ ...inputStyle, width: "100%" }}
            />
          </div>
        ))}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1rem 0",
            borderTop: "1px solid rgba(26,20,16,0.08)",
            borderBottom: "1px solid rgba(26,20,16,0.08)",
            marginBottom: "2rem",
          }}
        >
          <div>
            <p
              style={{
                fontFamily: "'DM Mono',monospace",
                fontSize: "0.75rem",
                color: "#1a1410",
                marginBottom: "0.2rem",
              }}
            >
              Daily reminders
            </p>
            <p
              style={{
                fontFamily: "'DM Mono',monospace",
                fontSize: "0.68rem",
                color: "#7a6f62",
              }}
            >
              Gentle nudge to write each day
            </p>
          </div>
          <div
            onClick={() => setNotif((o) => !o)}
            style={{
              width: 44,
              height: 24,
              borderRadius: 12,
              background: notif ? "#c8873a" : "rgba(26,20,16,0.15)",
              cursor: "pointer",
              position: "relative",
              transition: "background 0.25s",
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: 9,
                background: "#fff",
                position: "absolute",
                top: 3,
                left: notif ? "calc(100% - 21px)" : 3,
                transition: "left 0.25s",
              }}
            />
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
          <button
            onClick={save}
            style={{
              background: "#1a1410",
              color: "#f5f0e8",
              border: "none",
              padding: "0.75rem 1.5rem",
              fontFamily: "'DM Mono',monospace",
              fontSize: "0.78rem",
              cursor: "pointer",
              borderRadius: "2px",
            }}
          >
            {saved ? "Saved ✓" : "Save changes"}
          </button>
          <button
            onClick={onLogout}
            style={{
              background: "transparent",
              color: "#c0392b",
              border: "1px solid rgba(192,57,43,0.3)",
              padding: "0.75rem 1.5rem",
              fontFamily: "'DM Mono',monospace",
              fontSize: "0.78rem",
              cursor: "pointer",
              borderRadius: "2px",
            }}
          >
            Sign out
          </button>
        </div>
      </main>
    </div>
  );
}


export { Settings };
