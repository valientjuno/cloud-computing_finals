"use client";

import { useMemo, useState } from "react";
import type { User, Page } from "../types";
import { registerUser, loginUser } from "../auth";

type AuthPageProps = {
  mode: "login" | "signup";
  onNav: (page: Page) => void;
  onAuth: (user: User) => void | Promise<void>;
};

export function AuthPage({ mode, onNav, onAuth }: AuthPageProps) {
  const isLogin = mode === "login";
  const [step, setStep] = useState<"email" | "password">("email");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const title = useMemo(
    () => (isLogin ? "Welcome back" : "Create your account"),
    [isLogin],
  );

  const submit = async () => {
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

    try {
      setLoading(true);
      setErr("");

      const current = isLogin
        ? await loginUser(email, pass)
        : await registerUser(name || email.split("@")[0], email, pass);

      const u: User = {
        id: current.$id,
        name: current.name || email.split("@")[0],
        email: current.email,
        avatar: "",
        password: "",
        notifications: true,
      };

      await onAuth(u);
    } catch (error: any) {
      console.error("AuthPage submit error:", error);
      setErr(error?.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "24px",
          borderRadius: "16px",
          border: "1px solid #e5e7eb",
          background: "#ffffff",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        <button
          onClick={() => onNav("landing")}
          style={{
            marginBottom: "16px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "#4b5563",
          }}
        >
          ← Back
        </button>

        <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>{title}</h1>
        <p style={{ color: "#6b7280", marginBottom: "20px" }}>
          {isLogin
            ? "Log in to continue writing."
            : "Sign up to start your journal."}
        </p>

        {!isLogin && step === "email" && (
          <div style={{ marginBottom: "12px" }}>
            <label
              htmlFor="name"
              style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}
            >
              Name
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "10px",
                border: "1px solid #d1d5db",
              }}
            />
          </div>
        )}

        {step === "email" && (
          <div style={{ marginBottom: "12px" }}>
            <label
              htmlFor="email"
              style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "10px",
                border: "1px solid #d1d5db",
              }}
            />
          </div>
        )}

        {step === "password" && (
          <>
            <div style={{ marginBottom: "12px" }}>
              <label
                htmlFor="email-readonly"
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: 600,
                }}
              >
                Email
              </label>
              <input
                id="email-readonly"
                type="email"
                value={email}
                readOnly
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  border: "1px solid #d1d5db",
                  background: "#f9fafb",
                }}
              />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label
                htmlFor="password"
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: 600,
                }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="At least 6 characters"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  border: "1px solid #d1d5db",
                }}
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setStep("email");
                setErr("");
              }}
              style={{
                marginBottom: "12px",
                background: "transparent",
                border: "none",
                color: "#2563eb",
                cursor: "pointer",
              }}
            >
              Change email
            </button>
          </>
        )}

        {err && <p style={{ color: "#b91c1c", marginBottom: "12px" }}>{err}</p>}

        <button
          type="button"
          onClick={submit}
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: "10px",
            border: "none",
            background: "#111827",
            color: "#ffffff",
            fontWeight: 700,
            cursor: "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading
            ? "Please wait..."
            : step === "email"
              ? "Continue"
              : isLogin
                ? "Log in"
                : "Create account"}
        </button>

        <p style={{ marginTop: "16px", color: "#6b7280" }}>
          {isLogin ? "Need an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setErr("");
              setStep("email");
              onNav(isLogin ? "signup" : "login");
            }}
            style={{
              background: "transparent",
              border: "none",
              color: "#2563eb",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {isLogin ? "Sign up" : "Log in"}
          </button>
        </p>
      </div>
    </main>
  );
}
