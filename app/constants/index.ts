import type { Entry } from "../types";

export const MOODS = ["😊", "😔", "😤", "😌", "🤔", "😴", "🥳", "😰", "❤️", "🌱"];
export const MOOD_LABELS: Record<string, string> = {
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
export const COLLECTION_COLORS = [
  "#c8873a",
  "#6b7c5e",
  "#7c6b8e",
  "#4a7c99",
  "#c05a5a",
  "#7c8e6b",
];
export const COLLECTION_EMOJIS = [
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

export const SAMPLE_ENTRIES: Entry[] = [
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
