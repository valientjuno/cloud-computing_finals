import type { Entry } from "../types";

// ─── Utils ────────────────────────────────────────────────
export const storage = {
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
export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
export const fmtShort = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
export const excerpt = (s: string, n = 120) =>
  s.length > n ? s.slice(0, n) + "…" : s;
export const uid = () => Math.random().toString(36).slice(2, 10);
export const streakCount = (entries: Entry[], userId: string) => {
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
export const isoDay = (d: Date) => d.toISOString().slice(0, 10);

