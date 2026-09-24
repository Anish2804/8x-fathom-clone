import { meetings } from "@/data/meetings";

export type AskCitation = {
  meetingId: string;
  meetingTitle: string;
  speaker: string;
  snippet: string;
  href: string;
};

export type AskAnswer = {
  answer: string;
  citations: AskCitation[];
};

function tokenize(q: string): string[] {
  return q
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !["what", "who", "when", "where", "does", "did", "the", "and", "for", "about", "from", "with", "this", "that", "were", "was"].includes(w));
}

function scoreText(text: string, tokens: string[]): number {
  const hay = text.toLowerCase();
  return tokens.reduce((n, t) => n + (hay.includes(t) ? 1 : 0), 0);
}

export function askHarbor(question: string): AskAnswer {
  const tokens = tokenize(question);
  if (tokens.length === 0) {
    return {
      answer: "Ask about a person, a decision, or a phrase from the seeded meetings — for example “What did Harper say about SSO?”",
      citations: [],
    };
  }

  const hits: (AskCitation & { score: number })[] = [];

  for (const meeting of meetings.filter((m) => m.status === "ready")) {
    for (const line of meeting.transcript) {
      const score = scoreText(line.text, tokens);
      if (score === 0) continue;
      const speaker = meeting.participants.find((p) => p.id === line.speakerId)?.name ?? "Someone";
      hits.push({
        score,
        meetingId: meeting.id,
        meetingTitle: meeting.title,
        speaker,
        snippet: line.text,
        href: `/meetings/${meeting.id}?t=${line.startMs}&line=${line.id}`,
      });
    }
    const summaryScore = scoreText(
      [meeting.overview, ...meeting.takeaways, ...meeting.decisions].join(" "),
      tokens,
    );
    if (summaryScore > 0) {
      hits.push({
        score: summaryScore,
        meetingId: meeting.id,
        meetingTitle: meeting.title,
        speaker: "AI summary",
        snippet: meeting.takeaways[0] ?? meeting.overview.slice(0, 160),
        href: `/meetings/${meeting.id}#summary`,
      });
    }
  }

  hits.sort((a, b) => b.score - a.score);
  const top = hits.slice(0, 5);
  if (!top.length) {
    return {
      answer: "Nothing in the seeded workspace matched that question. Try a name (Harper, Leah) or a topic (SSO, activation, reliability).",
      citations: [],
    };
  }

  const uniqueMeetings = [...new Set(top.map((h) => h.meetingTitle))];
  const lead = top[0];
  const answer = `${lead.speaker} in “${lead.meetingTitle}”: ${lead.snippet}${
    uniqueMeetings.length > 1 ? ` Related notes also show up in ${uniqueMeetings.slice(1).join(", ")}.` : ""
  }`;

  return {
    answer,
    citations: top.map(({ score: _s, ...rest }) => rest),
  };
}

export function suggestedQuestions(): string[] {
  return [
    "What did Harper say about SSO?",
    "Who owns the reliability sprint?",
    "What is the activation metric?",
    "Is Acme a 400-seat deal?",
  ];
}
