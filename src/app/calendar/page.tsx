"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { getMeetings } from "@/data/meetings";
import { formatMeetingWhen } from "@/lib/format";
import { defaultCalendar, getCalendarSnapshot, saveCalendar, subscribeCalendar, type CalendarConnection } from "@/lib/storage";

export default function CalendarPage() {
  const connection = useSyncExternalStore(subscribeCalendar, getCalendarSnapshot, () => defaultCalendar);
  const [phase, setPhase] = useState<"idle" | "connecting" | "syncing">("idle");
  const [notice, setNotice] = useState<string | null>(null);
  const upcoming = getMeetings().filter((meeting) => meeting.status === "upcoming");

  function connect() {
    setPhase("connecting");
    setNotice(null);
    window.setTimeout(() => {
      const next: CalendarConnection = {
        ...connection,
        connected: true,
        account: "anish@harbor.dev",
        workspace: "Harbor",
        lastSyncAt: new Date().toISOString(),
      };
      saveCalendar(next);
      setPhase("idle");
      setNotice("Google Calendar connected. Upcoming Harbor meetings are on this calendar.");
    }, 700);
  }

  function sync() {
    setPhase("syncing");
    setNotice(null);
    window.setTimeout(() => {
      const next = { ...connection, lastSyncAt: new Date().toISOString() };
      saveCalendar(next);
      setPhase("idle");
      setNotice(`Synced ${upcoming.length} upcoming meeting${upcoming.length === 1 ? "" : "s"}.`);
    }, 700);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight">Calendar</h1>
      <p className="mt-2 text-[var(--muted)]">
        A local demo of Google Calendar. Nothing leaves this browser, and no Google account is contacted.
      </p>

      <section className="mt-6 rounded-2xl border border-[var(--line)] bg-[var(--bg-elev)] p-5">
        <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">Google Calendar</p>
        <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl">
          {connection.connected ? "Connected" : "Not connected"}
        </h2>
        <p className="mt-2 text-sm text-[var(--ink-soft)]">
          {connection.connected
            ? `${connection.account} · ${connection.workspace} workspace`
            : "Connect the Harbor demo workspace to show meetings already on the calendar."}
        </p>
        {connection.lastSyncAt && (
          <p className="mt-2 text-xs text-[var(--muted)]">
            Last sync {new Date(connection.lastSyncAt).toLocaleString()}
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          {!connection.connected ? (
            <button
              type="button"
              disabled={phase === "connecting"}
              onClick={connect}
              className="rounded-full bg-[var(--mark)] px-4 py-2 text-sm font-medium text-[var(--on-mark)] hover:bg-[var(--mark-hover)] disabled:opacity-60"
            >
              {phase === "connecting" ? "Connecting…" : "Connect Google Calendar"}
            </button>
          ) : (
            <button
              type="button"
              disabled={phase === "syncing"}
              onClick={sync}
              className="rounded-full bg-[var(--mark)] px-4 py-2 text-sm font-medium text-[var(--on-mark)] hover:bg-[var(--mark-hover)] disabled:opacity-60"
            >
              {phase === "syncing" ? "Syncing…" : "Sync now"}
            </button>
          )}
        </div>
        {notice && (
          <p className="mt-3 rounded-xl bg-[var(--mark-soft)] px-3 py-2 text-sm text-[var(--mark-ink)]">{notice}</p>
        )}
      </section>

      {connection.connected && (
        <section className="mt-4">
          <h2 className="font-[family-name:var(--font-display)] text-2xl">Upcoming</h2>
          <ul className="mt-3 space-y-3">
            {upcoming.map((meeting) => (
              <li key={meeting.id}>
                <Link
                  href={`/meetings/${meeting.id}`}
                  className="block rounded-2xl border border-[var(--line)] bg-[var(--bg-elev)] p-4 hover:border-[var(--accent)]/40"
                >
                  <p className="text-xs text-[var(--muted)]">{meeting.platform} · {meeting.team}</p>
                  <p className="mt-1 text-lg font-medium">{meeting.title}</p>
                  <p className="text-sm text-[var(--ink-soft)]">{formatMeetingWhen(meeting.startsAt)}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
