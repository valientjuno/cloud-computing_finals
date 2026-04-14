"use client";
import { useState } from "react";
import type { User, Page } from "../types";
import { Logo } from "./Logo";
import { Avatar } from "./Avatar";

function AppNav({
  user,
  onNav,
  onNewEntry,
  activeMenuItems,
}: {
  user: User;
  onNav: (p: Page) => void;
  onNewEntry: () => void;
  activeMenuItems?: string[];
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navItems: [string, Page][] = [
    ["Dashboard", "dashboard"],
    ["Calendar", "calendar"],
    ["Analytics", "analytics"],
    ["Collections", "collections"],
  ];
  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1rem 5%",
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(245,240,232,0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(26,20,16,0.08)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
        <Logo onClick={() => onNav("dashboard")} />
        <div style={{ display: "flex", gap: "1.2rem" }}>
          {navItems.map(([label, page]) => (
            <span
              key={page}
              onClick={() => onNav(page)}
              style={{
                fontFamily: "'DM Mono',monospace",
                fontSize: "0.68rem",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: activeMenuItems?.includes(page) ? "#c8873a" : "#7a6f62",
                cursor: "pointer",
                borderBottom: activeMenuItems?.includes(page)
                  ? "1px solid #c8873a"
                  : "1px solid transparent",
                paddingBottom: "1px",
                transition: "color 0.15s",
              }}
            >
              {label}
            </span>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <button
          onClick={onNewEntry}
          style={{
            background: "#c8873a",
            color: "#fff",
            border: "none",
            padding: "0.5rem 1.2rem",
            fontFamily: "'DM Mono',monospace",
            fontSize: "0.75rem",
            letterSpacing: "0.04em",
            cursor: "pointer",
            borderRadius: "2px",
          }}
        >
          + New Entry
        </button>
        <div style={{ position: "relative" }}>
          <Avatar user={user} onClick={() => setMenuOpen((o) => !o)} />
          {menuOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 0.5rem)",
                background: "#fffdf8",
                border: "1px solid rgba(26,20,16,0.12)",
                borderRadius: "2px",
                minWidth: 160,
                boxShadow: "0 8px 32px rgba(26,20,16,0.12)",
                zIndex: 200,
              }}
            >
              {(
                [
                  ["Settings", "settings"],
                  ["Sign out", "__logout"],
                ] as [string, string][]
              ).map(([label, action]) => (
                <div
                  key={label}
                  onClick={() => {
                    setMenuOpen(false);
                    if (action === "__logout") onNav("landing");
                    else onNav(action as Page);
                  }}
                  style={{
                    padding: "0.7rem 1rem",
                    fontFamily: "'DM Mono',monospace",
                    fontSize: "0.75rem",
                    color: "#1a1410",
                    cursor: "pointer",
                    borderBottom: "1px solid rgba(26,20,16,0.06)",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLDivElement).style.background =
                      "#ede6d6")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLDivElement).style.background =
                      "transparent")
                  }
                >
                  {label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export { AppNav };
