import Link from "next/link";
import { allHighlights } from "@/data/meetings";
import { formatClock, formatMeetingDate } from "@/lib/format";
import { EmptyState } from "@/components/MeetingCard";

export default function HighlightsPage() {
  const items = allHighlights();
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight">Highlights</h1>
      <p className="mt-2 text-[var(--muted)]">
        Key moments saved from transcripts. Open a meeting to add your own — they stay in this browser.
      </p>
      {items.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="No highlights yet" body="Recorded meetings will collect moments here." />
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {items.map(({ meeting, highlight }) => (
            <li key={`${meeting.id}-${highlight.id}`}>
              <Link
                href={`/meetings/${meeting.id}?t=${highlight.startMs}&line=${highlight.lineId ?? ""}`}
                className="block rounded-2xl border border-[var(--line)] bg-[var(--bg-elev)] p-4 hover:border-[var(--accent)]/40"
              >
                <p className="font-mono text-[11px] text-[var(--accent)]">{formatClock(highlight.startMs)}</p>
                <p className="mt-1 text-lg font-medium">{highlight.title}</p>
                <p className="text-sm text-[var(--muted)]">{highlight.description}</p>
                <p className="mt-2 text-xs text-[var(--muted)]">
                  {meeting.title} · {formatMeetingDate(meeting.startsAt)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
