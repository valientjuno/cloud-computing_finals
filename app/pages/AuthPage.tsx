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

function AuthPage({
  mode,
  onNav,
  onAuth,
}: {
  mode: "login" | "signup";
  onNav: (p: Page) => void;
  onAuth: (u: User) => void;
}) {
  const [step, setStep] = useState<"email" | "password">("email");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const isLogin = mode === "login";
  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.9rem 1rem",
    border: "1px solid rgba(26,20,16,0.12)",
    borderRadius: "2px",
    background: "#fffdf9",
    color: "#1a1410",
    fontFamily: "'DM Mono', monospace",
    fontSize: "0.78rem",
    outline: "none",
  };
  const submit = () => {
    if (step === "email") {
      if (!email.includes("@")) {
        setErr("Enter a valid email.");
        return;
      }
      setErr("");
      setStep("password");
      return;
    }
    if (pass.length < 6) {
      setErr("Password must be 6+ characters.");
      return;
    }
    const users: User[] = storage.get("folio_users") || [];
    if (isLogin) {
      const u = users.find((u) => u.email === email && u.password === pass);
      if (!u) {
        setErr("Email or password incorrect.");
        return;
      }
      storage.set("folio_current", u.id);
      onAuth(u);
    } else {
      if (users.find((u) => u.email === email)) {
        setErr("Email already registered.");
        return;
      }
      const newU: User = {
        id: uid(),
        name: name || email.split("@")[0],
        email,
        password: pass,
        avatar: "",
        notifications: true,
      };
      storage.set("folio_users", [...users, newU]);
      const existingEntries: Entry[] = storage.get("folio_entries") || [];
      storage.set("folio_entries", [
        ...existingEntries,
        ...SAMPLE_ENTRIES.map((e) => ({ ...e, userId: newU.id, id: uid() })),
      ]);
      storage.set("folio_current", newU.id);
      onAuth(newU);
    }
  };
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--paper)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1.1rem 5%",
          borderBottom: "1px solid rgba(26,20,16,0.08)",
        }}
      >
        <Logo onClick={() => onNav("landing")} />
        <span
          onClick={() => onNav(isLogin ? "signup" : "login")}
          style={{
            fontFamily: "'DM Mono',monospace",
            fontSize: "0.7rem",
            letterSpacing: "0.06em",
            color: "#7a6f62",
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          {isLogin ? "Create account" : "Already have an account?"}
        </span>
      </nav>
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "3rem 1rem",
        }}
      >
        <div style={{ width: "100%", maxWidth: 400 }}>
          <h1
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: "2rem",
              fontWeight: 700,
              fontStyle: "italic",
              marginBottom: "0.4rem",
              color: "var(--ink)",
            }}
          >
            {isLogin ? "Welcome back." : "Begin your story."}
          </h1>
          <p
            style={{
              fontFamily: "'DM Mono',monospace",
              fontSize: "0.72rem",
              color: "#7a6f62",
              letterSpacing: "0.05em",
              marginBottom: "2.5rem",
            }}
          >
            {isLogin
              ? "Sign in to continue writing."
              : "Create your free account."}
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.6rem",
              marginBottom: "1.5rem",
            }}
          >
            {/* add google and apple OAuth */}
            {/* {["Continue with Google", "Continue with Apple"].map((l) => (
              <button
                key={l}
                onClick={() => _toast?.("Social login coming soon", "err")}
                style={{
                  background: "#fff",
                  border: "1px solid rgba(26,20,16,0.15)",
                  padding: "0.65rem",
                  fontFamily: "'DM Mono',monospace",
                  fontSize: "0.68rem",
                  color: "#1a1410",
                  cursor: "pointer",
                  borderRadius: "2px",
                  letterSpacing: "0.03em",
                }}
              >
                {l}
              </button>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.8rem",
              marginBottom: "1.5rem",
            }}
          >
            <div
              style={{ flex: 1, height: 1, background: "rgba(26,20,16,0.1)" }}
            />
            <span
              style={{
                fontFamily: "'DM Mono',monospace",
                fontSize: "0.65rem",
                color: "#7a6f62",
              }}
            >
              or
            </span> */}
            <div
              style={{ flex: 1, height: 1, background: "rgba(26,20,16,0.1)" }}
            />
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}
          >
            {step === "email" && (
              <>
                {!isLogin && (
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    style={inputStyle}
                  />
                )}
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="Email address"
                  style={inputStyle}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  autoFocus
                />
              </>
            )}
            {step === "password" && (
              <>
                <div
                  style={{
                    fontFamily: "'DM Mono',monospace",
                    fontSize: "0.72rem",
                    color: "#7a6f62",
                    padding: "0.5rem 0",
                  }}
                >
                  {email}{" "}
                  <span
                    onClick={() => {
                      setStep("email");
                      setErr("");
                    }}
                    style={{
                      color: "#c8873a",
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                  >
                    Change
                  </span>
                </div>
                <input
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  type="password"
                  placeholder="Password"
                  style={inputStyle}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  autoFocus
                />
              </>
            )}
            {err && (
              <p
                style={{
                  color: "#c0392b",
                  fontFamily: "'DM Mono',monospace",
                  fontSize: "0.72rem",
                }}
              >
                {err}
              </p>
            )}
            <button
              onClick={submit}
              style={{
                background: "#1a1410",
                color: "#f5f0e8",
                border: "none",
                padding: "0.85rem",
                fontFamily: "'DM Mono',monospace",
                fontSize: "0.78rem",
                letterSpacing: "0.05em",
                cursor: "pointer",
                borderRadius: "2px",
                marginTop: "0.4rem",
              }}
            >
              {step === "email"
                ? "Continue →"
                : isLogin
                  ? "Sign in →"
                  : "Create account →"}
            </button>
          </div>
          <p
            style={{
              fontFamily: "'DM Mono',monospace",
              fontSize: "0.65rem",
              color: "#7a6f62",
              marginTop: "1.5rem",
              lineHeight: 1.6,
              textAlign: "center",
            }}
          >
            By continuing you agree to our Terms of Service &amp; Privacy
            Policy.
          </p>
        </div>
      </div>
    </div>
  );
}

export { AuthPage };
