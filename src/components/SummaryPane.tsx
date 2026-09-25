"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { Avatar } from "@/components/Avatar";
import { IconCheck, IconCopy, IconShare } from "@/components/icons";
import { formatClock } from "@/lib/format";
import { getTemplateMap, saveActionStatus, saveMeetingTemplate, subscribeTemplates } from "@/lib/storage";
import { applySummaryTemplate, isSummaryTemplate, SUMMARY_TEMPLATES, type SummaryTemplateId } from "@/lib/templates";
import type { ActionItem, Highlight, Meeting } from "@/lib/types";

const emptyTemplates: Record<string, SummaryTemplateId> = {};

export function SummaryPane({
  meeting,
  actionItems,
  highlights,
  onToggleAction,
  onJump,
  onShare,
  currentMs,
  initialTemplate,
}: {
  meeting: Meeting;
  actionItems: ActionItem[];
  highlights: Highlight[];
  onToggleAction: (id: string, next: ActionItem["status"]) => void;
  onJump: (ms: number, lineId?: string) => void;
  onShare: (startMs: number, endMs: number) => void;
  currentMs: number;
  initialTemplate?: string | null;
}) {
  const [copied, setCopied] = useState(false);
  const stored = useSyncExternalStore(subscribeTemplates, getTemplateMap, () => emptyTemplates);
  const fromUrl = isSummaryTemplate(initialTemplate) ? initialTemplate : null;
  const template: SummaryTemplateId = stored[meeting.id] ?? fromUrl ?? "general";
  const templated = useMemo(
    () => (template === "general" ? null : applySummaryTemplate(meeting, template)),
    [meeting, template],
  );
  const templateLabel = SUMMARY_TEMPLATES.find((item) => item.id === template)?.label ?? "General";

  function chooseTemplate(next: SummaryTemplateId) {
    saveMeetingTemplate(meeting.id, next);
  }

  async function copySummary() {
    const text = [
      meeting.title,
      `Template: ${templateLabel}`,
      "",
      "Overview",
      meeting.overview,
      "",
      "Key takeaways",
      ...meeting.takeaways.map((t) => `• ${t}`),
      "",
      "Decisions",
      ...meeting.decisions.map((t) => `• ${t}`),
      "",
      "Follow-ups",
      ...meeting.followUps.map((t) => `• ${t}`),
      ...(templated
        ? ["", templateLabel, templated.overview, "", ...templated.sections.flatMap((section) => [section.title, ...section.items.map((t) => `• ${t}`), ""])]
        : []),
    ].join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <aside id="summary" className="space-y-4">
      <section className="rounded-3xl border border-[var(--line)] bg-[var(--bg-elev)] p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <h2 className="mr-auto font-[family-name:var(--font-display)] text-lg">AI summary</h2>
          <button
            onClick={copySummary}
            className="inline-flex items-center gap-1 rounded-full border border-[var(--accent)]/40 px-2.5 py-1 text-[11px] text-[var(--accent)] hover:bg-[var(--accent-soft)]"
          >
            {copied ? <IconCheck className="h-3.5 w-3.5" /> : <IconCopy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            onClick={() => onShare(currentMs, Math.min(meeting.durationMin * 60 * 1000, currentMs + 20000))}
            className="inline-flex items-center gap-1 rounded-full bg-[var(--mark)] px-2.5 py-1 text-[11px] font-medium text-[var(--on-mark)] hover:bg-[var(--mark-hover)]"
          >
            <IconShare className="h-3.5 w-3.5" />
            Share
          </button>
        </div>
        <div className="mb-4 flex flex-wrap gap-1.5">
          {SUMMARY_TEMPLATES.map((item) => (
            <button
              key={item.id}
              onClick={() => chooseTemplate(item.id)}
              className={`rounded-full px-2.5 py-1 text-[11px] transition-colors duration-200 ease-out ${
                template === item.id
                  ? "bg-[var(--mark)] font-medium text-[var(--on-mark)]"
                  : "border border-[var(--line)] text-[var(--muted)] hover:bg-[var(--bg-muted)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="mt-1">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Overview</h3>
          <p className="text-sm leading-relaxed text-[var(--ink-soft)]">{meeting.overview}</p>
        </div>
        <Block title="Key takeaways" items={meeting.takeaways} />
        <Block title="Decisions" items={meeting.decisions} />
        <Block title="Follow-ups" items={meeting.followUps} />
        {templated && (
          <div className="mt-5 rounded-2xl border border-[var(--line)] bg-[var(--bg-muted)] p-4">
            <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--accent)]">{templateLabel}</p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]">{templated.overview}</p>
            {templated.sections.map((section) => (
              <Block key={section.title} title={section.title} items={section.items} />
            ))}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-[var(--line)] bg-[var(--bg-elev)] p-5">
        <div className="mb-3">
          <h2 className="font-[family-name:var(--font-display)] text-lg">Key topics</h2>
          <p className="mt-1 text-[11px] text-[var(--muted)]">Topic prominence in this transcript</p>
        </div>
        <div className="space-y-3">
          {meeting.topics.map((topic) => (
            <div key={topic.name}>
              <div className="mb-1 flex justify-between text-xs">
                <span>{topic.name}</span>
                <span className="text-[var(--muted)]">{topic.weight}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[var(--bg-muted)]">
                <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${topic.weight}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-[var(--line)] bg-[var(--bg-elev)] p-5">
        <h2 className="mb-3 font-[family-name:var(--font-display)] text-lg">Action items</h2>
        <ul className="space-y-2">
          {actionItems.map((item) => {
            const who = meeting.participants.find((p) => p.id === item.assigneeId);
            const done = item.status === "done";
            return (
              <li key={item.id} className="flex gap-3 rounded-2xl border border-[var(--line)] p-3">
                <button
                  onClick={() => {
                    const next = done ? "open" : "done";
                    saveActionStatus(meeting.id, item.id, next);
                    onToggleAction(item.id, next);
                  }}
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                    done ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--on-accent)]" : "border-[var(--line)]"
                  }`}
                  aria-label={done ? "Mark open" : "Mark done"}
                >
                  {done && <IconCheck className="h-3 w-3" />}
                </button>
                <div className="min-w-0">
                  <p className={`text-sm ${done ? "text-[var(--muted)] line-through" : ""}`}>{item.text}</p>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-[var(--muted)]">
                    {who && <Avatar person={who} size={18} />}
                    <span>{who?.name}</span>
                    {item.due && <span>· {item.due}</span>}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="rounded-3xl border border-[var(--line)] bg-[var(--bg-elev)] p-5">
        <h2 className="mb-3 font-[family-name:var(--font-display)] text-lg">Highlights</h2>
        {highlights.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">Mark a transcript line to save a moment.</p>
        ) : (
          <ul className="space-y-2">
            {highlights.map((h) => (
              <li key={h.id}>
                <div className="rounded-2xl border border-[var(--line)] p-3">
                  <button onClick={() => onJump(h.startMs, h.lineId)} className="w-full text-left">
                    <p className="font-mono text-[11px] text-[var(--accent)]">{formatClock(h.startMs)}</p>
                    <p className="mt-1 text-sm font-medium">{h.title}</p>
                    <p className="text-xs text-[var(--muted)]">{h.description}</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => onShare(h.startMs, h.startMs + 20000)}
                    className="mt-2 text-[11px] text-[var(--accent)] hover:underline"
                  >
                    Share clip
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </aside>
  );
}

function Block({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="mt-5">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">{title}</h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm leading-relaxed text-[var(--ink-soft)]">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
