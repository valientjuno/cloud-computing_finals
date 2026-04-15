"use client";

import { useState, type CSSProperties } from "react";
import type { User } from "../types";

type SettingsProps = {
  user: User;
  onUpdate: (user: User) => void;
  onBack: () => void;
  onLogout: () => void;
};

export function Settings({ user, onUpdate, onBack, onLogout }: SettingsProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [notifications, setNotifications] = useState(user.notifications);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const inputStyle: CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    background: "#ffffff",
    color: "#111827",
    outline: "none",
  };

  const labelStyle: CSSProperties = {
    display: "block",
    marginBottom: "6px",
    fontWeight: 600,
    color: "#111827",
  };

  const sectionStyle: CSSProperties = {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "16px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      setMessage("");

      onUpdate({
        ...user,
        name,
        email,
        notifications,
      });

      setMessage("Settings updated.");
    } catch (error) {
      console.error("Settings update error:", error);
      setMessage("Could not update settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "24px",
      }}
    >
      <div
        style={{
          maxWidth: "720px",
          margin: "0 auto",
        }}
      >
        <button
          onClick={onBack}
          style={{
            marginBottom: "20px",
            background: "transparent",
            border: "none",
            color: "#374151",
            cursor: "pointer",
            fontSize: "15px",
          }}
        >
          ← Back
        </button>

        <h1
          style={{
            fontSize: "32px",
            marginBottom: "8px",
            color: "#111827",
          }}
        >
          Settings
        </h1>

        <p
          style={{
            marginBottom: "24px",
            color: "#6b7280",
          }}
        >
          Manage your profile and preferences.
        </p>

        <section style={sectionStyle}>
          <h2
            style={{
              fontSize: "20px",
              marginBottom: "16px",
              color: "#111827",
            }}
          >
            Profile
          </h2>

          <div style={{ marginBottom: "14px" }}>
            <label htmlFor="settings-name" style={labelStyle}>
              Name
            </label>
            <input
              id="settings-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label htmlFor="settings-email" style={labelStyle}>
              Email
            </label>
            <input
              id="settings-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
          </div>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginTop: "8px",
              color: "#111827",
            }}
          >
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
            />
            Enable notifications
          </label>
        </section>

        <section style={sectionStyle}>
          <h2
            style={{
              fontSize: "20px",
              marginBottom: "12px",
              color: "#111827",
            }}
          >
            Account
          </h2>

          <p
            style={{
              marginBottom: "16px",
              color: "#6b7280",
            }}
          >
            You are signed in as <strong>{user.email}</strong>.
          </p>

          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={saveProfile}
              disabled={saving}
              style={{
                padding: "12px 16px",
                borderRadius: "10px",
                border: "none",
                background: "#111827",
                color: "#ffffff",
                fontWeight: 700,
                cursor: "pointer",
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? "Saving..." : "Save changes"}
            </button>

            <button
              onClick={onLogout}
              style={{
                padding: "12px 16px",
                borderRadius: "10px",
                border: "1px solid #d1d5db",
                background: "#ffffff",
                color: "#111827",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Log out
            </button>
          </div>

          {message && (
            <p
              style={{
                marginTop: "14px",
                color: message.includes("Could not") ? "#b91c1c" : "#166534",
              }}
            >
              {message}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
