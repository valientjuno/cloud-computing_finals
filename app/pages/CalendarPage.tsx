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


export { CalendarPage };
