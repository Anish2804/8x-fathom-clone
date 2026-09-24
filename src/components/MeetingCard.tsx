import Link from "next/link";
import { AvatarStack } from "@/components/Avatar";
import { StatusBadge, TypeBadge } from "@/components/Badges";
import { formatDuration, formatMeetingTime, relativeDay } from "@/lib/format";
import type { Meeting } from "@/lib/types";

export function MeetingCard({
  meeting,
  compact = false,
}: {
  meeting: Meeting;
  compact?: boolean;
}) {
  return (
    <Link
      href={`/meetings/${meeting.id}`}
      className="surface meeting-card group block rounded-2xl p-4 hover:border-[var(--accent)]/35"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={meeting.status} />
            <TypeBadge type={meeting.type} />
            <span className="text-[11px] text-[var(--muted)]">{meeting.platform}</span>
          </div>
          <h3 className="font-[family-name:var(--font-display)] text-lg leading-snug tracking-tight group-hover:text-[var(--accent)]">
            {meeting.title}
          </h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {relativeDay(meeting.startsAt)} · {formatMeetingTime(meeting.startsAt)} · {formatDuration(meeting.durationMin)}
          </p>
        </div>
        <AvatarStack people={meeting.participants} />
      </div>
      {!compact && meeting.overview && (
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[var(--ink-soft)]">{meeting.overview}</p>
      )}
      <p className="mt-3 text-xs text-[var(--muted)]">{meeting.team} · {meeting.participants.length} people</p>
    </Link>
  );
}

export function EmptyState({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--bg-elev)] px-6 py-16 text-center">
      <p className="font-[family-name:var(--font-display)] text-xl">{title}</p>
      <p className="mt-2 text-sm text-[var(--muted)]">{body}</p>
    </div>
  );
}
