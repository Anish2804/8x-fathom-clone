import type { SummaryTemplateId } from "@/lib/templates";
import type { ActionStatus, Highlight } from "@/lib/types";

const HIGHLIGHTS_KEY = "harbor.highlights.v1";
const ACTIONS_KEY = "harbor.actions.v1";
const THEME_KEY = "harbor.theme";
const TEMPLATES_KEY = "harbor.templates.v1";
const CALENDAR_KEY = "harbor.calendar.v1";

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
  return "dark";
}

export function saveTheme(theme: "light" | "dark") {
  localStorage.setItem(THEME_KEY, JSON.stringify(theme));
}

const templateListeners = new Set<() => void>();
let templateRaw = "";
let templateSnap: Record<string, SummaryTemplateId> = {};

export function subscribeTemplates(listener: () => void) {
  templateListeners.add(listener);
  return () => templateListeners.delete(listener);
}

export function getTemplateMap(): Record<string, SummaryTemplateId> {
  if (typeof window === "undefined") return templateSnap;
  const raw = localStorage.getItem(TEMPLATES_KEY) ?? "";
  if (raw !== templateRaw) {
    templateRaw = raw;
    templateSnap = readJson<Record<string, SummaryTemplateId>>(TEMPLATES_KEY, {});
  }
  return templateSnap;
}

export function loadMeetingTemplate(meetingId: string): SummaryTemplateId | null {
  return getTemplateMap()[meetingId] ?? null;
}

export function saveMeetingTemplate(meetingId: string, template: SummaryTemplateId) {
  const all = { ...getTemplateMap(), [meetingId]: template };
  const raw = JSON.stringify(all);
  localStorage.setItem(TEMPLATES_KEY, raw);
  templateRaw = raw;
  templateSnap = all;
  templateListeners.forEach((listener) => listener());
}

export type CalendarConnection = {
  connected: boolean;
  account: string;
  workspace: string;
  lastSyncAt: string | null;
};

const defaultCalendar: CalendarConnection = {
  connected: false,
  account: "anish@harbor.dev",
  workspace: "Harbor",
  lastSyncAt: null,
};

const calendarListeners = new Set<() => void>();
let calendarRaw = "";
let calendarSnap: CalendarConnection = defaultCalendar;

export function subscribeCalendar(listener: () => void) {
  calendarListeners.add(listener);
  return () => calendarListeners.delete(listener);
}

export function getCalendarSnapshot(): CalendarConnection {
  if (typeof window === "undefined") return calendarSnap;
  const raw = localStorage.getItem(CALENDAR_KEY) ?? "";
  if (raw !== calendarRaw) {
    calendarRaw = raw;
    calendarSnap = { ...defaultCalendar, ...readJson<Partial<CalendarConnection>>(CALENDAR_KEY, {}) };
  }
  return calendarSnap;
}

export function loadCalendar(): CalendarConnection {
  return getCalendarSnapshot();
}

export function saveCalendar(next: CalendarConnection) {
  const raw = JSON.stringify(next);
  localStorage.setItem(CALENDAR_KEY, raw);
  calendarRaw = raw;
  calendarSnap = next;
  calendarListeners.forEach((listener) => listener());
}

export { defaultCalendar };
