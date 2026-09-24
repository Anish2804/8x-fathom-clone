import Link from "next/link";
import { workspaceTrends } from "@/lib/trends";
import { Avatar } from "@/components/Avatar";

export default function TrendsPage() {
  const data = workspaceTrends();
  const maxOpen = Math.max(...data.owners.map((o) => o.open), 1);

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight">Workspace trends</h1>
      <p className="mt-2 max-w-2xl text-[var(--muted)]">
        Patterns across {data.meetingCount} recorded meetings — recurring blockers, who is carrying open work, and
        decisions in time. Fathom-style products stop at the individual call; this page is the operating view.
      </p>

      <section className="mt-8">
        <h2 className="font-[family-name:var(--font-display)] text-2xl">Recurring themes</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">Topics that show up in two or more meetings, not just one recap.</p>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {data.themes.map((theme) => (
            <article key={theme.id} className="surface rounded-3xl p-5">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-medium">{theme.label}</h3>
                <span className="text-sm text-[var(--accent)]">{theme.count} meetings</span>
              </div>
              <ul className="mt-3 space-y-1">
                {theme.meetings.map((m) => (
                  <li key={m.id}>
                    <Link href={`/meetings/${m.id}`} className="text-sm text-[var(--ink-soft)] hover:text-[var(--accent)]">
                      {m.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-[family-name:var(--font-display)] text-2xl">Open-action load</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Who is named on the most unfinished items across the workspace — the follow-through gap a per-meeting recap hides.
        </p>
        <ul className="mt-4 space-y-3">
          {data.owners.map((row) => (
            <li key={row.person.id} className="surface rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <Avatar person={row.person} size={32} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{row.person.name}</p>
                  <p className="text-xs text-[var(--muted)]">{row.person.role} · {row.open} open</p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--bg-muted)]">
                    <div
                      className="h-full rounded-full bg-[var(--accent)]"
                      style={{ width: `${(row.open / maxOpen) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
              <ul className="mt-3 space-y-1 text-xs text-[var(--ink-soft)]">
                {row.items.slice(0, 3).map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-[family-name:var(--font-display)] text-2xl">Decision timeline</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">Calls, not chats — every recorded decision in reverse time.</p>
        <ol className="mt-4 space-y-3">
          {data.decisions.map((beat) => (
            <li key={beat.id} className="surface rounded-2xl p-4">
              <p className="text-[11px] text-[var(--muted)]">{beat.when}</p>
              <p className="mt-1 text-sm text-[var(--ink-soft)]">{beat.text}</p>
              <Link href={`/meetings/${beat.meetingId}`} className="mt-2 inline-block text-xs text-[var(--accent)]">
                {beat.meetingTitle}
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
