import { Suspense } from "react";
import { notFound } from "next/navigation";
import { MeetingDetail } from "@/components/MeetingDetail";
import { getMeeting, getMeetings } from "@/data/meetings";

export function generateStaticParams() {
  return getMeetings().map((m) => ({ id: m.id }));
}

export default async function MeetingPage({ params }: PageProps<"/meetings/[id]">) {
  const { id } = await params;
  const meeting = getMeeting(id);
  if (!meeting) notFound();
  return (
    <Suspense fallback={<p className="text-[var(--muted)]">Opening meeting…</p>}>
      <MeetingDetail key={meeting.id} meeting={meeting} />
    </Suspense>
  );
}
