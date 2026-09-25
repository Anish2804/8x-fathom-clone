"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { IconCheck, IconCopy, IconMark, IconShare } from "@/components/icons";
import { formatClock } from "@/lib/format";
import { saveUserHighlight } from "@/lib/storage";
import type { Highlight, Meeting, TranscriptLine } from "@/lib/types";

export function TranscriptPane({
  meeting,
  currentMs,
  activeLineId,
  query,
  onQuery,
  playing,
  seekN,
  onSeek,
  onHighlight,
  onShare,
}: {
  meeting: Meeting;
  currentMs: number;
  activeLineId?: string | null;
  query: string;
  onQuery: (q: string) => void;
  playing?: boolean;
  seekN?: number;
  onSeek: (ms: number, lineId: string) => void;
  onHighlight: (h: Highlight) => void;
  onShare: (line: TranscriptLine) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [pulse, setPulse] = useState<{ id: string; n: number } | null>(() =>
    activeLineId ? { id: activeLineId, n: 1 } : null,
  );
  const listRef = useRef<HTMLDivElement>(null);

  function scrollLine(id: string) {
    const scroller = listRef.current;
    const el = document.getElementById(id);
    if (!scroller || !el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const elRect = el.getBoundingClientRect();
    const scrollerRect = scroller.getBoundingClientRect();
    const top = scroller.scrollTop + (elRect.top - scrollerRect.top) - scroller.clientHeight / 2 + el.clientHeight / 2;
    scroller.scrollTo({ top: Math.max(0, top), behavior: reduce ? "auto" : "smooth" });
  }

  function jumpTo(ms: number, id: string) {
    onSeek(ms, id);
    setPulse((prev) => ({ id, n: (prev?.n ?? 0) + 1 }));
    if (id === activeLineId) scrollLine(id);
  }

  const liveId = useMemo(() => {
    const line = meeting.transcript.find((item) => currentMs >= item.startMs && currentMs < item.endMs);
    return line?.id ?? null;
  }, [meeting.transcript, currentMs]);

  useEffect(() => {
    if (activeLineId) scrollLine(activeLineId);
  }, [activeLineId, seekN]);

  useEffect(() => {
    if (playing && liveId) scrollLine(liveId);
  }, [playing, liveId]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return meeting.transcript;
    return meeting.transcript.filter((line) => line.text.toLowerCase().includes(q));
  }, [meeting.transcript, query]);

  async function copyAll() {
    const text = meeting.transcript
      .map((line) => {
        const who = meeting.participants.find((p) => p.id === line.speakerId)?.name ?? "Speaker";
        return `[${formatClock(line.startMs)}] ${who}: ${line.text}`;
      })
      .join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  function highlightLine(line: TranscriptLine) {
    const person = meeting.participants.find((p) => p.id === line.speakerId);
    const created: Highlight = {
      id: `user-${Date.now()}`,
      startMs: line.startMs,
      title: line.text.slice(0, 48) + (line.text.length > 48 ? "…" : ""),
      description: `${person?.name ?? "Speaker"} · captured from transcript`,
      lineId: line.id,
    };
    saveUserHighlight(meeting.id, created);
    onHighlight(created);
  }

  return (
    <section className="flex min-h-[32rem] flex-col rounded-3xl border border-[var(--line)] bg-[var(--bg-elev)]">
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--line)] px-4 py-3">
        <h2 className="mr-auto font-[family-name:var(--font-display)] text-lg">Transcript</h2>
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search this transcript"
          className="w-full rounded-full border border-[var(--line)] bg-[var(--bg)] px-3 py-1.5 text-sm outline-none focus:border-[var(--accent)] sm:w-56"
        />
        <button
          onClick={copyAll}
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--accent)]/40 px-3 py-1.5 text-xs text-[var(--accent)] hover:bg-[var(--accent-soft)]"
        >
          {copied ? <IconCheck className="h-3.5 w-3.5" /> : <IconCopy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div ref={listRef} className="flex-1 space-y-1 overflow-y-auto p-2">
        {filtered.length === 0 && (
          <p className="px-3 py-10 text-center text-sm text-[var(--muted)]">No lines match that search.</p>
        )}
        {filtered.map((line) => {
          const speaker = meeting.participants.find((p) => p.id === line.speakerId);
          const live = currentMs >= line.startMs && currentMs < line.endMs;
          const pulsing = pulse?.id === line.id;
          return (
            <article
              id={line.id}
              key={pulsing ? `${line.id}-${pulse.n}` : line.id}
              role="button"
              tabIndex={0}
              onClick={() => jumpTo(line.startMs, line.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  jumpTo(line.startMs, line.id);
                }
              }}
              className={`group cursor-pointer rounded-2xl px-3 py-2.5 text-left transition-colors duration-200 ease-out ${
                live ? "bg-[var(--accent-soft)]" : "hover:bg-[var(--bg-muted)]"
              } ${pulsing ? "line-pulse" : ""}`}
            >
              <div className="mb-1 flex items-center gap-2">
                {speaker && <Avatar person={speaker} size={22} />}
                <span className="text-sm font-medium">{speaker?.name}</span>
                <button
                  className="font-mono text-[11px] text-[var(--accent)] hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    jumpTo(line.startMs, line.id);
                  }}
                >
                  {formatClock(line.startMs)}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare(line);
                  }}
                  className="ml-auto hidden items-center gap-1 text-[11px] text-[var(--muted)] group-hover:flex hover:text-[var(--accent)]"
                >
                  <IconShare className="h-3.5 w-3.5" />
                  Share clip
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    highlightLine(line);
                  }}
                  className="hidden items-center gap-1 text-[11px] text-[var(--muted)] group-hover:flex hover:text-[var(--accent)]"
                >
                  <IconMark className="h-3.5 w-3.5" />
                  Highlight
                </button>
              </div>
              <p className="text-sm leading-relaxed text-[var(--ink-soft)]">
                <HighlightQuery text={line.text} query={query} />
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function HighlightQuery({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q) return <>{text}</>;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
                    <mark className="rounded bg-[var(--accent-soft)] px-0.5 text-[var(--accent)]">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}
