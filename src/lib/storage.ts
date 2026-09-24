import type { ActionStatus, Highlight } from "@/lib/types";

const HIGHLIGHTS_KEY = "harbor.highlights.v1";
const ACTIONS_KEY = "harbor.actions.v1";
const THEME_KEY = "harbor.theme";

type HighlightMap = Record<string, Highlight[]>;
type ActionMap = Record<string, Record<string, ActionStatus>>;

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function loadUserHighlights(meetingId: string): Highlight[] {
  return readJson<HighlightMap>(HIGHLIGHTS_KEY, {})[meetingId] ?? [];
}

export function saveUserHighlight(meetingId: string, highlight: Highlight): Highlight[] {
  const all = readJson<HighlightMap>(HIGHLIGHTS_KEY, {});
  const next = [...(all[meetingId] ?? []), highlight];
  all[meetingId] = next;
  localStorage.setItem(HIGHLIGHTS_KEY, JSON.stringify(all));
  return next;
}

export function removeUserHighlight(meetingId: string, highlightId: string): Highlight[] {
  const all = readJson<HighlightMap>(HIGHLIGHTS_KEY, {});
  const next = (all[meetingId] ?? []).filter((h) => h.id !== highlightId);
  all[meetingId] = next;
  localStorage.setItem(HIGHLIGHTS_KEY, JSON.stringify(all));
  return next;
}

export function loadActionOverrides(meetingId: string): Record<string, ActionStatus> {
  return readJson<ActionMap>(ACTIONS_KEY, {})[meetingId] ?? {};
}

export function saveActionStatus(meetingId: string, actionId: string, status: ActionStatus) {
  const all = readJson<ActionMap>(ACTIONS_KEY, {});
  all[meetingId] = { ...(all[meetingId] ?? {}), [actionId]: status };
  localStorage.setItem(ACTIONS_KEY, JSON.stringify(all));
}

export function loadTheme(): "light" | "dark" {
  const value = readJson<"light" | "dark" | null>(THEME_KEY, null);
  if (value === "light" || value === "dark") return value;
  if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

export function saveTheme(theme: "light" | "dark") {
  localStorage.setItem(THEME_KEY, JSON.stringify(theme));
}
