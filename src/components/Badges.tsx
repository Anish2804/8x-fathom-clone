import { statusLabel, typeLabel } from "@/lib/format";
import type { MeetingStatus, MeetingType } from "@/lib/types";

const statusClass: Record<MeetingStatus, string> = {
  ready: "bg-[var(--accent-soft)] text-[var(--accent)]",
  upcoming: "bg-[var(--bg-muted)] text-[var(--ink-soft)]",
  processing: "bg-[var(--warn-soft)] text-[var(--warn)]",
};

export function StatusBadge({ status }: { status: MeetingStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium tracking-wide ${statusClass[status]}`}>
      {status === "processing" && (
        <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
      )}
      {statusLabel(status)}
    </span>
  );
}

export function TypeBadge({ type }: { type: MeetingType }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[var(--line)] px-2 py-0.5 text-[11px] text-[var(--muted)]">
      {typeLabel(type)}
    </span>
  );
}
