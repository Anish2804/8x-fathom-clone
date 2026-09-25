"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { IconPause, IconPlay, IconSkipBack, IconSkipFwd } from "@/components/icons";
import { formatClock } from "@/lib/format";

function seededBars(seed: string, count = 72): number[] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const bars: number[] = [];
  for (let i = 0; i < count; i++) {
    h = (h * 1664525 + 1013904223) >>> 0;
    const n = (h % 1000) / 1000;
    bars.push(18 + n * 70);
  }
  return bars;
}

export function MeetingPlayer({
  meetingId,
  durationMin,
  currentMs,
  onSeek,
  playing,
  onToggle,
}: {
  meetingId: string;
  durationMin: number;
  currentMs: number;
  onSeek: (ms: number) => void;
  playing: boolean;
  onToggle: () => void;
}) {
  const durationMs = durationMin * 60 * 1000;
  const bars = useMemo(() => seededBars(meetingId), [meetingId]);
  const trackRef = useRef<HTMLDivElement>(null);
  const progress = Math.min(1, currentMs / durationMs);

  function seekFromEvent(clientX: number) {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    onSeek(ratio * durationMs);
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[linear-gradient(180deg,#2a2420_0%,#1c1916_100%)] p-5 text-[#f3efe8]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="eyebrow !text-[#cbbfb4]">Mocked playback</p>
          <p className="mt-1 text-sm text-[#e7ddd2]">
            No Zoom/Meet bot. Timeline is simulated so transcript, highlights, and search still work.
          </p>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-[#f3efe8]">
          {formatClock(currentMs)} / {formatClock(durationMs)}
        </span>
      </div>

      <div
        ref={trackRef}
        className="relative h-24 cursor-pointer rounded-2xl bg-black/25"
        onClick={(e) => seekFromEvent(e.clientX)}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={durationMs}
        aria-valuenow={currentMs}
        aria-label="Playback position"
      >
        <div className="absolute inset-x-3 bottom-3 top-3 flex items-end gap-[3px]">
          {bars.map((height, i) => {
            const active = i / bars.length <= progress;
            return (
              <span
                key={i}
                className="wave-bar w-full rounded-full"
                style={{
                  height: `${playing ? height : height * 0.72}%`,
                  background: active ? "#c1503a" : "rgba(243,239,232,0.2)",
                }}
              />
            );
          })}
        </div>
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-3 top-3 w-0.5 rounded-full bg-[#f3efe8]"
          style={{
            left: `calc(12px + (100% - 24px) * ${progress})`,
            transform: "translateX(-50%)",
            transition: playing ? "none" : "left 180ms ease-out",
          }}
        />
      </div>

      <div className="mt-4 flex items-center justify-center gap-3">
        <button
          className="rounded-full bg-white/10 p-2 hover:bg-white/16"
          onClick={() => onSeek(Math.max(0, currentMs - 15000))}
          aria-label="Back 15 seconds"
        >
          <IconSkipBack className="h-5 w-5" />
        </button>
        <button
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--mark)] text-[var(--on-mark)] hover:bg-[var(--mark-hover)]"
          onClick={onToggle}
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? <IconPause className="h-6 w-6" /> : <IconPlay className="ml-0.5 h-6 w-6" />}
        </button>
        <button
          className="rounded-full bg-white/10 p-2 hover:bg-white/16"
          onClick={() => onSeek(Math.min(durationMs, currentMs + 15000))}
          aria-label="Forward 15 seconds"
        >
          <IconSkipFwd className="h-5 w-5" />
        </button>
      </div>
      <input
        type="range"
        min={0}
        max={durationMs}
        value={currentMs}
        onChange={(e) => onSeek(Number(e.target.value))}
        className="mt-4 h-1.5 w-full cursor-pointer accent-[#c1503a]"
      />
    </section>
  );
}

export function usePlayback(durationMin: number, initialMs = 0) {
  const durationMs = durationMin * 60 * 1000;
  const [currentMs, setCurrentMs] = useState(Math.min(initialMs, durationMs));
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    let frame: number;
    let last = performance.now();
    const tick = (now: number) => {
      const delta = now - last;
      last = now;
      setCurrentMs((ms) => {
        const next = ms + delta * 1.8;
        if (next >= durationMs) {
          setPlaying(false);
          return durationMs;
        }
        return next;
      });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, durationMs]);

  return {
    currentMs,
    playing,
    setPlaying,
    seek: (ms: number) => setCurrentMs(Math.min(durationMs, Math.max(0, ms))),
    toggle: () => setPlaying((v) => !v),
  };
}
