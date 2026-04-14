"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ─── Types ────────────────────────────────────────────────
interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  password: string;
  notifications: boolean;
}
interface Entry {
  id: string;
  userId: string;
  title: string;
  content: string;
  mood: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  collectionId?: string;
}
interface Collection {
  id: string;
  userId: string;
  name: string;
  color: string;
  emoji: string;
  createdAt: string;
}
type Page =
  | "landing"
  | "login"
  | "signup"
  | "dashboard"
  | "editor"
  | "detail"
  | "settings"
  | "calendar"
  | "analytics"
  | "collections";

const MOODS = ["😊", "😔", "😤", "😌", "🤔", "😴", "🥳", "😰", "❤️", "🌱"];
const MOOD_LABELS: Record<string, string> = {
  "😊": "Happy",
  "😔": "Sad",
  "😤": "Frustrated",
  "😌": "Calm",
  "🤔": "Thoughtful",
  "😴": "Tired",
  "🥳": "Excited",
  "😰": "Anxious",
  "❤️": "Loving",
  "🌱": "Growing",
};
const COLLECTION_COLORS = [
  "#c8873a",
  "#6b7c5e",
  "#7c6b8e",
  "#4a7c99",
  "#c05a5a",
  "#7c8e6b",
];
const COLLECTION_EMOJIS = [
  "📔",
  "✈️",
  "💭",
  "🌿",
  "💼",
  "🌙",
  "❤️",
  "📚",
  "🎨",
  "🏃",
];

const SAMPLE_ENTRIES: Entry[] = [
  {
    id: "s1",
    userId: "demo",
    title: "A quiet Tuesday",
    content:
      "The morning came slowly today. I made coffee before anyone else was awake and sat at the kitchen table watching fog curl off the hills. There's something about stillness before the world starts that feels almost sacred. I've been thinking about what it means to really listen — not to respond, but to just receive.\n\nI want to be better at that.",
    mood: "😌",
    tags: ["morning", "reflection"],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "s2",
    userId: "demo",
    title: "On being stuck",
    content:
      "Couldn't write yesterday. Sat here for twenty minutes with a blank page and gave up. But maybe that's part of it. Maybe the blank days are as honest as the full ones.\n\nToday feels different. There's momentum here. I don't want to question it too much.",
    mood: "🤔",
    tags: ["creativity", "process"],
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "s3",
    userId: "demo",
    title: "Small victories",
    content:
      "Finished the project. Three weeks of late nights, and it's done. I keep waiting to feel something grand, but it's mostly just... relief. And then immediately: what's next?\n\nI should sit with this longer. I'm too quick to move on.",
    mood: "🥳",
    tags: ["work", "achievement"],
    createdAt: new Date(Date.now() - 86400000 * 9).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 9).toISOString(),
  },
  {
    id: "s4",
    userId: "demo",
    title: "Early run",
    content:
      "Up at 5:30. Cold out. Ran anyway. There's a particular kind of silence before the city wakes that I keep chasing. Found it today between mile two and three.",
    mood: "🌱",
    tags: ["morning", "health"],
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 14).toISOString(),
  },
  {
    id: "s5",
    userId: "demo",
    title: "Worried again",
    content:
      "The anxiety crept back today. That low-level hum of something being wrong when nothing technically is. I sat with it instead of running from it. That felt like progress.",
    mood: "😰",
    tags: ["mental health", "reflection"],
    createdAt: new Date(Date.now() - 86400000 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 18).toISOString(),
  },
  {
    id: "s6",
    userId: "demo",
    title: "Sunday reading",
    content:
      "Read for three hours straight. A novel, actual fiction — not self-help, not productivity. Just story. I'd forgotten what that felt like. Happy and a little guilty about how rare it's become.",
    mood: "😊",
    tags: ["reading", "rest"],
    createdAt: new Date(Date.now() - 86400000 * 22).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 22).toISOString(),
  },
];

// ─── Utils ────────────────────────────────────────────────
const storage = {
  get: (k: string) => {
    try {
      return JSON.parse(localStorage.getItem(k) || "null");
    } catch {
      return null;
    }
  },
  set: (k: string, v: unknown) => {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch {}
  },
};
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
const fmtShort = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
const excerpt = (s: string, n = 120) =>
  s.length > n ? s.slice(0, n) + "…" : s;
const uid = () => Math.random().toString(36).slice(2, 10);
const streakCount = (entries: Entry[], userId: string) => {
  const days = new Set(
    entries
      .filter((e) => e.userId === userId)
      .map((e) => e.createdAt.slice(0, 10)),
  );
  let count = 0,
    d = new Date();
  while (days.has(d.toISOString().slice(0, 10))) {
    count++;
    d.setDate(d.getDate() - 1);
  }
  return count;
};
const isoDay = (d: Date) => d.toISOString().slice(0, 10);

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

// ─── Shared Components ─────────────────────────────────────
function Logo({ onClick }: { onClick: () => void }) {
  return (
    <span
      onClick={onClick}
      style={{
        fontFamily: "'Playfair Display',serif",
        fontSize: "1.5rem",
        fontWeight: 700,
        fontStyle: "italic",
        cursor: "pointer",
        color: "var(--ink)",
      }}
    >
      Folio
    </span>
  );
}
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

// ─── PAGE: Landing ─────────────────────────────────────────
function Landing({ onNav }: { onNav: (p: Page) => void }) {
  const features = [
    {
      icon: "✦",
      title: "Daily Prompts",
      desc: "Thoughtfully crafted prompts to spark reflection when words don't come easily.",
    },
    {
      icon: "◈",
      title: "Mood Tracking",
      desc: "Visualize your emotional landscape over weeks, months, and years.",
    },
    {
      icon: "⬡",
      title: "Private by Design",
      desc: "End-to-end encrypted. Your thoughts belong only to you.",
    },
    {
      icon: "◎",
      title: "Streak & Rituals",
      desc: "Build the habit that changes everything — one honest entry at a time.",
    },
  ];
  const [tIdx, setTIdx] = useState(0);
  const testis = [
    {
      q: "I've tried every journaling app. Folio is the first one I've kept open every morning.",
      name: "Mara T.",
      role: "Designer",
    },
    {
      q: "Something about the prompts — they reach a part of me I usually skip right past.",
      name: "James K.",
      role: "Engineer",
    },
    {
      q: "Three months in, and I can actually see who I was becoming. That's rare.",
      name: "Priya N.",
      role: "Therapist",
    },
  ];
  useEffect(() => {
    const t = setInterval(() => setTIdx((p) => (p + 1) % testis.length), 4500);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ background: "var(--paper)", minHeight: "100vh" }}>
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1.1rem 5%",
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(245,240,232,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(26,20,16,0.08)",
        }}
      >
        <Logo onClick={() => onNav("landing")} />
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          <span
            style={{
              fontFamily: "'DM Mono',monospace",
              fontSize: "0.7rem",
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              color: "#7a6f62",
              cursor: "pointer",
            }}
            onClick={() => onNav("login")}
          >
            Sign in
          </span>
          <button
            onClick={() => onNav("signup")}
            style={{
              background: "#1a1410",
              color: "#f5f0e8",
              border: "none",
              padding: "0.5rem 1.2rem",
              fontFamily: "'DM Mono',monospace",
              fontSize: "0.75rem",
              letterSpacing: "0.04em",
              cursor: "pointer",
              borderRadius: "2px",
            }}
          >
            Start Writing →
          </button>
        </div>
      </nav>
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "3rem",
          alignItems: "center",
          padding: "5rem 5% 4rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-10%",
            right: "-5%",
            width: "50%",
            height: "60%",
            background:
              "radial-gradient(ellipse,rgba(200,135,58,0.12) 0%,transparent 65%)",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />
        <div>
          <p
            style={{
              fontFamily: "'DM Mono',monospace",
              fontSize: "0.68rem",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "#c8873a",
              marginBottom: "1rem",
            }}
          >
            Your daily sanctuary
          </p>
          <h1
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: "clamp(2.4rem,4.5vw,3.8rem)",
              lineHeight: 1.1,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              marginBottom: "1.2rem",
            }}
          >
            Write your way
            <br />
            <em style={{ color: "#c8873a" }}>back to yourself.</em>
          </h1>
          <p
            style={{
              fontSize: "0.95rem",
              lineHeight: 1.7,
              color: "#7a6f62",
              maxWidth: "38ch",
              marginBottom: "2rem",
            }}
          >
            Folio is a journaling app built for the honest moments — the ones
            that shape who you're becoming.
          </p>
          <div
            style={{
              display: "flex",
              gap: "0.8rem",
              flexWrap: "wrap",
              marginBottom: "0.8rem",
            }}
          >
            <button
              onClick={() => onNav("signup")}
              style={{
                background: "#1a1410",
                color: "#f5f0e8",
                border: "none",
                padding: "0.8rem 1.6rem",
                fontFamily: "'DM Mono',monospace",
                fontSize: "0.78rem",
                letterSpacing: "0.04em",
                cursor: "pointer",
                borderRadius: "2px",
              }}
            >
              Begin for free
            </button>
            <button
              onClick={() => onNav("login")}
              style={{
                background: "transparent",
                color: "#1a1410",
                border: "1.5px solid #1a1410",
                padding: "0.8rem 1.6rem",
                fontFamily: "'DM Mono',monospace",
                fontSize: "0.78rem",
                letterSpacing: "0.04em",
                cursor: "pointer",
                borderRadius: "2px",
              }}
            >
              Sign in
            </button>
          </div>
          <p
            style={{
              fontFamily: "'DM Mono',monospace",
              fontSize: "0.68rem",
              color: "#7a6f62",
              letterSpacing: "0.04em",
            }}
          >
            No credit card · Available on iOS &amp; Web
          </p>
        </div>
        <div
          style={{
            background: "#fffdf8",
            border: "1px solid rgba(26,20,16,0.1)",
            borderRadius: "3px",
            padding: "2rem",
            boxShadow: "0 12px 50px rgba(26,20,16,0.15)",
            transform: "rotate(1.5deg)",
            position: "relative",
            maxWidth: "360px",
            justifySelf: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "2.4rem",
              top: 0,
              bottom: 0,
              width: "1px",
              background: "rgba(200,135,58,0.2)",
            }}
          />
          <div
            style={{
              fontFamily: "'DM Mono',monospace",
              fontSize: "0.65rem",
              letterSpacing: "0.1em",
              color: "#c8873a",
              textTransform: "uppercase",
              marginBottom: "1rem",
            }}
          >
            Today's prompt
          </div>
          <p
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: "1.05rem",
              lineHeight: 1.55,
              fontStyle: "italic",
              color: "#1a1410",
              marginBottom: "1rem",
            }}
          >
            What is one thing you keep putting off — and what would it feel like
            to finally begin?
          </p>
          <span
            style={{
              display: "inline-block",
              width: 2,
              height: "1em",
              background: "#c8873a",
              verticalAlign: "middle",
              animation: "blink 1.1s step-start infinite",
            }}
          />
        </div>
      </section>
      <div
        style={{
          overflow: "hidden",
          borderTop: "1px solid rgba(26,20,16,0.1)",
          borderBottom: "1px solid rgba(26,20,16,0.1)",
          padding: "0.75rem 0",
          background: "#ede6d6",
        }}
      >
        <div
          style={{
            display: "flex",
            whiteSpace: "nowrap",
            animation: "marquee 22s linear infinite",
          }}
        >
          {[
            "Reflect",
            "Grow",
            "Remember",
            "Discover",
            "Process",
            "Heal",
            "Celebrate",
            "Reflect",
            "Grow",
            "Remember",
            "Discover",
            "Process",
            "Heal",
            "Celebrate",
          ].map((w, i) => (
            <span
              key={i}
              style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: "0.9rem",
                fontStyle: "italic",
                color: "#7a6f62",
                padding: "0 2rem",
              }}
            >
              {w} <span style={{ color: "#c8873a" }}>✦</span>
            </span>
          ))}
        </div>
      </div>
      <section style={{ padding: "5rem 5%" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <span
            style={{
              fontFamily: "'DM Mono',monospace",
              fontSize: "0.65rem",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "#c8873a",
              display: "block",
              marginBottom: "0.6rem",
            }}
          >
            Everything you need
          </span>
          <h2
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: "clamp(1.6rem,3vw,2.4rem)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "#1a1410",
            }}
          >
            A ritual worth keeping.
          </h2>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: "1.5px",
            border: "1.5px solid rgba(26,20,16,0.1)",
          }}
        >
          {features.map((f, i) => (
            <div
              key={i}
              style={{
                background: "#fffdf8",
                padding: "2rem 1.5rem",
                transition: "background 0.2s",
                cursor: "default",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLDivElement).style.background =
                  "#ede6d6")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLDivElement).style.background =
                  "#fffdf8")
              }
            >
              <span
                style={{
                  display: "block",
                  fontSize: "1.3rem",
                  color: "#c8873a",
                  marginBottom: "0.9rem",
                }}
              >
                {f.icon}
              </span>
              <h3
                style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  marginBottom: "0.4rem",
                  color: "#1a1410",
                }}
              >
                {f.title}
              </h3>
              <p
                style={{
                  fontSize: "0.83rem",
                  lineHeight: 1.6,
                  color: "#7a6f62",
                }}
              >
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
      <section
        style={{
          padding: "5rem 5%",
          textAlign: "center",
          background: "#1a1410",
        }}
      >
        <blockquote
          style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: "clamp(1.4rem,3vw,2.2rem)",
            fontStyle: "italic",
            color: "#f5f0e8",
            maxWidth: "26ch",
            margin: "0 auto",
            lineHeight: 1.4,
            position: "relative",
          }}
        >
          <span
            style={{
              position: "absolute",
              top: "-0.15em",
              left: "-0.25em",
              fontSize: "3.5em",
              color: "#c8873a",
              opacity: 0.3,
              fontStyle: "normal",
              lineHeight: 1,
            }}
          >
            "
          </span>
          "The habit of writing is the habit of noticing."
        </blockquote>
      </section>
      <section style={{ padding: "5rem 5%", background: "#ede6d6" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <span
            style={{
              fontFamily: "'DM Mono',monospace",
              fontSize: "0.65rem",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "#c8873a",
              display: "block",
              marginBottom: "0.6rem",
            }}
          >
            Real writers
          </span>
          <h2
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: "clamp(1.6rem,3vw,2.4rem)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "#1a1410",
            }}
          >
            What people are saying.
          </h2>
        </div>
        <div
          style={{
            maxWidth: 580,
            margin: "0 auto",
            minHeight: 160,
            position: "relative",
          }}
        >
          {testis.map((t, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                inset: 0,
                opacity: i === tIdx ? 1 : 0,
                transform: i === tIdx ? "translateY(0)" : "translateY(10px)",
                transition: "opacity 0.6s,transform 0.6s",
                pointerEvents: i === tIdx ? "auto" : "none",
              }}
            >
              <p
                style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: "clamp(1rem,2vw,1.25rem)",
                  fontStyle: "italic",
                  lineHeight: 1.55,
                  color: "#1a1410",
                  marginBottom: "1.2rem",
                }}
              >
                "{t.q}"
              </p>
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <span
                  style={{
                    fontFamily: "'DM Mono',monospace",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    color: "#1a1410",
                  }}
                >
                  {t.name}
                </span>
                <span
                  style={{
                    fontFamily: "'DM Mono',monospace",
                    fontSize: "0.7rem",
                    color: "#7a6f62",
                  }}
                >
                  — {t.role}
                </span>
              </div>
            </div>
          ))}
          <div style={{ display: "flex", gap: "0.4rem", marginTop: "10rem" }}>
            {testis.map((_, i) => (
              <button
                key={i}
                onClick={() => setTIdx(i)}
                style={{
                  width: 24,
                  height: 3,
                  background: i === tIdx ? "#c8873a" : "rgba(26,20,16,0.15)",
                  border: "none",
                  cursor: "pointer",
                  borderRadius: 2,
                  transition: "background 0.3s",
                }}
              />
            ))}
          </div>
        </div>
      </section>
      <section style={{ padding: "5rem 5%", textAlign: "center" }}>
        <h2
          style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: "clamp(1.8rem,3.5vw,2.6rem)",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            marginBottom: "0.8rem",
            color: "#1a1410",
          }}
        >
          Your first entry is waiting.
        </h2>
        <p
          style={{
            fontSize: "0.95rem",
            color: "#7a6f62",
            marginBottom: "2rem",
          }}
        >
          Start with one sentence. That's always enough.
        </p>
        <button
          onClick={() => onNav("signup")}
          style={{
            background: "#1a1410",
            color: "#f5f0e8",
            border: "none",
            padding: "0.9rem 2rem",
            fontFamily: "'DM Mono',monospace",
            fontSize: "0.82rem",
            letterSpacing: "0.04em",
            cursor: "pointer",
            borderRadius: "2px",
          }}
        >
          Open Folio — it's free
        </button>
      </section>
      <footer
        style={{
          padding: "1.5rem 5%",
          borderTop: "1px solid rgba(26,20,16,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.8rem",
          background: "#ede6d6",
        }}
      >
        <Logo onClick={() => onNav("landing")} />
        <div style={{ display: "flex", gap: "1.2rem" }}>
          {["Privacy", "Terms", "Contact"].map((l) => (
            <span
              key={l}
              style={{
                fontFamily: "'DM Mono',monospace",
                fontSize: "0.65rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#7a6f62",
                cursor: "pointer",
              }}
            >
              {l}
            </span>
          ))}
        </div>
        <p
          style={{
            fontFamily: "'DM Mono',monospace",
            fontSize: "0.65rem",
            color: "#7a6f62",
          }}
        >
          © 2026 Folio. Made for the honest moments.
        </p>
      </footer>
    </div>
  );
}

// ─── PAGE: Auth ────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  border: "1px solid rgba(26,20,16,0.2)",
  padding: "0.75rem 1rem",
  fontFamily: "'DM Mono',monospace",
  fontSize: "0.82rem",
  color: "#1a1410",
  background: "#fffdf8",
  borderRadius: "2px",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};
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

// ─── PAGE: Dashboard ───────────────────────────────────────
function Dashboard({
  user,
  entries,
  collections,
  onNav,
  onSelectEntry,
  onNewEntry,
  onLogout,
}: {
  user: User;
  entries: Entry[];
  collections: Collection[];
  onNav: (p: Page) => void;
  onSelectEntry: (id: string) => void;
  onNewEntry: () => void;
  onLogout: () => void;
}) {
  const myEntries = entries
    .filter((e) => e.userId === user.id)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  const streak = streakCount(entries, user.id);
  const [searchQ, setSearchQ] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const filtered = searchQ
    ? myEntries.filter(
        (e) =>
          e.title.toLowerCase().includes(searchQ.toLowerCase()) ||
          e.content.toLowerCase().includes(searchQ.toLowerCase()) ||
          e.tags.some((t) => t.includes(searchQ.toLowerCase())),
      )
    : myEntries;
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);
  const greet = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };
  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)" }}>
      <AppNav
        user={user}
        onNav={(p) => {
          if (p === "landing") {
            onLogout();
            return;
          }
          onNav(p);
        }}
        onNewEntry={onNewEntry}
        activeMenuItems={["dashboard"]}
      />
      {searchOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(26,20,16,0.4)",
            zIndex: 500,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingTop: "8rem",
          }}
          onClick={() => setSearchOpen(false)}
        >
          <div
            style={{
              background: "#fffdf8",
              borderRadius: "3px",
              width: "90%",
              maxWidth: 560,
              boxShadow: "0 24px 80px rgba(26,20,16,0.25)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <input
              autoFocus
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Search your entries…"
              style={{
                width: "100%",
                border: "none",
                borderBottom: "1px solid rgba(26,20,16,0.1)",
                padding: "1rem 1.25rem",
                fontFamily: "'Lora',serif",
                fontSize: "1rem",
                background: "transparent",
                outline: "none",
                boxSizing: "border-box",
                color: "#1a1410",
              }}
            />
            <div style={{ maxHeight: 320, overflowY: "auto" }}>
              {searchQ && filtered.length === 0 && (
                <p
                  style={{
                    padding: "1.5rem",
                    fontFamily: "'DM Mono',monospace",
                    fontSize: "0.78rem",
                    color: "#7a6f62",
                    textAlign: "center",
                  }}
                >
                  No entries found for "{searchQ}"
                </p>
              )}
              {filtered.slice(0, 8).map((e) => (
                <div
                  key={e.id}
                  onClick={() => {
                    onSelectEntry(e.id);
                    setSearchOpen(false);
                    setSearchQ("");
                  }}
                  style={{
                    padding: "0.9rem 1.25rem",
                    borderBottom: "1px solid rgba(26,20,16,0.06)",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(ev) =>
                    ((ev.currentTarget as HTMLDivElement).style.background =
                      "#f5f0e8")
                  }
                  onMouseLeave={(ev) =>
                    ((ev.currentTarget as HTMLDivElement).style.background =
                      "transparent")
                  }
                >
                  <div
                    style={{
                      fontFamily: "'Playfair Display',serif",
                      fontSize: "0.95rem",
                      fontWeight: 700,
                      color: "#1a1410",
                      marginBottom: "0.2rem",
                    }}
                  >
                    {e.title || "Untitled"}
                  </div>
                  <div
                    style={{
                      fontFamily: "'DM Mono',monospace",
                      fontSize: "0.68rem",
                      color: "#7a6f62",
                    }}
                  >
                    {fmtShort(e.createdAt)} · {excerpt(e.content, 60)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <main style={{ maxWidth: 760, margin: "0 auto", padding: "3rem 5%" }}>
        <div style={{ marginBottom: "2.5rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "0.5rem",
            }}
          >
            <h1
              style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: "1.8rem",
                fontWeight: 700,
                color: "var(--ink)",
              }}
            >
              {greet()}, {user.name.split(" ")[0]}.
            </h1>
            <div
              style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}
            >
              {streak > 0 && (
                <div
                  style={{
                    background: "rgba(200,135,58,0.1)",
                    border: "1px solid rgba(200,135,58,0.25)",
                    padding: "0.4rem 0.9rem",
                    borderRadius: "2px",
                    fontFamily: "'DM Mono',monospace",
                    fontSize: "0.75rem",
                    color: "#c8873a",
                  }}
                >
                  🔥 {streak} day{streak !== 1 ? "s" : ""}
                </div>
              )}
              <button
                onClick={() => setSearchOpen(true)}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(26,20,16,0.15)",
                  padding: "0.4rem 0.9rem",
                  fontFamily: "'DM Mono',monospace",
                  fontSize: "0.7rem",
                  color: "#7a6f62",
                  cursor: "pointer",
                  borderRadius: "2px",
                }}
              >
                ⌘K
              </button>
            </div>
          </div>
          <p
            style={{
              fontFamily: "'DM Mono',monospace",
              fontSize: "0.75rem",
              color: "#7a6f62",
            }}
          >
            {myEntries.length} {myEntries.length === 1 ? "entry" : "entries"} ·{" "}
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        {myEntries.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "5rem 2rem",
              background: "#fffdf8",
              border: "1px solid rgba(26,20,16,0.08)",
              borderRadius: "3px",
            }}
          >
            <p style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>✦</p>
            <h2
              style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: "1.4rem",
                fontWeight: 700,
                fontStyle: "italic",
                marginBottom: "0.6rem",
                color: "var(--ink)",
              }}
            >
              Your story starts here.
            </h2>
            <p
              style={{
                fontFamily: "'DM Mono',monospace",
                fontSize: "0.78rem",
                color: "#7a6f62",
                marginBottom: "1.5rem",
              }}
            >
              Write your first entry — it doesn't have to be perfect.
            </p>
            <button
              onClick={onNewEntry}
              style={{
                background: "#c8873a",
                color: "#fff",
                border: "none",
                padding: "0.75rem 1.5rem",
                fontFamily: "'DM Mono',monospace",
                fontSize: "0.78rem",
                cursor: "pointer",
                borderRadius: "2px",
              }}
            >
              Write your first entry →
            </button>
          </div>
        )}
        {myEntries.length > 0 && (
          <div style={{ display: "grid", gap: "1rem" }}>
            {filtered.map((e) => (
              <EntryCard
                key={e.id}
                entry={e}
                onClick={() => onSelectEntry(e.id)}
              />
            ))}
            {searchQ && filtered.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem",
                  fontFamily: "'DM Mono',monospace",
                  fontSize: "0.78rem",
                  color: "#7a6f62",
                }}
              >
                No entries match your search.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// ─── PAGE: Editor ──────────────────────────────────────────
function Editor({
  user,
  entries,
  collections,
  editId,
  onSave,
  onNav,
  onBack,
}: {
  user: User;
  entries: Entry[];
  collections: Collection[];
  editId: string | null;
  onSave: (e: Entry) => void;
  onNav: (p: Page) => void;
  onBack: () => void;
}) {
  const existing = editId ? entries.find((e) => e.id === editId) || null : null;
  const [title, setTitle] = useState(existing?.title || "");
  const [content, setContent] = useState(existing?.content || "");
  const [mood, setMood] = useState(existing?.mood || "😊");
  const [tags, setTags] = useState<string[]>(existing?.tags || []);
  const [collectionId, setCollectionId] = useState<string | undefined>(
    existing?.collectionId,
  );
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle",
  );
  const [wordCount, setWordCount] = useState(0);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const myCollections = collections.filter((c) => c.userId === user.id);
  useEffect(() => {
    setWordCount(content.trim() ? content.trim().split(/\s+/).length : 0);
  }, [content]);
  const save = useCallback(() => {
    if (!content.trim() && !title.trim()) return;
    setSaveStatus("saving");
    const entry: Entry = {
      id: editId || uid(),
      userId: user.id,
      title: title || "Untitled",
      content,
      mood,
      tags,
      collectionId,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTimeout(() => {
      onSave(entry);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }, 300);
  }, [
    title,
    content,
    mood,
    tags,
    collectionId,
    editId,
    user,
    existing,
    onSave,
  ]);
  useEffect(() => {
    const t = setTimeout(() => {
      if (content.trim() || title.trim()) save();
    }, 30000);
    return () => clearTimeout(t);
  }, [content, title, save]);
  const applyFmt = (before: string, after: string) => {
    const ta = taRef.current;
    if (!ta) return;
    const s = ta.selectionStart,
      e = ta.selectionEnd,
      sel = content.slice(s, e);
    const nc = content.slice(0, s) + before + sel + after + content.slice(e);
    setContent(nc);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(s + before.length, e + before.length);
    }, 0);
  };
  const prompts = [
    "What made you pause today?",
    "Describe a moment that surprised you.",
    "What are you grateful for right now?",
    "What would you tell your past self?",
    "What's taking up the most space in your mind?",
  ];
  const [prompt] = useState(
    prompts[Math.floor(Math.random() * prompts.length)],
  );
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#faf7f2",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1rem 5%",
          borderBottom: "1px solid rgba(26,20,16,0.08)",
          background: "rgba(250,247,242,0.95)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
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
          <span
            style={{
              fontFamily: "'DM Mono',monospace",
              fontSize: "0.68rem",
              color: "rgba(26,20,16,0.2)",
            }}
          >
            |
          </span>
          <span
            style={{
              fontFamily: "'DM Mono',monospace",
              fontSize: "0.68rem",
              color: "#7a6f62",
            }}
          >
            {wordCount} words
          </span>
          {myCollections.length > 0 && (
            <select
              value={collectionId || ""}
              onChange={(e) => setCollectionId(e.target.value || undefined)}
              style={{
                border: "1px solid rgba(26,20,16,0.15)",
                background: "transparent",
                fontFamily: "'DM Mono',monospace",
                fontSize: "0.68rem",
                color: "#7a6f62",
                padding: "0.2rem 0.4rem",
                borderRadius: "2px",
                cursor: "pointer",
                outline: "none",
              }}
            >
              <option value="">No collection</option>
              {myCollections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.name}
                </option>
              ))}
            </select>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
          {saveStatus !== "idle" && (
            <span
              style={{
                fontFamily: "'DM Mono',monospace",
                fontSize: "0.68rem",
                color: saveStatus === "saved" ? "#6b7c5e" : "#7a6f62",
              }}
            >
              {saveStatus === "saving" ? "Saving…" : "Saved ✓"}
            </span>
          )}
          <button
            onClick={save}
            style={{
              background: "#1a1410",
              color: "#f5f0e8",
              border: "none",
              padding: "0.5rem 1.2rem",
              fontFamily: "'DM Mono',monospace",
              fontSize: "0.75rem",
              letterSpacing: "0.04em",
              cursor: "pointer",
              borderRadius: "2px",
            }}
          >
            Save
          </button>
        </div>
      </nav>
      <main
        style={{
          flex: 1,
          maxWidth: 720,
          margin: "0 auto",
          width: "100%",
          padding: "3rem 5%",
        }}
      >
        <p
          style={{
            fontFamily: "'DM Mono',monospace",
            fontSize: "0.7rem",
            letterSpacing: "0.08em",
            color: "#c8873a",
            textTransform: "uppercase",
            marginBottom: "1.2rem",
          }}
        >
          {fmtDate(existing?.createdAt || new Date().toISOString())}
        </p>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give this entry a title…"
          style={{
            width: "100%",
            border: "none",
            background: "transparent",
            fontFamily: "'Playfair Display',serif",
            fontSize: "clamp(1.6rem,3vw,2.2rem)",
            fontWeight: 700,
            color: "#1a1410",
            outline: "none",
            marginBottom: "0.8rem",
            letterSpacing: "-0.02em",
            boxSizing: "border-box",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.3rem",
            padding: "0.5rem 0",
            borderTop: "1px solid rgba(26,20,16,0.08)",
            borderBottom: "1px solid rgba(26,20,16,0.08)",
            marginBottom: "1.5rem",
            flexWrap: "wrap",
          }}
        >
          {[
            { label: "B", fmt: ["**", "**"] },
            { label: "I", fmt: ["_", "_"] },
          ].map((t) => (
            <button
              key={t.label}
              onClick={() => applyFmt(t.fmt[0], t.fmt[1])}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily:
                  t.label === "B" ? "'Playfair Display',serif" : "'Lora',serif",
                fontWeight: t.label === "B" ? 700 : 400,
                fontStyle: t.label === "I" ? "italic" : "normal",
                fontSize: "0.9rem",
                color: "#7a6f62",
                padding: "0.25rem 0.5rem",
                borderRadius: "2px",
              }}
            >
              {t.label}
            </button>
          ))}
          <div
            style={{
              width: 1,
              height: 16,
              background: "rgba(26,20,16,0.12)",
              margin: "0 0.2rem",
            }}
          />
          <MoodPicker value={mood} onChange={setMood} />
          <div style={{ marginLeft: "auto" }}>
            <TagInput tags={tags} onChange={setTags} />
          </div>
        </div>
        {!content && (
          <p
            style={{
              fontFamily: "'Playfair Display',serif",
              fontStyle: "italic",
              fontSize: "1rem",
              color: "rgba(26,20,16,0.25)",
              marginBottom: "0.8rem",
              pointerEvents: "none",
            }}
          >
            {prompt}
          </p>
        )}
        <textarea
          ref={taRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={save}
          placeholder="Start writing…"
          style={{
            width: "100%",
            minHeight: 480,
            border: "none",
            background: "transparent",
            fontFamily: "'Lora',serif",
            fontSize: "1.05rem",
            lineHeight: 1.8,
            color: "#1a1410",
            outline: "none",
            resize: "none",
            boxSizing: "border-box",
          }}
        />
      </main>
    </div>
  );
}

// ─── PAGE: Detail ──────────────────────────────────────────
function Detail({
  entry,
  collections,
  onBack,
  onEdit,
  onDelete,
}: {
  entry: Entry;
  collections: Collection[];
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [confirmDel, setConfirmDel] = useState(false);
  const collection = collections.find((c) => c.id === entry.collectionId);
  return (
    <div style={{ minHeight: "100vh", background: "#faf7f2" }}>
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1rem 5%",
          borderBottom: "1px solid rgba(26,20,16,0.08)",
          position: "sticky",
          top: 0,
          background: "rgba(250,247,242,0.95)",
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
          ← All entries
        </button>
        <div style={{ display: "flex", gap: "0.6rem" }}>
          <button
            onClick={onEdit}
            style={{
              background: "transparent",
              border: "1px solid rgba(26,20,16,0.15)",
              padding: "0.4rem 0.9rem",
              fontFamily: "'DM Mono',monospace",
              fontSize: "0.72rem",
              color: "#1a1410",
              cursor: "pointer",
              borderRadius: "2px",
            }}
          >
            Edit
          </button>
          <button
            onClick={() => setConfirmDel(true)}
            style={{
              background: "transparent",
              border: "1px solid rgba(192,57,43,0.3)",
              padding: "0.4rem 0.9rem",
              fontFamily: "'DM Mono',monospace",
              fontSize: "0.72rem",
              color: "#c0392b",
              cursor: "pointer",
              borderRadius: "2px",
            }}
          >
            Delete
          </button>
        </div>
      </nav>
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "3rem 5%" }}>
        <p
          style={{
            fontFamily: "'DM Mono',monospace",
            fontSize: "0.7rem",
            letterSpacing: "0.08em",
            color: "#c8873a",
            textTransform: "uppercase",
            marginBottom: "0.8rem",
          }}
        >
          {fmtDate(entry.createdAt)}
        </p>
        {collection && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              background: "rgba(26,20,16,0.05)",
              padding: "0.3rem 0.8rem",
              borderRadius: "2px",
              marginBottom: "1rem",
              fontFamily: "'DM Mono',monospace",
              fontSize: "0.68rem",
              color: "#7a6f62",
            }}
          >
            {collection.emoji} {collection.name}
          </div>
        )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.8rem",
            marginBottom: "1.5rem",
          }}
        >
          <h1
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: "clamp(1.6rem,3vw,2.2rem)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "#1a1410",
              flex: 1,
            }}
          >
            {entry.title || "Untitled"}
          </h1>
          <span style={{ fontSize: "1.6rem" }}>{entry.mood}</span>
        </div>
        {entry.tags.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: "0.4rem",
              flexWrap: "wrap",
              marginBottom: "2rem",
            }}
          >
            {entry.tags.map((t) => (
              <span
                key={t}
                style={{
                  background: "rgba(200,135,58,0.12)",
                  color: "#c8873a",
                  fontFamily: "'DM Mono',monospace",
                  fontSize: "0.68rem",
                  padding: "0.2rem 0.6rem",
                  borderRadius: "2px",
                }}
              >
                {t}
              </span>
            ))}
          </div>
        )}
        <div
          style={{
            fontFamily: "'Lora',serif",
            fontSize: "1.05rem",
            lineHeight: 1.85,
            color: "#1a1410",
            whiteSpace: "pre-wrap",
          }}
        >
          {entry.content}
        </div>
        {entry.updatedAt !== entry.createdAt && (
          <p
            style={{
              fontFamily: "'DM Mono',monospace",
              fontSize: "0.65rem",
              color: "#7a6f62",
              marginTop: "3rem",
              paddingTop: "1.5rem",
              borderTop: "1px solid rgba(26,20,16,0.08)",
            }}
          >
            Last edited {fmtShort(entry.updatedAt)}
          </p>
        )}
      </main>
      {confirmDel && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(26,20,16,0.45)",
            zIndex: 500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#fffdf8",
              border: "1px solid rgba(26,20,16,0.1)",
              borderRadius: "3px",
              padding: "2rem",
              maxWidth: 360,
              width: "90%",
              textAlign: "center",
            }}
          >
            <h3
              style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: "1.2rem",
                fontWeight: 700,
                marginBottom: "0.6rem",
              }}
            >
              Delete this entry?
            </h3>
            <p
              style={{
                fontFamily: "'DM Mono',monospace",
                fontSize: "0.75rem",
                color: "#7a6f62",
                marginBottom: "1.5rem",
              }}
            >
              This can't be undone.
            </p>
            <div
              style={{
                display: "flex",
                gap: "0.6rem",
                justifyContent: "center",
              }}
            >
              <button
                onClick={() => setConfirmDel(false)}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(26,20,16,0.2)",
                  padding: "0.6rem 1.2rem",
                  fontFamily: "'DM Mono',monospace",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  borderRadius: "2px",
                }}
              >
                Cancel
              </button>
              <button
                onClick={onDelete}
                style={{
                  background: "#c0392b",
                  color: "#fff",
                  border: "none",
                  padding: "0.6rem 1.2rem",
                  fontFamily: "'DM Mono',monospace",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  borderRadius: "2px",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PAGE: Settings ────────────────────────────────────────
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

// ─── PAGE: Calendar Heatmap ────────────────────────────────
function CalendarPage({
  user,
  entries,
  onNav,
  onSelectEntry,
  onNewEntry,
}: {
  user: User;
  entries: Entry[];
  onNav: (p: Page) => void;
  onSelectEntry: (id: string) => void;
  onNewEntry: () => void;
}) {
  const myEntries = entries.filter((e) => e.userId === user.id);
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // Build day → entries map for the year
  const dayMap = useMemo(() => {
    const m: Record<string, Entry[]> = {};
    myEntries.forEach((e) => {
      const d = e.createdAt.slice(0, 10);
      if (!m[d]) m[d] = [];
      m[d].push(e);
    });
    return m;
  }, [myEntries]);

  // Build full year grid: 53 weeks × 7 days
  const weeks = useMemo(() => {
    const jan1 = new Date(viewYear, 0, 1);
    // Start grid from the Sunday before Jan 1
    const startOffset = jan1.getDay(); // 0=Sun
    const gridStart = new Date(jan1);
    gridStart.setDate(jan1.getDate() - startOffset);
    const grid: Date[][] = [];
    let cur = new Date(gridStart);
    for (let w = 0; w < 53; w++) {
      const week: Date[] = [];
      for (let d = 0; d < 7; d++) {
        week.push(new Date(cur));
        cur.setDate(cur.getDate() + 1);
      }
      grid.push(week);
    }
    return grid;
  }, [viewYear]);

  const maxCount = Math.max(1, ...Object.values(dayMap).map((a) => a.length));
  const getIntensity = (count: number) => {
    if (count === 0) return 0;
    const r = count / maxCount;
    if (r < 0.25) return 1;
    if (r < 0.5) return 2;
    if (r < 0.75) return 3;
    return 4;
  };
  const heatColors = [
    "rgba(26,20,16,0.07)",
    "rgba(200,135,58,0.25)",
    "rgba(200,135,58,0.5)",
    "rgba(200,135,58,0.75)",
    "#c8873a",
  ];

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  // Month label positions: find which week each month starts
  const monthLabels = useMemo(() => {
    const labels: { month: number; week: number }[] = [];
    weeks.forEach((week, wi) => {
      const firstDay = week.find((d) => d.getFullYear() === viewYear);
      if (firstDay && firstDay.getDate() <= 7 && wi > 0)
        labels.push({ month: firstDay.getMonth(), week: wi });
    });
    return labels;
  }, [weeks, viewYear]);

  const selectedEntries = selectedDay ? dayMap[selectedDay] || [] : [];
  const totalDays = Object.keys(dayMap).filter((d) =>
    d.startsWith(String(viewYear)),
  ).length;
  const totalWords = myEntries
    .filter((e) => e.createdAt.startsWith(String(viewYear)))
    .reduce(
      (s, e) =>
        s + (e.content.trim() ? e.content.trim().split(/\s+/).length : 0),
      0,
    );
  const streakVal = streakCount(entries, user.id);

  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)" }}>
      <AppNav
        user={user}
        onNav={onNav}
        onNewEntry={onNewEntry}
        activeMenuItems={["calendar"]}
      />
      <main style={{ maxWidth: 960, margin: "0 auto", padding: "3rem 5%" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: "2.5rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: "2rem",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: "var(--ink)",
                marginBottom: "0.3rem",
              }}
            >
              Your writing year.
            </h1>
            <p
              style={{
                fontFamily: "'DM Mono',monospace",
                fontSize: "0.72rem",
                color: "#7a6f62",
              }}
            >
              Every square is a day. Every filled square, a story told.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <button
              onClick={() => setViewYear((y) => y - 1)}
              style={{
                background: "transparent",
                border: "1px solid rgba(26,20,16,0.15)",
                padding: "0.4rem 0.8rem",
                fontFamily: "'DM Mono',monospace",
                fontSize: "0.72rem",
                cursor: "pointer",
                borderRadius: "2px",
                color: "var(--ink)",
              }}
            >
              ←
            </button>
            <span
              style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: "1.1rem",
                fontWeight: 700,
                minWidth: 50,
                textAlign: "center",
              }}
            >
              {viewYear}
            </span>
            <button
              onClick={() => setViewYear((y) => y + 1)}
              disabled={viewYear >= today.getFullYear()}
              style={{
                background: "transparent",
                border: "1px solid rgba(26,20,16,0.15)",
                padding: "0.4rem 0.8rem",
                fontFamily: "'DM Mono',monospace",
                fontSize: "0.72rem",
                cursor:
                  viewYear >= today.getFullYear() ? "not-allowed" : "pointer",
                borderRadius: "2px",
                color: viewYear >= today.getFullYear() ? "#ccc" : "var(--ink)",
                opacity: viewYear >= today.getFullYear() ? 0.4 : 1,
              }}
            >
              →
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: "1rem",
            marginBottom: "2.5rem",
          }}
        >
          {[
            { label: "Days written", val: totalDays },
            { label: "Words written", val: totalWords.toLocaleString() },
            {
              label: "Current streak",
              val: `🔥 ${streakVal} day${streakVal !== 1 ? "s" : ""}`,
            },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: "#fffdf8",
                border: "1px solid rgba(26,20,16,0.08)",
                padding: "1.25rem 1.5rem",
                borderRadius: "2px",
              }}
            >
              <p
                style={{
                  fontFamily: "'DM Mono',monospace",
                  fontSize: "0.65rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "#7a6f62",
                  marginBottom: "0.4rem",
                }}
              >
                {s.label}
              </p>
              <p
                style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: "1.6rem",
                  fontWeight: 700,
                  color: "var(--ink)",
                }}
              >
                {s.val}
              </p>
            </div>
          ))}
        </div>

        {/* Heatmap */}
        <div
          style={{
            background: "#fffdf8",
            border: "1px solid rgba(26,20,16,0.08)",
            borderRadius: "2px",
            padding: "1.5rem 1.75rem",
            marginBottom: "1.5rem",
            overflowX: "auto",
          }}
        >
          {/* Month labels */}
          <div
            style={{ display: "flex", marginBottom: "0.4rem", paddingLeft: 28 }}
          >
            {weeks.map((_, wi) => {
              const ml = monthLabels.find((m) => m.week === wi);
              return (
                <div
                  key={wi}
                  style={{
                    width: 14,
                    flexShrink: 0,
                    fontFamily: "'DM Mono',monospace",
                    fontSize: "0.58rem",
                    color: "#7a6f62",
                    marginRight: 2,
                  }}
                >
                  {ml ? months[ml.month] : ""}
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 0 }}>
            {/* Day labels */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginRight: 6,
                paddingTop: 2,
              }}
            >
              {["", "M", "", "W", "", "F", ""].map((d, i) => (
                <div
                  key={i}
                  style={{
                    height: 14,
                    marginBottom: 2,
                    fontFamily: "'DM Mono',monospace",
                    fontSize: "0.58rem",
                    color: "#7a6f62",
                    lineHeight: "14px",
                    width: 18,
                    textAlign: "right",
                  }}
                >
                  {d}
                </div>
              ))}
            </div>
            {/* Grid */}
            <div style={{ display: "flex", gap: 2 }}>
              {weeks.map((week, wi) => (
                <div
                  key={wi}
                  style={{ display: "flex", flexDirection: "column", gap: 2 }}
                >
                  {week.map((day, di) => {
                    const dayStr = isoDay(day);
                    const isThisYear = day.getFullYear() === viewYear;
                    const count = dayMap[dayStr]?.length || 0;
                    const intensity = isThisYear ? getIntensity(count) : 0;
                    const isFuture = day > today;
                    const isSelected = selectedDay === dayStr;
                    const isToday = dayStr === isoDay(today);
                    return (
                      <div
                        key={di}
                        onClick={() => {
                          if (isThisYear && !isFuture && count > 0)
                            setSelectedDay((s) =>
                              s === dayStr ? null : dayStr,
                            );
                        }}
                        title={
                          isThisYear
                            ? `${dayStr}${count > 0 ? ` · ${count} entr${count === 1 ? "y" : "ies"}` : ""}`
                            : ""
                        }
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: 2,
                          background:
                            isFuture || !isThisYear
                              ? "transparent"
                              : heatColors[intensity],
                          cursor:
                            isThisYear && !isFuture && count > 0
                              ? "pointer"
                              : "default",
                          outline: isSelected
                            ? "2px solid #1a1410"
                            : isToday
                              ? "2px solid #c8873a"
                              : "none",
                          outlineOffset: 1,
                          transition: "transform 0.1s",
                          flexShrink: 0,
                        }}
                        onMouseEnter={(e) => {
                          if (count > 0)
                            (
                              e.currentTarget as HTMLDivElement
                            ).style.transform = "scale(1.4)";
                        }}
                        onMouseLeave={(e) =>
                          ((e.currentTarget as HTMLDivElement).style.transform =
                            "")
                        }
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          {/* Legend */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              marginTop: "1rem",
              justifyContent: "flex-end",
            }}
          >
            <span
              style={{
                fontFamily: "'DM Mono',monospace",
                fontSize: "0.6rem",
                color: "#7a6f62",
              }}
            >
              Less
            </span>
            {heatColors.map((c, i) => (
              <div
                key={i}
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 2,
                  background: c,
                }}
              />
            ))}
            <span
              style={{
                fontFamily: "'DM Mono',monospace",
                fontSize: "0.6rem",
                color: "#7a6f62",
              }}
            >
              More
            </span>
          </div>
        </div>

        {/* Selected day panel */}
        {selectedDay && (
          <div
            style={{
              background: "#fffdf8",
              border: "1px solid rgba(200,135,58,0.3)",
              borderRadius: "2px",
              padding: "1.5rem 1.75rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1rem",
              }}
            >
              <h3
                style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "var(--ink)",
                }}
              >
                {fmtShort(selectedDay)}
              </h3>
              <button
                onClick={() => setSelectedDay(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "'DM Mono',monospace",
                  fontSize: "0.8rem",
                  color: "#7a6f62",
                }}
              >
                ×
              </button>
            </div>
            <div style={{ display: "grid", gap: "0.75rem" }}>
              {selectedEntries.map((e) => (
                <div
                  key={e.id}
                  onClick={() => onSelectEntry(e.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.8rem",
                    padding: "0.75rem 1rem",
                    background: "var(--paper)",
                    border: "1px solid rgba(26,20,16,0.08)",
                    borderRadius: "2px",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(ev) =>
                    ((ev.currentTarget as HTMLDivElement).style.background =
                      "#ede6d6")
                  }
                  onMouseLeave={(ev) =>
                    ((ev.currentTarget as HTMLDivElement).style.background =
                      "var(--paper)")
                  }
                >
                  <span style={{ fontSize: "1.2rem" }}>{e.mood}</span>
                  <div>
                    <p
                      style={{
                        fontFamily: "'Playfair Display',serif",
                        fontSize: "0.95rem",
                        fontWeight: 700,
                        color: "var(--ink)",
                      }}
                    >
                      {e.title || "Untitled"}
                    </p>
                    <p
                      style={{
                        fontFamily: "'DM Mono',monospace",
                        fontSize: "0.68rem",
                        color: "#7a6f62",
                      }}
                    >
                      {excerpt(e.content, 60)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No entries CTA */}
        {myEntries.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "3rem",
              background: "#fffdf8",
              border: "1px solid rgba(26,20,16,0.08)",
              borderRadius: "2px",
              marginTop: "1rem",
            }}
          >
            <p
              style={{
                fontFamily: "'DM Mono',monospace",
                fontSize: "0.78rem",
                color: "#7a6f62",
                marginBottom: "1rem",
              }}
            >
              Your calendar is empty. Write your first entry to see it fill up.
            </p>
            <button
              onClick={onNewEntry}
              style={{
                background: "#c8873a",
                color: "#fff",
                border: "none",
                padding: "0.65rem 1.4rem",
                fontFamily: "'DM Mono',monospace",
                fontSize: "0.75rem",
                cursor: "pointer",
                borderRadius: "2px",
              }}
            >
              Write today's entry →
            </button>
          </div>
        )}

        {/* Monthly breakdown */}
        {myEntries.length > 0 && (
          <div style={{ marginTop: "2rem" }}>
            <h2
              style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: "1.2rem",
                fontWeight: 700,
                marginBottom: "1rem",
                color: "var(--ink)",
              }}
            >
              By month
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(6,1fr)",
                gap: "0.75rem",
              }}
            >
              {months.map((m, mi) => {
                const count = myEntries.filter((e) => {
                  const d = new Date(e.createdAt);
                  return d.getFullYear() === viewYear && d.getMonth() === mi;
                }).length;
                return (
                  <div
                    key={m}
                    style={{
                      background: "#fffdf8",
                      border: "1px solid rgba(26,20,16,0.08)",
                      borderRadius: "2px",
                      padding: "1rem",
                      textAlign: "center",
                    }}
                  >
                    <p
                      style={{
                        fontFamily: "'DM Mono',monospace",
                        fontSize: "0.65rem",
                        color: "#7a6f62",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        marginBottom: "0.3rem",
                      }}
                    >
                      {m}
                    </p>
                    <p
                      style={{
                        fontFamily: "'Playfair Display',serif",
                        fontSize: "1.4rem",
                        fontWeight: 700,
                        color: count > 0 ? "#c8873a" : "rgba(26,20,16,0.2)",
                      }}
                    >
                      {count}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ─── PAGE: Mood Analytics ──────────────────────────────────
function AnalyticsPage({
  user,
  entries,
  onNav,
  onNewEntry,
}: {
  user: User;
  entries: Entry[];
  onNav: (p: Page) => void;
  onNewEntry: () => void;
}) {
  const myEntries = entries.filter((e) => e.userId === user.id);
  const [range, setRange] = useState<"30" | "90" | "365">("90");

  const filtered = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - parseInt(range));
    return myEntries
      .filter((e) => new Date(e.createdAt) >= cutoff)
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
  }, [myEntries, range]);

  // Mood frequency
  const moodFreq = useMemo(() => {
    const f: Record<string, number> = {};
    filtered.forEach((e) => {
      f[e.mood] = (f[e.mood] || 0) + 1;
    });
    return Object.entries(f).sort((a, b) => b[1] - a[1]);
  }, [filtered]);

  // Tag frequency
  const tagFreq = useMemo(() => {
    const f: Record<string, number> = {};
    filtered.forEach((e) =>
      e.tags.forEach((t) => {
        f[t] = (f[t] || 0) + 1;
      }),
    );
    return Object.entries(f)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }, [filtered]);

  // Day of week distribution
  const dowCounts = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const c = Array(7).fill(0);
    filtered.forEach((e) => {
      c[new Date(e.createdAt).getDay()]++;
    });
    return days.map((d, i) => ({ day: d, count: c[i] }));
  }, [filtered]);
  const maxDow = Math.max(1, ...dowCounts.map((d) => d.count));

  // Weekly word count for the line-ish chart
  const weeklyData = useMemo(() => {
    const weeks: Record<string, { words: number; entries: number }> = {};
    filtered.forEach((e) => {
      const d = new Date(e.createdAt);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = isoDay(weekStart);
      if (!weeks[key]) weeks[key] = { words: 0, entries: 0 };
      weeks[key].words += e.content.trim()
        ? e.content.trim().split(/\s+/).length
        : 0;
      weeks[key].entries++;
    });
    return Object.entries(weeks)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, data]) => ({ week, ...data }));
  }, [filtered]);
  const maxWords = Math.max(1, ...weeklyData.map((w) => w.words));

  // Summary stats
  const totalWords = filtered.reduce(
    (s, e) => s + (e.content.trim() ? e.content.trim().split(/\s+/).length : 0),
    0,
  );
  const avgWords = filtered.length
    ? Math.round(totalWords / filtered.length)
    : 0;
  const topMood = moodFreq[0];

  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)" }}>
      <AppNav
        user={user}
        onNav={onNav}
        onNewEntry={onNewEntry}
        activeMenuItems={["analytics"]}
      />
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "3rem 5%" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: "2.5rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: "2rem",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: "var(--ink)",
                marginBottom: "0.3rem",
              }}
            >
              Your inner weather.
            </h1>
            <p
              style={{
                fontFamily: "'DM Mono',monospace",
                fontSize: "0.72rem",
                color: "#7a6f62",
              }}
            >
              Patterns in your writing, made visible.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.4rem" }}>
            {(["30", "90", "365"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                style={{
                  background: range === r ? "#1a1410" : "transparent",
                  color: range === r ? "#f5f0e8" : "#7a6f62",
                  border: "1px solid rgba(26,20,16,0.15)",
                  padding: "0.4rem 0.9rem",
                  fontFamily: "'DM Mono',monospace",
                  fontSize: "0.7rem",
                  cursor: "pointer",
                  borderRadius: "2px",
                  transition: "all 0.15s",
                }}
              >
                {r === "365" ? "1yr" : `${r}d`}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "5rem 2rem",
              background: "#fffdf8",
              border: "1px solid rgba(26,20,16,0.08)",
              borderRadius: "2px",
            }}
          >
            <p
              style={{
                fontFamily: "'DM Mono',monospace",
                fontSize: "0.78rem",
                color: "#7a6f62",
                marginBottom: "1rem",
              }}
            >
              No entries in this time range yet.
            </p>
            <button
              onClick={onNewEntry}
              style={{
                background: "#c8873a",
                color: "#fff",
                border: "none",
                padding: "0.65rem 1.4rem",
                fontFamily: "'DM Mono',monospace",
                fontSize: "0.75rem",
                cursor: "pointer",
                borderRadius: "2px",
              }}
            >
              Write your first entry →
            </button>
          </div>
        )}

        {filtered.length > 0 && (
          <>
            {/* Summary cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4,1fr)",
                gap: "1rem",
                marginBottom: "2rem",
              }}
            >
              {[
                { label: "Entries", val: filtered.length },
                { label: "Total words", val: totalWords.toLocaleString() },
                { label: "Avg words", val: avgWords },
                { label: "Top mood", val: topMood ? topMood[0] : "—" },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    background: "#fffdf8",
                    border: "1px solid rgba(26,20,16,0.08)",
                    padding: "1.25rem 1.5rem",
                    borderRadius: "2px",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'DM Mono',monospace",
                      fontSize: "0.65rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: "#7a6f62",
                      marginBottom: "0.4rem",
                    }}
                  >
                    {s.label}
                  </p>
                  <p
                    style={{
                      fontFamily: "'Playfair Display',serif",
                      fontSize: "1.6rem",
                      fontWeight: 700,
                      color: "var(--ink)",
                    }}
                  >
                    {s.val}
                  </p>
                </div>
              ))}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1.5rem",
                marginBottom: "1.5rem",
              }}
            >
              {/* Mood breakdown */}
              <div
                style={{
                  background: "#fffdf8",
                  border: "1px solid rgba(26,20,16,0.08)",
                  borderRadius: "2px",
                  padding: "1.5rem",
                }}
              >
                <h3
                  style={{
                    fontFamily: "'Playfair Display',serif",
                    fontSize: "1.05rem",
                    fontWeight: 700,
                    marginBottom: "1.25rem",
                    color: "var(--ink)",
                  }}
                >
                  Mood breakdown
                </h3>
                {moodFreq.length === 0 && (
                  <p
                    style={{
                      fontFamily: "'DM Mono',monospace",
                      fontSize: "0.72rem",
                      color: "#7a6f62",
                    }}
                  >
                    No mood data yet.
                  </p>
                )}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.65rem",
                  }}
                >
                  {moodFreq.map(([mood, count]) => {
                    const pct = Math.round((count / filtered.length) * 100);
                    return (
                      <div key={mood}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: "0.25rem",
                          }}
                        >
                          <span style={{ fontSize: "1rem" }}>
                            {mood}{" "}
                            <span
                              style={{
                                fontFamily: "'DM Mono',monospace",
                                fontSize: "0.7rem",
                                color: "#7a6f62",
                                marginLeft: "0.3rem",
                              }}
                            >
                              {MOOD_LABELS[mood] || ""}
                            </span>
                          </span>
                          <span
                            style={{
                              fontFamily: "'DM Mono',monospace",
                              fontSize: "0.7rem",
                              color: "#7a6f62",
                            }}
                          >
                            {pct}% · {count}
                          </span>
                        </div>
                        <div
                          style={{
                            height: 6,
                            background: "rgba(26,20,16,0.07)",
                            borderRadius: 3,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${pct}%`,
                              background: "#c8873a",
                              borderRadius: 3,
                              transition: "width 0.6s ease",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Day of week */}
              <div
                style={{
                  background: "#fffdf8",
                  border: "1px solid rgba(26,20,16,0.08)",
                  borderRadius: "2px",
                  padding: "1.5rem",
                }}
              >
                <h3
                  style={{
                    fontFamily: "'Playfair Display',serif",
                    fontSize: "1.05rem",
                    fontWeight: 700,
                    marginBottom: "1.25rem",
                    color: "var(--ink)",
                  }}
                >
                  When you write
                </h3>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: "0.5rem",
                    height: 140,
                    paddingTop: "0.5rem",
                  }}
                >
                  {dowCounts.map(({ day, count }) => {
                    const h =
                      count === 0
                        ? 4
                        : Math.max(8, Math.round((count / maxDow) * 120));
                    return (
                      <div
                        key={day}
                        style={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "0.3rem",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "'DM Mono',monospace",
                            fontSize: "0.62rem",
                            color: "#7a6f62",
                          }}
                        >
                          {count || ""}
                        </span>
                        <div
                          style={{
                            width: "100%",
                            height: h,
                            background:
                              count > 0 ? "#c8873a" : "rgba(26,20,16,0.07)",
                            borderRadius: "2px 2px 0 0",
                            transition: "height 0.5s ease",
                          }}
                        />
                        <span
                          style={{
                            fontFamily: "'DM Mono',monospace",
                            fontSize: "0.6rem",
                            color: "#7a6f62",
                          }}
                        >
                          {day}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Weekly words chart */}
            {weeklyData.length > 1 && (
              <div
                style={{
                  background: "#fffdf8",
                  border: "1px solid rgba(26,20,16,0.08)",
                  borderRadius: "2px",
                  padding: "1.5rem",
                  marginBottom: "1.5rem",
                }}
              >
                <h3
                  style={{
                    fontFamily: "'Playfair Display',serif",
                    fontSize: "1.05rem",
                    fontWeight: 700,
                    marginBottom: "1.25rem",
                    color: "var(--ink)",
                  }}
                >
                  Words per week
                </h3>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: "4px",
                    height: 120,
                    overflowX: "auto",
                  }}
                >
                  {weeklyData.map(({ week, words }) => {
                    const h = Math.max(4, Math.round((words / maxWords) * 110));
                    const d = new Date(week);
                    const label = `${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
                    return (
                      <div
                        key={week}
                        title={`${label}: ${words} words`}
                        style={{
                          flex: "0 0 auto",
                          width: 24,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <div
                          style={{
                            width: "100%",
                            height: h,
                            background: "#c8873a",
                            borderRadius: "2px 2px 0 0",
                            opacity: 0.85,
                            transition: "height 0.4s",
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "0.4rem",
                  }}
                >
                  {weeklyData.length > 0 && (
                    <span
                      style={{
                        fontFamily: "'DM Mono',monospace",
                        fontSize: "0.6rem",
                        color: "#7a6f62",
                      }}
                    >
                      {new Date(weeklyData[0].week).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric" },
                      )}
                    </span>
                  )}
                  {weeklyData.length > 1 && (
                    <span
                      style={{
                        fontFamily: "'DM Mono',monospace",
                        fontSize: "0.6rem",
                        color: "#7a6f62",
                      }}
                    >
                      {new Date(
                        weeklyData[weeklyData.length - 1].week,
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Top tags */}
            {tagFreq.length > 0 && (
              <div
                style={{
                  background: "#fffdf8",
                  border: "1px solid rgba(26,20,16,0.08)",
                  borderRadius: "2px",
                  padding: "1.5rem",
                }}
              >
                <h3
                  style={{
                    fontFamily: "'Playfair Display',serif",
                    fontSize: "1.05rem",
                    fontWeight: 700,
                    marginBottom: "1.25rem",
                    color: "var(--ink)",
                  }}
                >
                  Your most-used tags
                </h3>
                <div
                  style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}
                >
                  {tagFreq.map(([tag, count], i) => {
                    const size = i === 0 ? 1.1 : i < 3 ? 0.95 : 0.82;
                    const opacity = 1 - i * 0.06;
                    return (
                      <span
                        key={tag}
                        style={{
                          background: "rgba(200,135,58,0.12)",
                          color: "#c8873a",
                          fontFamily: "'DM Mono',monospace",
                          fontSize: `${size}rem`,
                          padding: "0.35rem 0.8rem",
                          borderRadius: "2px",
                          opacity,
                          border: `1px solid rgba(200,135,58,${0.3 - i * 0.02})`,
                        }}
                      >
                        {tag}{" "}
                        <span style={{ opacity: 0.6, fontSize: "0.85em" }}>
                          ×{count}
                        </span>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

// ─── PAGE: Collections ─────────────────────────────────────
function CollectionsPage({
  user,
  entries,
  collections,
  onNav,
  onUpdateCollections,
  onSelectEntry,
  onNewEntry,
}: {
  user: User;
  entries: Entry[];
  collections: Collection[];
  onNav: (p: Page) => void;
  onUpdateCollections: (c: Collection[]) => void;
  onSelectEntry: (id: string) => void;
  onNewEntry: () => void;
}) {
  const myCollections = collections.filter((c) => c.userId === user.id);
  const myEntries = entries.filter((e) => e.userId === user.id);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(COLLECTION_COLORS[0]);
  const [newEmoji, setNewEmoji] = useState(COLLECTION_EMOJIS[0]);
  const [activeCollection, setActiveCollection] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const createCollection = () => {
    if (!newName.trim()) return;
    const c: Collection = {
      id: uid(),
      userId: user.id,
      name: newName.trim(),
      color: newColor,
      emoji: newEmoji,
      createdAt: new Date().toISOString(),
    };
    const next = [...collections, c];
    storage.set("folio_collections", next);
    onUpdateCollections(next);
    setNewName("");
    setShowNew(false);
    _toast?.("Collection created ✓");
  };
  const deleteCollection = (id: string) => {
    const next = collections.filter((c) => c.id !== id);
    storage.set("folio_collections", next);
    onUpdateCollections(next);
    if (activeCollection === id) setActiveCollection(null);
    _toast?.("Collection deleted");
  };

  const getEntries = (cid: string | null) =>
    cid === null
      ? myEntries.filter((e) => !e.collectionId)
      : myEntries.filter((e) => e.collectionId === cid);
  const displayed =
    activeCollection !== undefined ? getEntries(activeCollection) : myEntries;

  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)" }}>
      <AppNav
        user={user}
        onNav={onNav}
        onNewEntry={onNewEntry}
        activeMenuItems={["collections"]}
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "240px 1fr",
          minHeight: "calc(100vh - 60px)",
        }}
      >
        {/* Sidebar */}
        <aside
          style={{
            borderRight: "1px solid rgba(26,20,16,0.08)",
            background: "#fffdf8",
            padding: "2rem 0",
          }}
        >
          <div style={{ padding: "0 1.25rem", marginBottom: "1.5rem" }}>
            <p
              style={{
                fontFamily: "'DM Mono',monospace",
                fontSize: "0.65rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "#7a6f62",
                marginBottom: "0.8rem",
              }}
            >
              Notebooks
            </p>
            {/* All entries */}
            <div
              onClick={() =>
                setActiveCollection(undefined as unknown as string)
              }
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                padding: "0.6rem 0.75rem",
                borderRadius: "2px",
                cursor: "pointer",
                background:
                  activeCollection === undefined
                    ? "rgba(200,135,58,0.1)"
                    : "transparent",
                marginBottom: "0.2rem",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => {
                if (activeCollection !== undefined)
                  (e.currentTarget as HTMLDivElement).style.background =
                    "#f5f0e8";
              }}
              onMouseLeave={(e) => {
                if (activeCollection !== undefined)
                  (e.currentTarget as HTMLDivElement).style.background =
                    "transparent";
              }}
            >
              <span style={{ fontSize: "1rem" }}>📋</span>
              <span
                style={{
                  fontFamily: "'DM Mono',monospace",
                  fontSize: "0.75rem",
                  color:
                    activeCollection === undefined ? "#c8873a" : "var(--ink)",
                  fontWeight: activeCollection === undefined ? 500 : 400,
                }}
              >
                All entries
              </span>
              <span
                style={{
                  marginLeft: "auto",
                  fontFamily: "'DM Mono',monospace",
                  fontSize: "0.65rem",
                  color: "#7a6f62",
                }}
              >
                {myEntries.length}
              </span>
            </div>
            {/* Uncategorized */}
            {myEntries.filter((e) => !e.collectionId).length > 0 && (
              <div
                onClick={() => setActiveCollection(null)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  padding: "0.6rem 0.75rem",
                  borderRadius: "2px",
                  cursor: "pointer",
                  background:
                    activeCollection === null
                      ? "rgba(200,135,58,0.1)"
                      : "transparent",
                  marginBottom: "0.2rem",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (activeCollection !== null)
                    (e.currentTarget as HTMLDivElement).style.background =
                      "#f5f0e8";
                }}
                onMouseLeave={(e) => {
                  if (activeCollection !== null)
                    (e.currentTarget as HTMLDivElement).style.background =
                      "transparent";
                }}
              >
                <span style={{ fontSize: "1rem" }}>📄</span>
                <span
                  style={{
                    fontFamily: "'DM Mono',monospace",
                    fontSize: "0.75rem",
                    color: activeCollection === null ? "#c8873a" : "var(--ink)",
                    fontWeight: activeCollection === null ? 500 : 400,
                  }}
                >
                  Uncategorized
                </span>
                <span
                  style={{
                    marginLeft: "auto",
                    fontFamily: "'DM Mono',monospace",
                    fontSize: "0.65rem",
                    color: "#7a6f62",
                  }}
                >
                  {myEntries.filter((e) => !e.collectionId).length}
                </span>
              </div>
            )}
          </div>
          {/* Collection list */}
          <div style={{ padding: "0 1.25rem" }}>
            {myCollections.map((c) => {
              const count = getEntries(c.id).length;
              const isActive = activeCollection === c.id;
              return (
                <div
                  key={c.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    padding: "0.6rem 0.75rem",
                    borderRadius: "2px",
                    cursor: "pointer",
                    background: isActive
                      ? "rgba(200,135,58,0.1)"
                      : "transparent",
                    marginBottom: "0.2rem",
                    position: "relative",
                    transition: "background 0.15s",
                  }}
                  onClick={() => setActiveCollection(c.id)}
                  onMouseEnter={(e) => {
                    if (!isActive)
                      (e.currentTarget as HTMLDivElement).style.background =
                        "#f5f0e8";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive)
                      (e.currentTarget as HTMLDivElement).style.background =
                        "transparent";
                  }}
                >
                  <span style={{ fontSize: "1rem" }}>{c.emoji}</span>
                  <span
                    style={{
                      fontFamily: "'DM Mono',monospace",
                      fontSize: "0.75rem",
                      color: isActive ? "#c8873a" : "var(--ink)",
                      fontWeight: isActive ? 500 : 400,
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {c.name}
                  </span>
                  <span
                    style={{
                      fontFamily: "'DM Mono',monospace",
                      fontSize: "0.65rem",
                      color: "#7a6f62",
                    }}
                  >
                    {count}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCollection(c.id);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#ccc",
                      fontSize: "0.75rem",
                      padding: "0 0.1rem",
                      opacity: 0,
                      position: "absolute",
                      right: "0.5rem",
                    }}
                    className="del-btn"
                    onMouseEnter={(ev) =>
                      ((ev.currentTarget as HTMLButtonElement).style.color =
                        "#c0392b")
                    }
                    onMouseLeave={(ev) =>
                      ((ev.currentTarget as HTMLButtonElement).style.color =
                        "#ccc")
                    }
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
          {/* New collection */}
          <div style={{ padding: "0 1.25rem", marginTop: "1rem" }}>
            {!showNew && (
              <button
                onClick={() => setShowNew(true)}
                style={{
                  background: "transparent",
                  border: "1px dashed rgba(26,20,16,0.2)",
                  borderRadius: "2px",
                  padding: "0.5rem 0.75rem",
                  fontFamily: "'DM Mono',monospace",
                  fontSize: "0.72rem",
                  color: "#7a6f62",
                  cursor: "pointer",
                  width: "100%",
                  textAlign: "left",
                }}
              >
                + New notebook
              </button>
            )}
            {showNew && (
              <div
                style={{
                  background: "var(--paper)",
                  border: "1px solid rgba(26,20,16,0.12)",
                  borderRadius: "2px",
                  padding: "0.75rem",
                }}
              >
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Notebook name…"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") createCollection();
                    if (e.key === "Escape") setShowNew(false);
                  }}
                  style={{
                    ...inputStyle,
                    marginBottom: "0.5rem",
                    fontSize: "0.78rem",
                    padding: "0.4rem 0.6rem",
                  }}
                  autoFocus
                />
                <div
                  style={{
                    display: "flex",
                    gap: "0.3rem",
                    marginBottom: "0.5rem",
                    flexWrap: "wrap",
                  }}
                >
                  {COLLECTION_EMOJIS.map((em) => (
                    <button
                      key={em}
                      onClick={() => setNewEmoji(em)}
                      style={{
                        fontSize: "1rem",
                        background:
                          newEmoji === em
                            ? "rgba(200,135,58,0.15)"
                            : "transparent",
                        border:
                          newEmoji === em
                            ? "1px solid #c8873a"
                            : "1px solid transparent",
                        borderRadius: "4px",
                        padding: "0.1rem 0.2rem",
                        cursor: "pointer",
                      }}
                    >
                      {em}
                    </button>
                  ))}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "0.3rem",
                    marginBottom: "0.6rem",
                  }}
                >
                  {COLLECTION_COLORS.map((col) => (
                    <button
                      key={col}
                      onClick={() => setNewColor(col)}
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        background: col,
                        border:
                          newColor === col
                            ? "3px solid #1a1410"
                            : "2px solid transparent",
                        cursor: "pointer",
                      }}
                    />
                  ))}
                </div>
                <div style={{ display: "flex", gap: "0.4rem" }}>
                  <button
                    onClick={createCollection}
                    style={{
                      background: "#1a1410",
                      color: "#f5f0e8",
                      border: "none",
                      padding: "0.4rem 0.8rem",
                      fontFamily: "'DM Mono',monospace",
                      fontSize: "0.7rem",
                      cursor: "pointer",
                      borderRadius: "2px",
                      flex: 1,
                    }}
                  >
                    Create
                  </button>
                  <button
                    onClick={() => setShowNew(false)}
                    style={{
                      background: "transparent",
                      border: "1px solid rgba(26,20,16,0.15)",
                      padding: "0.4rem 0.8rem",
                      fontFamily: "'DM Mono',monospace",
                      fontSize: "0.7rem",
                      cursor: "pointer",
                      borderRadius: "2px",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main content */}
        <main style={{ padding: "2.5rem 3rem", maxWidth: 680 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1.5rem",
            }}
          >
            <div>
              {activeCollection === undefined && (
                <h2
                  style={{
                    fontFamily: "'Playfair Display',serif",
                    fontSize: "1.4rem",
                    fontWeight: 700,
                    color: "var(--ink)",
                  }}
                >
                  All entries
                </h2>
              )}
              {activeCollection === null && (
                <h2
                  style={{
                    fontFamily: "'Playfair Display',serif",
                    fontSize: "1.4rem",
                    fontWeight: 700,
                    color: "var(--ink)",
                  }}
                >
                  Uncategorized
                </h2>
              )}
              {activeCollection &&
                myCollections.find((c) => c.id === activeCollection) &&
                (() => {
                  const col = myCollections.find(
                    (c) => c.id === activeCollection,
                  )!;
                  return (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.6rem",
                      }}
                    >
                      <span style={{ fontSize: "1.4rem" }}>{col.emoji}</span>
                      <h2
                        style={{
                          fontFamily: "'Playfair Display',serif",
                          fontSize: "1.4rem",
                          fontWeight: 700,
                          color: "var(--ink)",
                        }}
                      >
                        {col.name}
                      </h2>
                    </div>
                  );
                })()}
              <p
                style={{
                  fontFamily: "'DM Mono',monospace",
                  fontSize: "0.7rem",
                  color: "#7a6f62",
                  marginTop: "0.2rem",
                }}
              >
                {
                  displayed.sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime(),
                  ).length
                }{" "}
                entries
              </p>
            </div>
          </div>

          {/* Empty state */}
          {displayed.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "4rem 2rem",
                border: "1px dashed rgba(26,20,16,0.15)",
                borderRadius: "2px",
              }}
            >
              {myCollections.length === 0 && activeCollection === undefined ? (
                <>
                  <p
                    style={{
                      fontFamily: "'Playfair Display',serif",
                      fontSize: "1.1rem",
                      fontStyle: "italic",
                      color: "var(--ink)",
                      marginBottom: "0.6rem",
                    }}
                  >
                    Organize your writing.
                  </p>
                  <p
                    style={{
                      fontFamily: "'DM Mono',monospace",
                      fontSize: "0.72rem",
                      color: "#7a6f62",
                      marginBottom: "1.2rem",
                    }}
                  >
                    Create a notebook to group related entries — travel,
                    therapy, work, dreams.
                  </p>
                  <button
                    onClick={() => setShowNew(true)}
                    style={{
                      background: "#c8873a",
                      color: "#fff",
                      border: "none",
                      padding: "0.6rem 1.3rem",
                      fontFamily: "'DM Mono',monospace",
                      fontSize: "0.75rem",
                      cursor: "pointer",
                      borderRadius: "2px",
                    }}
                  >
                    Create your first notebook
                  </button>
                </>
              ) : (
                <>
                  <p
                    style={{
                      fontFamily: "'DM Mono',monospace",
                      fontSize: "0.75rem",
                      color: "#7a6f62",
                      marginBottom: "1rem",
                    }}
                  >
                    No entries here yet.
                  </p>
                  <button
                    onClick={onNewEntry}
                    style={{
                      background: "#c8873a",
                      color: "#fff",
                      border: "none",
                      padding: "0.6rem 1.3rem",
                      fontFamily: "'DM Mono',monospace",
                      fontSize: "0.75rem",
                      cursor: "pointer",
                      borderRadius: "2px",
                    }}
                  >
                    Write an entry →
                  </button>
                </>
              )}
            </div>
          )}

          {/* Entries */}
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {displayed
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime(),
              )
              .map((e) => (
                <EntryCard
                  key={e.id}
                  entry={e}
                  onClick={() => onSelectEntry(e.id)}
                />
              ))}
          </div>
        </main>
      </div>
      <style>{`.del-btn { opacity: 0 !important; } div:hover > .del-btn { opacity: 1 !important; }`}</style>
    </div>
  );
}

// ─── App Shell ─────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState<Page>("landing");
  const [user, setUser] = useState<User | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const toastRef = useRef<(m: string, t?: "ok" | "err") => void>(() => {});

  useEffect(() => {
    const e: Entry[] = storage.get("folio_entries") || [];
    const c: Collection[] = storage.get("folio_collections") || [];
    setEntries(e);
    setCollections(c);
    const cid = storage.get("folio_current");
    if (cid) {
      const users: User[] = storage.get("folio_users") || [];
      const u = users.find((u: User) => u.id === cid);
      if (u) {
        setUser(u);
        setPage("dashboard");
      }
    }
  }, []);

  const saveEntry = (entry: Entry) => {
    setEntries((prev) => {
      const next = prev.find((e) => e.id === entry.id)
        ? prev.map((e) => (e.id === entry.id ? entry : e))
        : [entry, ...prev];
      storage.set("folio_entries", next);
      return next;
    });
    _toast?.("Entry saved ✓");
  };
  const deleteEntry = (id: string) => {
    setEntries((prev) => {
      const next = prev.filter((e) => e.id !== id);
      storage.set("folio_entries", next);
      return next;
    });
    setPage("dashboard");
    _toast?.("Entry deleted");
  };
  const handleAuth = (u: User) => {
    setUser(u);
    setPage("dashboard");
  };
  const handleLogout = () => {
    storage.set("folio_current", null);
    setUser(null);
    setPage("landing");
  };
  const navTo = (p: Page) => {
    if (
      [
        "dashboard",
        "editor",
        "settings",
        "calendar",
        "analytics",
        "collections",
      ].includes(p) &&
      !user
    ) {
      setAuthMode("login");
      setPage("login");
      return;
    }
    setPage(p);
  };
  const regToast = useCallback((fn: (m: string, t?: "ok" | "err") => void) => {
    toastRef.current = fn;
    _toast = fn;
  }, []);
  const detailEntry = entries.find((e) => e.id === detailId) || null;

  return (
    <>
      {page === "landing" && (
        <Landing
          onNav={(p) => {
            if (p === "signup" || p === "login") {
              setAuthMode(p as "login" | "signup");
            }
            setPage(p);
          }}
        />
      )}
      {(page === "login" || page === "signup") && (
        <AuthPage
          mode={authMode}
          onNav={(p) => {
            if (p === "signup" || p === "login") {
              setAuthMode(p as "login" | "signup");
            }
            setPage(p);
          }}
          onAuth={handleAuth}
        />
      )}
      {page === "dashboard" && user && (
        <Dashboard
          user={user}
          entries={entries}
          collections={collections}
          onNav={navTo}
          onSelectEntry={(id) => {
            setDetailId(id);
            setPage("detail");
          }}
          onNewEntry={() => {
            setEditId(null);
            setPage("editor");
          }}
          onLogout={handleLogout}
        />
      )}
      {page === "editor" && user && (
        <Editor
          user={user}
          entries={entries}
          collections={collections}
          editId={editId}
          onSave={saveEntry}
          onNav={navTo}
          onBack={() => setPage(editId && detailId ? "detail" : "dashboard")}
        />
      )}
      {page === "detail" && detailEntry && (
        <Detail
          entry={detailEntry}
          collections={collections}
          onBack={() => setPage("dashboard")}
          onEdit={() => {
            setEditId(detailEntry.id);
            setPage("editor");
          }}
          onDelete={() => deleteEntry(detailEntry.id)}
        />
      )}
      {page === "settings" && user && (
        <Settings
          user={user}
          onUpdate={(u) => {
            setUser(u);
          }}
          onBack={() => setPage("dashboard")}
          onLogout={handleLogout}
        />
      )}
      {page === "calendar" && user && (
        <CalendarPage
          user={user}
          entries={entries}
          onNav={navTo}
          onSelectEntry={(id) => {
            setDetailId(id);
            setPage("detail");
          }}
          onNewEntry={() => {
            setEditId(null);
            setPage("editor");
          }}
        />
      )}
      {page === "analytics" && user && (
        <AnalyticsPage
          user={user}
          entries={entries}
          onNav={navTo}
          onNewEntry={() => {
            setEditId(null);
            setPage("editor");
          }}
        />
      )}
      {page === "collections" && user && (
        <CollectionsPage
          user={user}
          entries={entries}
          collections={collections}
          onNav={navTo}
          onUpdateCollections={(c) => {
            setCollections(c);
          }}
          onSelectEntry={(id) => {
            setDetailId(id);
            setPage("detail");
          }}
          onNewEntry={() => {
            setEditId(null);
            setPage("editor");
          }}
        />
      )}

      <Toast register={regToast} />
    </>
  );
}
