import type { Meeting } from "@/lib/types";

export const SUMMARY_TEMPLATES = [
  { id: "general", label: "General" },
  { id: "sales", label: "Sales Call" },
  { id: "one-on-one", label: "1:1" },
  { id: "recruiting", label: "Recruiting" },
  { id: "product-planning", label: "Product Planning" },
  { id: "standup", label: "Standup" },
  { id: "cs", label: "Customer success" },
] as const;

export type SummaryTemplateId = (typeof SUMMARY_TEMPLATES)[number]["id"];

export type TemplatedSummary = {
  overview: string;
  sections: { title: string; items: string[] }[];
};

export function isSummaryTemplate(value: string | null | undefined): value is SummaryTemplateId {
  return SUMMARY_TEMPLATES.some((item) => item.id === value);
}

export const TEMPLATE_CATALOG: {
  id: Exclude<SummaryTemplateId, "general" | "standup" | "cs">;
  label: string;
  description: string;
  sections: string[];
  meetingId: string;
}[] = [
  {
    id: "sales",
    label: "Sales Call",
    description: "Read a customer conversation for pain, objections, buying signals, and the next commercial move.",
    sections: ["Summary", "Pain points", "Objections", "Buying signals", "Next steps"],
    meetingId: "acme-enterprise-demo",
  },
  {
    id: "one-on-one",
    label: "1:1",
    description: "Capture a working conversation as wins, challenges, feedback, and owned action items.",
    sections: ["Summary", "Wins", "Challenges", "Feedback", "Action items"],
    meetingId: "board-prep-finance",
  },
  {
    id: "recruiting",
    label: "Recruiting",
    description: "Turn an interview into candidate signals, strengths, concerns, notes, and a hiring next step.",
    sections: ["Candidate signals", "Strengths", "Concerns", "Interview notes", "Next steps"],
    meetingId: "staff-eng-interview",
  },
  {
    id: "product-planning",
    label: "Product Planning",
    description: "Separate product decisions, priorities, risks, open questions, and the owners who leave with work.",
    sections: ["Product decisions", "Priorities", "Risks", "Open questions", "Next steps"],
    meetingId: "q3-product-planning",
  },
];

function names(meeting: Meeting, limit = 3) {
  return meeting.participants
    .slice(0, limit)
    .map((p) => p.name)
    .join(", ");
}

function owned(meeting: Meeting) {
  return meeting.actionItems.map((item) => {
    const who = meeting.participants.find((p) => p.id === item.assigneeId)?.name ?? "Unassigned";
    return item.due ? `${who}: ${item.text} (${item.due})` : `${who}: ${item.text}`;
  });
}

export function applySummaryTemplate(meeting: Meeting, template: SummaryTemplateId): TemplatedSummary {
  if (template === "sales") {
    if (meeting.id === "acme-enterprise-demo") {
      return {
        overview:
          "Harper Quinn is evaluating Harbor for a sales org that already lives in Salesforce. The pain is post-call CRM hygiene, not recording. A 40-seat pilot is the live deal, with SSO and legal still in the way.",
        sections: [
          { title: "Summary", items: [meeting.overview] },
          {
            title: "Pain points",
            items: [
              "Sellers will not type notes after calls, so Salesforce stays stale.",
              "Security review and SSO are gates before a company-wide rollout.",
              "Harper's team already ignores recordings; they need the summary in the CRM.",
            ],
          },
          {
            title: "Objections",
            items: [
              "Legal is slow, and Harper will not sponsor a tool her security team has not signed.",
              "A 400-seat rollout is off the table until the sales pilot proves adoption.",
              "Another recording bot is not a buying reason — Fathom already taught that category.",
            ],
          },
          {
            title: "Buying signals",
            items: [
              "Harper asked to see Harbor inside a Salesforce-native sales workflow.",
              "Naomi narrowed the ask to a 60-day, 40-seat sales pilot.",
              "Harper volunteered customer language Harbor can reuse in the pitch.",
            ],
          },
          {
            title: "Next steps",
            items: owned(meeting).length ? owned(meeting) : meeting.followUps,
          },
        ],
      };
    }
    return {
      overview: `Commercial read of “${meeting.title}” with ${names(meeting)}. ${meeting.overview}`,
      sections: [
        { title: "Summary", items: [meeting.overview] },
        { title: "Pain points", items: meeting.takeaways.slice(0, 3) },
        {
          title: "Objections",
          items: meeting.decisions.length ? meeting.decisions : meeting.takeaways.slice(0, 2),
        },
        { title: "Buying signals", items: meeting.followUps.length ? meeting.followUps : meeting.takeaways },
        { title: "Next steps", items: owned(meeting) },
      ],
    };
  }

  if (template === "one-on-one") {
    if (meeting.id === "board-prep-finance") {
      return {
        overview:
          "Jordan and Theo walked the Q3 board pack: burn, net dollar retention, and a usage-based billing story that does not pretend Acme's 400 seats are closed.",
        sections: [
          { title: "Summary", items: [meeting.overview] },
          {
            title: "Wins",
            items: [
              "The conservative board path is agreed: show burn and retention without an Acme forecast.",
              "Usage-based billing is framed as a 2026 H2 experiment, not a Q4 certainty.",
              "Theo has the numbers Jordan can defend in the room.",
            ],
          },
          {
            title: "Challenges",
            items: [
              "Hope is not a line item — Acme must stay out of the forecast.",
              "The aggressive hiring slide would get negotiated back into the meeting.",
              "Finance and product still describe billing on different clocks.",
            ],
          },
          {
            title: "Feedback",
            items: [
              "Jordan asked for one page, not a deck the board can re-trade.",
              "Dana should replace the signup chart with the activation number before Thursday.",
              "Theo should keep the narrative conservative even if the room asks for upside.",
            ],
          },
          { title: "Action items", items: owned(meeting) },
        ],
      };
    }
    return {
      overview: `1:1 notes from “${meeting.title}”. ${names(meeting)} covered what moved, what is stuck, and who leaves with work.`,
      sections: [
        { title: "Summary", items: [meeting.overview] },
        { title: "Wins", items: meeting.decisions.length ? meeting.decisions : meeting.takeaways.slice(0, 2) },
        { title: "Challenges", items: meeting.takeaways },
        { title: "Feedback", items: meeting.followUps.length ? meeting.followUps : meeting.takeaways.slice(0, 2) },
        { title: "Action items", items: owned(meeting) },
      ],
    };
  }

  if (template === "recruiting") {
    if (meeting.id === "staff-eng-interview") {
      return {
        overview:
          "Mica Santos walked a past incident and a system design for meeting ingestion. The panel leaned hire, with a catch-up on customer-facing product sense before the founder interview.",
        sections: [
          {
            title: "Candidate signals",
            items: [
              "Mica refused a Friday deploy when the SLO argument was clean.",
              "She reached for idempotency keys and a repair job instead of heroics.",
              "Product sense was lighter than the reliability bar the panel wanted.",
            ],
          },
          {
            title: "Strengths",
            items: [
              "Incident narrative was specific: load shedding, not a vague postmortem.",
              "Clear about first-90-days scope — reliability rotation, not billing.",
              "Comfortable disagreeing with a ship date in the room.",
            ],
          },
          {
            title: "Concerns",
            items: [
              "Customer-facing judgment is untested beyond the system-design prompt.",
              "The panel still wants Jordan's read before an offer.",
              "Scorecards were not in Ashby before the debrief started.",
            ],
          },
          {
            title: "Interview notes",
            items: meeting.takeaways.length ? meeting.takeaways : [meeting.overview],
          },
          { title: "Next steps", items: meeting.decisions.length ? meeting.decisions : owned(meeting) },
        ],
      };
    }
    return {
      overview: `Interview read of “${meeting.title}”. ${meeting.overview}`,
      sections: [
        { title: "Candidate signals", items: meeting.takeaways.slice(0, 3) },
        { title: "Strengths", items: meeting.decisions.length ? meeting.decisions : meeting.takeaways.slice(0, 2) },
        { title: "Concerns", items: meeting.followUps.length ? meeting.followUps : meeting.takeaways.slice(-2) },
        { title: "Interview notes", items: [meeting.overview, ...meeting.takeaways.slice(0, 2)] },
        { title: "Next steps", items: owned(meeting) },
      ],
    };
  }

  if (template === "product-planning") {
    if (meeting.id === "q3-product-planning") {
      return {
        overview:
          "Product leadership locked Q3 to three bets: self-serve onboarding, usage-based billing behind a flag, and a faster insights workspace. The mobile rewrite is out.",
        sections: [
          {
            title: "Product decisions",
            items: meeting.decisions.length
              ? meeting.decisions
              : ["Kill the mobile rewrite for Q3.", "Staff billing instrumentation from Oct 6."],
          },
          {
            title: "Priorities",
            items: [
              "Week-one activation is the north star: 19% today, 28% by November.",
              "Billing ships to the top 20 accounts before any public beta.",
              "A two-week reliability buffer stays on the eng calendar after checkout.",
            ],
          },
          {
            title: "Risks",
            items: [
              "Acme custom metering could steal the flag before it is stable.",
              "Cutting mobile will resurface in Slack unless Jordan says it out loud.",
              "Missing 28% will not be visible until week three unless it is on the one-pager.",
            ],
          },
          {
            title: "Open questions",
            items: [
              "Does Elena's first-run mock teach, or does it still apologize?",
              "Who stalls Acme if they ask for custom metering early — Chris and Naomi.",
              "Can Sam spare two engineers on Oct 6 without touching Owen's reliability sprint?",
            ],
          },
          { title: "Next steps", items: owned(meeting) },
        ],
      };
    }
    return {
      overview: `Planning read of “${meeting.title}”. ${meeting.overview}`,
      sections: [
        { title: "Product decisions", items: meeting.decisions.length ? meeting.decisions : meeting.takeaways.slice(0, 2) },
        { title: "Priorities", items: meeting.takeaways },
        { title: "Risks", items: meeting.followUps.length ? meeting.followUps : meeting.takeaways.slice(-2) },
        {
          title: "Open questions",
          items: meeting.highlights.length
            ? meeting.highlights.map((h) => `${h.title}: ${h.description}`)
            : meeting.takeaways.slice(0, 3),
        },
        { title: "Next steps", items: owned(meeting) },
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
