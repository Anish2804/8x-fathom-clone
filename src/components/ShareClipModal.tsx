"use client";

import { useMemo, useState } from "react";
import { IconCheck, IconCopy } from "@/components/icons";
import { formatClock } from "@/lib/format";
import type { Meeting } from "@/lib/types";

export function ShareClipModal({
  meeting,
  initialStartMs,
  initialEndMs,
  onPreview,
  onClose,
}: {
  meeting: Meeting;
  initialStartMs: number;
  initialEndMs: number;
  onPreview: (ms: number) => void;
  onClose: () => void;
}) {
  const durationMs = meeting.durationMin * 60 * 1000;
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);
  const [closing, setClosing] = useState(false);
  const [startMs, setStartMs] = useState(() => clamp(initialStartMs, 0, durationMs));
  const [endMs, setEndMs] = useState(() => clamp(Math.max(initialEndMs, initialStartMs + 1000), 0, durationMs));

  function requestClose() {
    if (closing) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      onClose();
      return;
    }
    setClosing(true);
    window.setTimeout(onClose, 180);
  }

  const excerpt = useMemo(() => clipExcerpt(meeting, startMs, endMs), [meeting, startMs, endMs]);
  const link = useMemo(() => {
    const origin = typeof window === "undefined" ? "https://harbor.notes" : window.location.origin;
    return `${origin}/meetings/${meeting.id}?t=${Math.round(startMs)}&end=${Math.round(endMs)}&share=clip`;
  }, [meeting.id, startMs, endMs]);

  async function copyLink() {
    let copiedOk = false;
    try {
      await navigator.clipboard.writeText(link);
      copiedOk = true;
    } catch {
      copiedOk = copyPlainText(link);
    }
    if (!copiedOk) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div
      className={`modal-backdrop fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center ${closing ? "is-closing" : ""}`}
      onClick={requestClose}
    >
      <div
        role="dialog"
        aria-labelledby="share-clip-title"
        className={`modal-panel surface w-full max-w-md rounded-3xl p-5 ${closing ? "is-closing" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">Share a clip</p>
        <h2 id="share-clip-title" className="mt-1 font-[family-name:var(--font-display)] text-2xl">
          {meeting.title}
        </h2>
        <p className="mt-2 font-mono text-xs text-[var(--accent)]">
          {formatClock(startMs)} – {formatClock(endMs)}
        </p>
        <p className="mt-3 rounded-2xl bg-[var(--bg-muted)] px-3 py-2 text-sm leading-relaxed text-[var(--ink-soft)]">
          {excerpt}
        </p>

        <label className="mt-4 block text-xs text-[var(--muted)]">Clip start · {formatClock(startMs)}</label>
        <input
          type="range"
          min={0}
          max={durationMs}
          step={1000}
          value={startMs}
          onChange={(e) => {
            const next = Number(e.target.value);
            setStartMs(next);
            if (next >= endMs) setEndMs(Math.min(durationMs, next + 1000));
          }}
          className="mt-1 w-full accent-[var(--accent)]"
        />
        <label className="mt-3 block text-xs text-[var(--muted)]">Clip end · {formatClock(endMs)}</label>
        <input
          type="range"
          min={0}
          max={durationMs}
          step={1000}
          value={endMs}
          onChange={(e) => {
            const next = Number(e.target.value);
            setEndMs(next);
            if (next <= startMs) setStartMs(Math.max(0, next - 1000));
          }}
          className="mt-1 w-full accent-[var(--accent)]"
        />

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={copyLink}
            className="inline-flex flex-1 items-center justify-center gap-1 rounded-full bg-[var(--mark)] px-3 py-2 text-sm font-medium text-[var(--on-mark)] hover:bg-[var(--mark-hover)]"
          >
            {copied ? <IconCheck className="h-3.5 w-3.5" /> : <IconCopy className="h-3.5 w-3.5" />}
            {copied ? "Link copied" : "Copy link"}
          </button>
          <button
            type="button"
            onClick={() => onPreview(startMs)}
            className="rounded-full border border-[var(--accent)]/40 px-3 py-2 text-sm text-[var(--accent)] hover:bg-[var(--accent-soft)]"
          >
            Preview clip
          </button>
        </div>

        <form
          className="mt-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!email.trim()) return;
            setSent(true);
          }}
        >
          <label className="block text-xs text-[var(--muted)]">Email someone who missed it</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setSent(false);
            }}
            placeholder="alex@acme.co"
            className="mt-1 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
          />
          <button
            type="submit"
            className="mt-3 w-full rounded-full border border-[var(--line)] py-2.5 text-sm text-[var(--ink-soft)] hover:bg-[var(--bg-muted)]"
          >
            Send invite
          </button>
        </form>
        {sent && (
          <p className="mt-3 rounded-xl bg-[var(--mark-soft)] px-3 py-2 text-sm text-[var(--mark-ink)]">
            Invite queued for {email}. No message left this browser.
          </p>
        )}
        <button onClick={requestClose} className="mt-4 w-full text-sm text-[var(--muted)] hover:text-[var(--ink)]">
          Close
        </button>
      </div>
    </div>
  );
}

function copyPlainText(text: string) {
  let ok = false;
  const onCopy = (event: ClipboardEvent) => {
    event.clipboardData?.setData("text/plain", text);
    event.preventDefault();
    ok = true;
  };
  document.addEventListener("copy", onCopy);
  document.execCommand("copy");
  document.removeEventListener("copy", onCopy);
  return ok;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function clipExcerpt(meeting: Meeting, startMs: number, endMs: number) {
  const lines = meeting.transcript.filter((line) => line.endMs > startMs && line.startMs < endMs);
  const picked = lines.length
    ? lines
    : meeting.transcript.filter((line) => Math.abs(line.startMs - startMs) < 20000).slice(0, 2);
  const text = picked.map((line) => line.text).join(" ");
  if (!text) return meeting.overview;
  return text.length > 280 ? `${text.slice(0, 277)}…` : text;
}
