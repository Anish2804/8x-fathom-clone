import type { Meeting } from "@/lib/types";

export const SUMMARY_TEMPLATES = [
  { id: "general", label: "General" },
  { id: "sales", label: "Sales call" },
  { id: "standup", label: "Standup" },
  { id: "cs", label: "Customer success" },
] as const;

export type SummaryTemplateId = (typeof SUMMARY_TEMPLATES)[number]["id"];

export type TemplatedSummary = {
  overview: string;
  sections: { title: string; items: string[] }[];
};

export function applySummaryTemplate(meeting: Meeting, template: SummaryTemplateId): TemplatedSummary {
  if (template === "sales") {
    return {
      overview: `Commercial read of “${meeting.title}”. ${meeting.overview}`,
      sections: [
        { title: "Buyer signals", items: meeting.takeaways.slice(0, 3) },
        {
          title: "Commitments on the table",
          items: meeting.decisions.length ? meeting.decisions : ["No hard commits were locked in this recording."],
        },
        {
          title: "Next commercial move",
          items: meeting.followUps.length ? meeting.followUps : meeting.actionItems.map((a) => a.text),
        },
      ],
    };
  }

  if (template === "standup") {
    return {
      overview: `Working notes from “${meeting.title}” (${meeting.durationMin} min). Focus is owners, blockers, and what ships next.`,
      sections: [
        {
          title: "Shipped / decided",
          items: meeting.decisions.length ? meeting.decisions : meeting.takeaways.slice(0, 2),
        },
        {
          title: "Blockers",
          items: (() => {
            const blockers = meeting.takeaways.filter((t) =>
              /block|risk|stall|defer|cut|incident|latency/i.test(t),
            );
            return blockers.length ? blockers.slice(0, 4) : ["No explicit blockers named."];
          })(),
        },
        {
          title: "Owners this week",
          items: meeting.actionItems.map((item) => {
            const who = meeting.participants.find((p) => p.id === item.assigneeId)?.name ?? "Unassigned";
            return `${who}: ${item.text}`;
          }),
        },
      ],
    };
  }

  if (template === "cs") {
    return {
      overview: `Account health recap for “${meeting.title}”. ${meeting.overview}`,
      sections: [
        { title: "Health & adoption", items: meeting.takeaways },
        {
          title: "Risks to flag internally",
          items: meeting.decisions.length ? meeting.decisions : ["No new risks recorded."],
        },
        {
          title: "Customer-facing follow-ups",
          items: meeting.followUps.length ? meeting.followUps : meeting.actionItems.map((a) => a.text),
        },
      ],
    };
  }

  return {
    overview: meeting.overview,
    sections: [
      { title: "Key takeaways", items: meeting.takeaways },
      { title: "Decisions", items: meeting.decisions },
      { title: "Follow-ups", items: meeting.followUps },
    ],
  };
}
