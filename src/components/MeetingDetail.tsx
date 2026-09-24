"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AvatarStack } from "@/components/Avatar";
import { StatusBadge, TypeBadge } from "@/components/Badges";
import { MeetingPlayer, usePlayback } from "@/components/MeetingPlayer";
import { SummaryPane } from "@/components/SummaryPane";
import { TranscriptPane } from "@/components/TranscriptPane";
import { formatDuration, formatMeetingWhen } from "@/lib/format";
import { loadActionOverrides, loadUserHighlights } from "@/lib/storage";
import type { ActionItem, Highlight, Meeting } from "@/lib/types";
import { IconBack, IconClock, IconUsers } from "@/components/icons";

export function MeetingDetail({ meeting }: { meeting: Meeting }) {
  const params = useSearchParams();
  const router = useRouter();
  const start = Number(params.get("t") ?? 0) || 0;
  const line = params.get("line");
  const playback = usePlayback(meeting.durationMin, start);
  const [query, setQuery] = useState("");
  const [activeLine, setActiveLine] = useState<string | null>(line);
  const [userHighlights, setUserHighlights] = useState<Highlight[]>(() =>
    typeof window === "undefined" ? [] : loadUserHighlights(meeting.id),
  );
  const [overrides, setOverrides] = useState<Record<string, ActionItem["status"]>>(() =>
    typeof window === "undefined" ? {} : loadActionOverrides(meeting.id),
  );

  useEffect(() => {
    if (line) {
      document.getElementById(line)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [line]);

  const actionItems = useMemo(
    () => meeting.actionItems.map((item) => ({ ...item, status: overrides[item.id] ?? item.status })),
    [meeting.actionItems, overrides],
  );
  const highlights = [...meeting.highlights, ...userHighlights].sort((a, b) => a.startMs - b.startMs);

  if (meeting.status === "upcoming") {
    return (
      <StateCard
        kicker="Upcoming"
        title={meeting.title}
        body={`Harbor will capture this ${meeting.platform} meeting when it starts. Recording is mocked in this demo, so this stays on the calendar.`}
        meeting={meeting}
      />
    );
  }

  if (meeting.status === "processing") {
    return (
      <StateCard
        kicker="Processing"
        title={meeting.title}
        body="Notes, transcript, and action items usually appear a few minutes after the call. In this demo the recording pipeline is stubbed, so this meeting stays in a processing state."
        meeting={meeting}
      />
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <Link href="/meetings" className="inline-flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--ink)]">
        <IconBack className="h-4 w-4" />
        Meetings
      </Link>

      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap gap-2">
            <StatusBadge status={meeting.status} />
            <TypeBadge type={meeting.type} />
            <span className="text-xs text-[var(--muted)]">{meeting.platform} · {meeting.team}</span>
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight md:text-4xl">{meeting.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-[var(--muted)]">
            <span className="inline-flex items-center gap-1.5">
              <IconClock className="h-4 w-4" />
              {formatMeetingWhen(meeting.startsAt)} · {formatDuration(meeting.durationMin)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <IconUsers className="h-4 w-4" />
              {meeting.participants.length} participants
            </span>
          </div>
        </div>
        <AvatarStack people={meeting.participants} max={8} />
      </header>

      <ul className="flex flex-wrap gap-2">
        {meeting.participants.map((person) => (
          <li
            key={person.id}
            className="rounded-full border border-[var(--line)] bg-[var(--bg-elev)] px-3 py-1 text-xs text-[var(--ink-soft)]"
          >
            {person.name}
            <span className="text-[var(--muted)]"> · {person.role}</span>
          </li>
        ))}
      </ul>

      <MeetingPlayer
        meetingId={meeting.id}
        durationMin={meeting.durationMin}
        currentMs={playback.currentMs}
        onSeek={playback.seek}
        playing={playback.playing}
        onToggle={playback.toggle}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
        <TranscriptPane
          meeting={meeting}
          currentMs={playback.currentMs}
          activeLineId={activeLine}
          query={query}
          onQuery={setQuery}
          onSeek={(ms, id) => {
            playback.seek(ms);
            setActiveLine(id);
            router.replace(`/meetings/${meeting.id}?t=${Math.round(ms)}&line=${id}`, { scroll: false });
          }}
          onHighlight={(h) => setUserHighlights((curr) => [...curr, h])}
        />
        <SummaryPane
          meeting={meeting}
          actionItems={actionItems}
          highlights={highlights}
          currentMs={playback.currentMs}
          onToggleAction={(id, next) => setOverrides((curr) => ({ ...curr, [id]: next }))}
          onJump={(ms) => playback.seek(ms)}
        />
      </div>
    </div>
  );
}

function StateCard({
  kicker,
  title,
  body,
  meeting,
}: {
  kicker: string;
  title: string;
  body: string;
  meeting: Meeting;
}) {
  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/meetings" className="inline-flex items-center gap-1 text-sm text-[var(--muted)]">
        <IconBack className="h-4 w-4" />
        Meetings
      </Link>
      <div className="mt-4 rounded-3xl border border-[var(--line)] bg-[var(--bg-elev)] p-8">
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">{kicker}</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl">{title}</h1>
        <p className="mt-3 text-[var(--ink-soft)]">{body}</p>
        <p className="mt-6 text-sm text-[var(--muted)]">
          {formatMeetingWhen(meeting.startsAt)} · {formatDuration(meeting.durationMin)} · {meeting.platform}
        </p>
        <div className="mt-4">
          <AvatarStack people={meeting.participants} max={8} />
        </div>
      </div>
    </div>
  );
}
