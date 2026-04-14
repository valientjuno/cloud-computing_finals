// ─── Types ────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  password: string;
  notifications: boolean;
}
export interface Entry {
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
export interface Collection {
  id: string;
  userId: string;
  name: string;
  color: string;
  emoji: string;
  createdAt: string;
}
export type Page =
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
