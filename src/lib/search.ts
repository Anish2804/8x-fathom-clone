import type { Meeting, SearchHit } from "@/lib/types";

function clip(text: string, query: string, radius = 72): string {
  const i = text.toLowerCase().indexOf(query.toLowerCase());
  if (i < 0) return text.slice(0, radius * 2).trim();
  const start = Math.max(0, i - radius);
  const end = Math.min(text.length, i + query.length + radius);
  return `${start > 0 ? "…" : ""}${text.slice(start, end).trim()}${end < text.length ? "…" : ""}`;
}

export function searchMeetings(meetings: Meeting[], rawQuery: string): SearchHit[] {
  const query = rawQuery.trim();
  if (query.length < 2) return [];
  const needle = query.toLowerCase();
  const hits: SearchHit[] = [];

  for (const meeting of meetings) {
    if (meeting.title.toLowerCase().includes(needle) || meeting.team.toLowerCase().includes(needle)) {
      hits.push({
        id: `${meeting.id}-title`,
        kind: "meeting",
        meetingId: meeting.id,
        meetingTitle: meeting.title,
        title: meeting.title,
        snippet: `${meeting.team} · ${meeting.overview.slice(0, 140)}…`,
        href: `/meetings/${meeting.id}`,
      });
    }

    for (const person of meeting.participants) {
      if (
        person.name.toLowerCase().includes(needle) ||
        person.email.toLowerCase().includes(needle) ||
        person.role.toLowerCase().includes(needle)
      ) {
        hits.push({
          id: `${meeting.id}-p-${person.id}`,
          kind: "participant",
          meetingId: meeting.id,
          meetingTitle: meeting.title,
          title: person.name,
          snippet: `${person.role} · ${person.email}`,
          href: `/meetings/${meeting.id}`,
        });
      }
    }

    const summaryBlob = [
      meeting.overview,
      ...meeting.takeaways,
      ...meeting.decisions,
      ...meeting.followUps,
      ...meeting.topics.map((t) => t.name),
    ].join(" ");
    if (summaryBlob.toLowerCase().includes(needle)) {
      const source =
        [meeting.overview, ...meeting.takeaways, ...meeting.decisions].find((s) =>
          s.toLowerCase().includes(needle),
        ) ?? meeting.overview;
      hits.push({
        id: `${meeting.id}-summary`,
        kind: "summary",
        meetingId: meeting.id,
        meetingTitle: meeting.title,
        title: "AI summary match",
        snippet: clip(source, query),
        href: `/meetings/${meeting.id}#summary`,
      });
    }

    for (const line of meeting.transcript) {
      if (line.text.toLowerCase().includes(needle)) {
        const speaker = meeting.participants.find((p) => p.id === line.speakerId)?.name ?? "Speaker";
        hits.push({
          id: `${meeting.id}-${line.id}`,
          kind: "transcript",
          meetingId: meeting.id,
          meetingTitle: meeting.title,
          title: `${speaker} in transcript`,
          snippet: clip(line.text, query),
          href: `/meetings/${meeting.id}?t=${line.startMs}&line=${line.id}`,
        });
      }
    }
  }

  const seen = new Set<string>();
  return hits.filter((hit) => {
    const key = `${hit.kind}:${hit.meetingId}:${hit.snippet}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 40);
}
