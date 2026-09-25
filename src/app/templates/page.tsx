"use client";

import { useRouter } from "next/navigation";
import { getMeeting } from "@/data/meetings";
import { saveMeetingTemplate } from "@/lib/storage";
import { TEMPLATE_CATALOG } from "@/lib/templates";

export default function TemplatesPage() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight">Templates</h1>
      <p className="mt-2 text-[var(--muted)]">
        Apply a structured read to a recorded meeting. The choice stays in this browser and shows up next to the AI
        summary.
      </p>
      <ul className="mt-6 space-y-4">
        {TEMPLATE_CATALOG.map((template) => {
          const meeting = getMeeting(template.meetingId);
          return (
            <li key={template.id} className="rounded-2xl border border-[var(--line)] bg-[var(--bg-elev)] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-[family-name:var(--font-display)] text-2xl">{template.label}</h2>
                  <p className="mt-1 max-w-xl text-sm leading-relaxed text-[var(--ink-soft)]">{template.description}</p>
                </div>
                <button
                  type="button"
                  className="rounded-full bg-[var(--mark)] px-4 py-2 text-sm font-medium text-[var(--on-mark)] hover:bg-[var(--mark-hover)]"
                  onClick={() => {
                    saveMeetingTemplate(template.meetingId, template.id);
                    router.push(`/meetings/${template.meetingId}?template=${template.id}`);
                  }}
                >
                  Use template
                </button>
              </div>
              <ul className="mt-4 flex flex-wrap gap-2">
                {template.sections.map((section) => (
                  <li
                    key={section}
                    className="rounded-full bg-[var(--bg-muted)] px-2.5 py-1 text-[11px] text-[var(--ink-soft)]"
                  >
                    {section}
                  </li>
                ))}
              </ul>
              {meeting && (
                <p className="mt-3 text-xs text-[var(--muted)]">Applies to {meeting.title}</p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
