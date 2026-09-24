import Link from "next/link";
import { MeetingCard } from "@/components/MeetingCard";
import { getMeetings, stats } from "@/data/meetings";
import { IconSearch } from "@/components/icons";

export default function HomePage() {
  const meetings = getMeetings();
  const upcoming = meetings.filter((m) => m.status === "upcoming");
  const recent = meetings.filter((m) => m.status !== "upcoming").slice(0, 6);
  const s = stats();

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-[var(--muted)]">Welcome back, Anish</p>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-4xl tracking-tight">
            Your meetings, already noted.
          </h1>
        </div>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--bg-elev)] px-4 py-2 text-sm text-[var(--muted)] shadow-[var(--shadow)]"
        >
          <IconSearch className="h-4 w-4" />
          Search meetings, people, transcripts
        </Link>
      </div>

      <section className="mb-8 grid gap-3 sm:grid-cols-4">
        <Stat label="Recorded" value={String(s.recorded)} />
        <Stat label="Upcoming" value={String(s.upcoming)} />
        <Stat label="Open actions" value={String(s.openActions)} />
        <Stat label="Hours captured" value={String(s.hours)} />
      </section>

      <section className="mb-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-display)] text-2xl">Upcoming</h2>
          <Link href="/meetings" className="text-sm text-[var(--accent)] hover:underline">
            All meetings
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {upcoming.map((m) => (
            <MeetingCard key={m.id} meeting={m} compact />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-[family-name:var(--font-display)] text-2xl">Recent</h2>
        <div className="grid gap-3 lg:grid-cols-2">
          {recent.map((m) => (
            <MeetingCard key={m.id} meeting={m} />
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg-elev)] p-4 shadow-[var(--shadow)]">
      <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">{label}</p>
      <p className="mt-2 font-[family-name:var(--font-display)] text-3xl">{value}</p>
    </div>
  );
}
