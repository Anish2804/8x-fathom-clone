"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { EmptyState } from "@/components/MeetingCard";
import { meetings } from "@/data/meetings";
import { searchMeetings } from "@/lib/search";

export default function SearchPage() {
  return (
    <Suspense fallback={<p className="text-[var(--muted)]">Loading search…</p>}>
      <SearchInner />
    </Suspense>
  );
}

function SearchInner() {
  const params = useSearchParams();
  const router = useRouter();
  const initial = params.get("q") ?? "";
  const [q, setQ] = useState(initial);
  const hits = useMemo(() => searchMeetings(meetings, q), [q]);

  const labels = {
    meeting: "Meeting",
    transcript: "Transcript",
    summary: "Summary",
    participant: "Person",
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight">Search</h1>
      <p className="mt-2 text-[var(--muted)]">Meetings, people, summaries, and transcript lines.</p>
      <form
        className="mt-6"
        onSubmit={(e) => {
          e.preventDefault();
          router.replace(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
        }}
      >
        <input
          autoFocus
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            router.replace(e.target.value ? `/search?q=${encodeURIComponent(e.target.value)}` : "/search");
          }}
          placeholder="Try “activation”, “Harper”, “Salesforce”…"
          className="w-full rounded-2xl border border-[var(--line)] bg-[var(--bg-elev)] px-4 py-3 text-base outline-none focus:border-[var(--accent)]"
        />
      </form>

      {q.trim().length < 2 ? (
        <div className="mt-8">
          <EmptyState title="Type at least two characters" body="Search runs locally across the seeded workspace." />
        </div>
      ) : hits.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="No matches" body="Try a participant name, a decision, or a phrase from a transcript." />
        </div>
      ) : (
        <ul className="mt-6 space-y-2">
          {hits.map((hit) => (
            <li key={hit.id}>
              <Link
                href={hit.href}
                className="block rounded-2xl border border-[var(--line)] bg-[var(--bg-elev)] p-4 hover:border-[var(--accent)]/40"
              >
                <p className="text-[11px] uppercase tracking-wider text-[var(--accent)]">
                  {labels[hit.kind]} · {hit.meetingTitle}
                </p>
                <p className="mt-1 font-medium">{hit.title}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">{hit.snippet}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
