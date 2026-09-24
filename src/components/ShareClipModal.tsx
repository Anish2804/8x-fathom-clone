"use client";

import { useMemo, useState } from "react";
import { IconCheck, IconCopy } from "@/components/icons";
import { formatClock } from "@/lib/format";
import type { Meeting } from "@/lib/types";

export function ShareClipModal({
  meeting,
  currentMs,
  onClose,
}: {
  meeting: Meeting;
  currentMs: number;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);
  const link = useMemo(() => {
    const origin = typeof window === "undefined" ? "https://harbor.notes" : window.location.origin;
    return `${origin}/meetings/${meeting.id}?t=${Math.round(currentMs)}&share=clip`;
  }, [meeting.id, currentMs]);

  async function copyLink() {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center" onClick={onClose}>
      <div
        role="dialog"
        aria-labelledby="share-clip-title"
        className="surface w-full max-w-md rounded-3xl p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">Share a clip</p>
        <h2 id="share-clip-title" className="mt-1 font-[family-name:var(--font-display)] text-2xl">
          Send {meeting.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]">
          Anyone with this link can open the notes and jump to {formatClock(currentMs)} — even if they were not on
          the call. No real email is sent in this demo.
        </p>
        <label className="mt-4 block text-xs text-[var(--muted)]">Clip link</label>
        <div className="mt-1 flex gap-2">
          <input
            readOnly
            value={link}
            className="min-w-0 flex-1 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-xs text-[var(--ink-soft)]"
          />
          <button
            onClick={copyLink}
            className="inline-flex items-center gap-1 rounded-xl bg-[var(--mark)] px-3 text-xs font-medium text-[var(--on-mark)] hover:bg-[var(--mark-hover)]"
          >
            {copied ? <IconCheck className="h-3.5 w-3.5" /> : <IconCopy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
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
            className="mt-3 w-full rounded-xl bg-[var(--mark)] py-2.5 text-sm font-medium text-[var(--on-mark)] hover:bg-[var(--mark-hover)]"
          >
            Send invite
          </button>
        </form>
        {sent && (
          <p className="mt-3 rounded-xl bg-[var(--mark-soft)] px-3 py-2 text-sm text-[var(--mark-ink)]">
            Invite queued for {email}. No message left this browser.
          </p>
        )}
        <button onClick={onClose} className="mt-4 w-full text-sm text-[var(--muted)] hover:text-[var(--ink)]">
          Close
        </button>
      </div>
    </div>
  );
}
