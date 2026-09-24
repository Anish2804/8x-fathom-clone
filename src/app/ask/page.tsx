"use client";

import Link from "next/link";
import { useState } from "react";
import { askHarbor, suggestedQuestions, type AskAnswer } from "@/lib/ask";

export default function AskPage() {
  const [q, setQ] = useState("");
  const [log, setLog] = useState<{ role: "user" | "harbor"; text: string; citations?: AskAnswer["citations"] }[]>([]);

  function submit(question: string) {
    const trimmed = question.trim();
    if (!trimmed) return;
    const result = askHarbor(trimmed);
    setLog((curr) => [
      ...curr,
      { role: "user", text: trimmed },
      { role: "harbor", text: result.answer, citations: result.citations },
    ]);
    setQ("");
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight">Ask Harbor</h1>
      <p className="mt-2 text-[var(--muted)]">
        Cross-meeting answers from seeded transcripts. No live model — matches are local.
      </p>

      <div className="mt-6 space-y-3">
        {log.length === 0 && (
          <div className="surface rounded-3xl p-5">
            <p className="text-sm text-[var(--ink-soft)]">Try a question the rest of the workspace already knows:</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {suggestedQuestions().map((item) => (
                <button
                  key={item}
                  onClick={() => submit(item)}
                  className="rounded-full border border-[var(--line)] px-3 py-1.5 text-left text-xs text-[var(--ink-soft)] hover:border-[var(--accent)]/40"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}
        {log.map((entry, i) => (
          <article
            key={`${entry.role}-${i}`}
            className={`rounded-3xl p-4 ${
              entry.role === "user" ? "ml-8 border border-[var(--line)] bg-[var(--bg-muted)]" : "surface mr-8"
            }`}
          >
            <p className="text-[11px] uppercase tracking-wider text-[var(--muted)]">
              {entry.role === "user" ? "You" : "Harbor"}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-[var(--ink-soft)]">{entry.text}</p>
            {entry.citations && entry.citations.length > 0 && (
              <ul className="mt-3 space-y-2">
                {entry.citations.map((cite) => (
                  <li key={cite.href + cite.snippet.slice(0, 12)}>
                    <Link
                      href={cite.href}
                      className="block rounded-2xl border border-[var(--line)] px-3 py-2 hover:border-[var(--accent)]/40"
                    >
                      <p className="text-[11px] text-[var(--accent)]">
                        {cite.speaker} · {cite.meetingTitle}
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--muted)]">{cite.snippet}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </div>

      <form
        className="sticky bottom-4 mt-6"
        onSubmit={(e) => {
          e.preventDefault();
          submit(q);
        }}
      >
        <div className="surface flex gap-2 rounded-2xl p-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ask about a person, decision, or risk…"
            className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none"
          />
          <button type="submit" className="rounded-xl bg-[var(--accent)] px-4 text-sm font-medium text-[#0c1613]">
            Ask
          </button>
        </div>
      </form>
    </div>
  );
}
