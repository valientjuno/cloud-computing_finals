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


export { AnalyticsPage };
