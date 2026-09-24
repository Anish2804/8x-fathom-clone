"use client";

import { useMemo, useState } from "react";
import { EmptyState, MeetingCard } from "@/components/MeetingCard";
import { meetings } from "@/data/meetings";
import type { MeetingStatus, MeetingType } from "@/lib/types";

const types: Array<MeetingType | "all"> = [
  "all",
  "internal",
  "customer",
  "interview",
  "standup",
  "planning",
  "retro",
];
const statuses: Array<MeetingStatus | "all"> = ["all", "ready", "upcoming", "processing"];

export default function MeetingsPage() {
  const [q, setQ] = useState("");
  const [type, setType] = useState<(typeof types)[number]>("all");
  const [status, setStatus] = useState<(typeof statuses)[number]>("all");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return meetings
      .filter((m) => (type === "all" ? true : m.type === type))
      .filter((m) => (status === "all" ? true : m.status === status))
      .filter((m) => {
        if (!needle) return true;
        const blob = [
          m.title,
          m.team,
          m.overview,
          ...m.participants.map((p) => `${p.name} ${p.email}`),
        ]
          .join(" ")
          .toLowerCase();
        return blob.includes(needle);
      })
      .sort((a, b) => +new Date(b.startsAt) - +new Date(a.startsAt));
  }, [q, type, status]);

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight">Meetings</h1>
      <p className="mt-2 text-[var(--muted)]">
        {filtered.length} of {meetings.length} meetings
      </p>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search title, people, team…"
          className="flex-1 rounded-2xl border border-[var(--line)] bg-[var(--bg-elev)] px-4 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as typeof type)}
          className="rounded-2xl border border-[var(--line)] bg-[var(--bg-elev)] px-3 py-2.5 text-sm"
        >
          {types.map((t) => (
            <option key={t} value={t}>
              {t === "all" ? "All types" : t[0].toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
          className="rounded-2xl border border-[var(--line)] bg-[var(--bg-elev)] px-3 py-2.5 text-sm"
        >
          {statuses.map((t) => (
            <option key={t} value={t}>
              {t === "all" ? "All statuses" : t[0].toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="No meetings match" body="Try another type, status, or search term." />
        </div>
      ) : (
        <div className="mt-6 grid gap-3 lg:grid-cols-2">
          {filtered.map((m) => (
            <MeetingCard key={m.id} meeting={m} />
          ))}
        </div>
      )}
    </div>
  );
}
