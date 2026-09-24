import { meetings } from "@/data/meetings";
import { formatMeetingDate } from "@/lib/format";
import type { Participant } from "@/lib/types";

export type RecurringTheme = {
  id: string;
  label: string;
  count: number;
  meetings: { id: string; title: string }[];
};

export type OwnerLoad = {
  person: Participant;
  open: number;
  items: string[];
};

export type DecisionBeat = {
  id: string;
  when: string;
  meetingId: string;
  meetingTitle: string;
  text: string;
};

const THEMES: { id: string; label: string; test: RegExp }[] = [
  { id: "reliability", label: "Reliability / incidents", test: /reliab|incident|p95|latency|load.?shed|retry/i },
  { id: "capacity", label: "Capacity / hiring", test: /hire|capacity|headcount|staff|runway/i },
  { id: "custom", label: "Custom work vs product", test: /custom|fork|rewrite|bundle|sku/i },
  { id: "activation", label: "Activation / first-run", test: /activation|onboarding|first-run|tour/i },
  { id: "legal", label: "Security / legal", test: /sso|okta|hipaa|dpa|legal|security/i },
  { id: "acme", label: "Acme expansion risk", test: /acme|harper|400.seat|40-seat/i },
];

export function workspaceTrends() {
  const ready = meetings.filter((m) => m.status === "ready");

  const themes: RecurringTheme[] = THEMES.map((theme) => {
    const found = ready.filter((m) =>
      [m.overview, ...m.takeaways, ...m.decisions, ...m.transcript.map((l) => l.text)].some((t) => theme.test.test(t)),
    );
    return {
      id: theme.id,
      label: theme.label,
      count: found.length,
      meetings: found.map((m) => ({ id: m.id, title: m.title })),
    };
  })
    .filter((t) => t.count >= 2)
    .sort((a, b) => b.count - a.count);

  const ownerMap = new Map<string, OwnerLoad>();
  for (const meeting of ready) {
    for (const item of meeting.actionItems) {
      if (item.status !== "open") continue;
      const person = meeting.participants.find((p) => p.id === item.assigneeId);
      if (!person) continue;
      const curr = ownerMap.get(person.id) ?? { person, open: 0, items: [] };
      curr.open += 1;
      curr.items.push(`${item.text} (${meeting.title})`);
      ownerMap.set(person.id, curr);
    }
  }
  const owners = [...ownerMap.values()].sort((a, b) => b.open - a.open).slice(0, 6);

  const decisions: DecisionBeat[] = ready
    .flatMap((m) =>
      m.decisions.map((text, i) => ({
        id: `${m.id}-${i}`,
        when: formatMeetingDate(m.startsAt),
        meetingId: m.id,
        meetingTitle: m.title,
        text,
        ts: +new Date(m.startsAt),
      })),
    )
    .sort((a, b) => b.ts - a.ts)
    .map((row) => ({
      id: row.id,
      when: row.when,
      meetingId: row.meetingId,
      meetingTitle: row.meetingTitle,
      text: row.text,
    }));

  return {
    meetingCount: ready.length,
    themes,
    owners,
    decisions,
  };
}
