import { initials } from "@/lib/format";
import type { Participant } from "@/lib/types";

export function Avatar({
  person,
  size = 28,
}: {
  person: Participant;
  size?: number;
}) {
  return (
    <span
      title={`${person.name} · ${person.role}`}
      className="inline-flex shrink-0 items-center justify-center rounded-full font-medium text-white ring-2 ring-[var(--bg-elev)]"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.34,
        background: `hsl(${person.hue} 42% 38%)`,
      }}
    >
      {initials(person.name)}
    </span>
  );
}

export function AvatarStack({
  people,
  max = 4,
}: {
  people: Participant[];
  max?: number;
}) {
  const shown = people.slice(0, max);
  const extra = people.length - shown.length;
  return (
    <div className="flex items-center">
      {shown.map((person, i) => (
        <span key={person.id} className="relative" style={{ marginLeft: i === 0 ? 0 : -8, zIndex: 10 - i }}>
          <Avatar person={person} size={26} />
        </span>
      ))}
      {extra > 0 && (
        <span
          className="relative ml-[-8px] inline-flex h-[26px] min-w-[26px] items-center justify-center rounded-full bg-[var(--bg-muted)] px-1 text-[10px] font-medium text-[var(--ink-soft)] ring-2 ring-[var(--bg-elev)]"
        >
          +{extra}
        </span>
      )}
    </div>
  );
}
