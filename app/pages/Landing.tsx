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


export { Landing };
