import type {
  ActionItem,
  Highlight,
  Meeting,
  Participant,
  TranscriptLine,
} from "@/lib/types";

export const people = {
  priya: p("priya", "Priya Nair", "priya@lumenhq.com", "VP Product", 168),
  jordan: p("jordan", "Jordan Hale", "jordan@lumenhq.com", "CEO", 32),
  alex: p("alex", "Alex Rivera", "alex@lumenhq.com", "Eng Manager", 210),
  sam: p("sam", "Sam Okonkwo", "sam@lumenhq.com", "Staff Engineer", 262),
  elena: p("elena", "Elena Vasquez", "elena@lumenhq.com", "Design Lead", 12),
  chris: p("chris", "Chris Park", "chris@lumenhq.com", "Customer Success", 145),
  naomi: p("naomi", "Naomi Brooks", "naomi@lumenhq.com", "Account Executive", 48),
  theo: p("theo", "Theo Lindqvist", "theo@lumenhq.com", "Finance", 198),
  riley: p("riley", "Riley Ames", "riley@lumenhq.com", "Talent", 88),
  dana: p("dana", "Dana Cho", "dana@lumenhq.com", "Marketing", 330),
  harper: p("harper", "Harper Quinn", "harper@acme.co", "VP Ops, Acme", 22),
  leah: p("leah", "Dr. Leah Grant", "leah@northstar.health", "CIO, Northstar Health", 176),
  nina: p("nina", "Nina Kapoor", "nina@latticelabs.io", "Partnerships", 300),
  owen: p("owen", "Owen Blake", "owen@lumenhq.com", "SRE", 230),
  mica: p("mica", "Mica Santos", "mica@candidate.dev", "Staff Eng candidate", 54),
} as const;

function p(
  id: string,
  name: string,
  email: string,
  role: string,
  hue: number,
): Participant {
  return { id, name, email, role, hue };
}

function transcript(
  rows: [keyof typeof people, number, string][],
): TranscriptLine[] {
  return rows.map((row, i) => {
    const [key, startSec, text] = row;
    const next = rows[i + 1];
    const endSec = next ? Math.max(next[1], startSec + 4) : startSec + 9;
    return {
      id: `ln-${i + 1}`,
      speakerId: people[key].id,
      startMs: startSec * 1000,
      endMs: endSec * 1000,
      text,
    };
  });
}

function actions(
  rows: [string, string, keyof typeof people, "open" | "done", string?][],
): ActionItem[] {
  return rows.map(([id, text, who, status, due]) => ({
    id,
    text,
    assigneeId: people[who].id,
    status,
    due,
  }));
}

function marks(
  rows: [string, number, string, string, string?][],
): Highlight[] {
  return rows.map(([id, startMs, title, description, lineId]) => ({
    id,
    startMs,
    title,
    description,
    lineId,
  }));
}

export const meetings: Meeting[] = [
  {
    id: "q3-product-planning",
    title: "Q3 product planning offsite",
    type: "planning",
    status: "ready",
    platform: "Google Meet",
    startsAt: "2026-09-22T15:00:00.000Z",
    durationMin: 62,
    team: "Product",
    participants: [people.priya, people.jordan, people.alex, people.elena, people.sam],
    overview:
      "The product leadership team aligned Q3 around three bets: self-serve onboarding, usage-based billing, and a faster insights workspace. They agreed to cut the mobile rewrite from the quarter and protect two weeks of platform work after the checkout latency incident.",
    takeaways: [
      "Onboarding activation is the north-star metric; target 28% week-1 activation by November.",
      "Usage-based billing ships behind a flag for the top 20 accounts before a public beta.",
      "Mobile rewrite is deferred; native wrappers stay until Q1.",
      "Platform team gets a dedicated reliability sprint after the retro action items land.",
    ],
    decisions: [
      "Kill the mobile rewrite for Q3.",
      "Staff 2 engineers on billing instrumentation starting Oct 6.",
      "Elena owns a redesigned empty state for first-run insights.",
    ],
    followUps: [
      "Jordan will preview the plan with the board on Thursday.",
      "Priya to publish the Q3 one-pager in Notion by Friday EOD.",
    ],
    topics: [
      { name: "Onboarding activation", weight: 92 },
      { name: "Usage-based billing", weight: 78 },
      { name: "Roadmap tradeoffs", weight: 71 },
      { name: "Reliability capacity", weight: 54 },
    ],
    actionItems: actions([
      ["a1", "Publish Q3 one-pager with bets, owners, and dates", "priya", "open", "Sep 26"],
      ["a2", "Scope billing instrumentation spike (2 weeks)", "sam", "open", "Sep 29"],
      ["a3", "First-run insights empty-state mock", "elena", "open", "Oct 1"],
      ["a4", "Hold 2-week reliability buffer on the eng calendar", "alex", "done", "Sep 23"],
    ]),
    highlights: marks([
      ["h1", 172000, "Kill mobile rewrite", "Jordan makes the call to defer native work.", "ln-9"],
      ["h2", 274000, "Activation target 28%", "Priya locks the north-star number for Q3.", "ln-13"],
    ]),
    transcript: transcript([
      ["priya", 8, "Thanks everyone for blocking the afternoon. Goal is a ruthless Q3: three bets, not twelve."],
      ["jordan", 22, "I want us to be able to say this in a board slide without hedging. What actually moves revenue and retention?"],
      ["alex", 41, "Engineering can land onboarding and billing if we stop pretending the iOS rewrite is free. It is not free."],
      ["elena", 63, "Design agrees. Mobile polish is a tax. Self-serve onboarding is where we lose people in the first session."],
      ["sam", 88, "The instrumentation for usage-based billing is the scary part. Metering has to be correct or finance will hunt us."],
      ["priya", 112, "Then billing is a flag, not a launch party. Top twenty accounts, white-glove, then beta."],
      ["jordan", 138, "Good. What do we cut?"],
      ["alex", 148, "Mobile rewrite. Also the in-app store experiments. We do not have the people."],
      ["jordan", 172, "Done. Mobile rewrite is dead for Q3. I'll say that out loud so nobody resurrects it in Slack."],
      ["elena", 198, "I'll redesign the first-run insights empty state. Right now it apologizes. It should teach."],
      ["sam", 224, "I can spare two engineers on metering from October 6 if we protect the reliability sprint after checkout."],
      ["alex", 251, "Already holding two weeks. Owen's retro made that non-negotiable."],
      ["priya", 274, "North star: week-one activation. We are at 19%. I want 28% by November. That is the number."],
      ["jordan", 298, "Put 28% on the one-pager. If we miss, I want to know in week three, not at the quarter postmortem."],
      ["priya", 326, "I'll publish Friday. Owners, dates, what we are not doing. Jordan, you take the board preview Thursday?"],
      ["jordan", 348, "Yes. Keep it to one page or they will negotiate us back into twelve bets."],
      ["sam", 372, "One risk: if Acme wants custom metering before the flag is stable, we need Chris and Naomi to stall politely."],
      ["priya", 401, "I'll brief CS. Custom work only if it looks like the product we already planned."],
      ["elena", 428, "I'll share mocks Monday. If first-run still feels like a dashboard graveyard, we failed the bet."],
      ["alex", 456, "I'll update the roadmap in Linear tonight so the ghosts of old tickets stop recruiting people."],
      ["jordan", 481, "Great meeting. Three bets. Two weeks of reliability. No mobile rewrite. Let's go."],
      ["priya", 502, "Recording will have the summary. I'll drop the one-pager in #product. Thanks all."],
    ]),
  },
  {
    id: "acme-enterprise-demo",
    title: "Acme Corp enterprise demo",
    type: "customer",
    status: "ready",
    platform: "Zoom",
    startsAt: "2026-09-24T17:30:00.000Z",
    durationMin: 48,
    team: "Sales",
    participants: [people.naomi, people.chris, people.priya, people.harper],
    overview:
      "Harper Quinn from Acme evaluated Harbor for a 400-seat rollout. She loved the meeting summary and action-item assignment, and asked for SSO, retention controls, and a Salesforce push. Naomi proposed a 60-day pilot on the sales org only.",
    takeaways: [
      "Acme's pain is post-call CRM hygiene, not recording itself.",
      "SSO (Okta) and 2-year retention are blockers for security review.",
      "Pilot: 40 sellers, Salesforce opportunity notes, weekly success review.",
      "Legal wants a DPA redline before procurement starts.",
    ],
    decisions: [
      "Run a 60-day, 40-seat sales pilot, not a company-wide rollout.",
      "Priya will join the security questionnaire call next Tuesday.",
    ],
    followUps: [
      "Naomi to send the pilot proposal and pricing addendum today.",
      "Chris to introduce Harper to the Northstar Health case study.",
    ],
    topics: [
      { name: "Salesforce workflow", weight: 88 },
      { name: "Security & SSO", weight: 80 },
      { name: "Pilot scope", weight: 74 },
      { name: "Pricing", weight: 51 },
    ],
    actionItems: actions([
      ["a1", "Send 40-seat pilot proposal + DPA", "naomi", "open", "Sep 25"],
      ["a2", "Join Okta / security questionnaire", "priya", "open", "Sep 29"],
      ["a3", "Share Northstar case study PDF", "chris", "done", "Sep 24"],
    ]),
    highlights: marks([
      ["h1", 91000, "CRM hygiene is the pain", "Harper: sellers hate typing notes after calls.", "ln-6"],
      ["h2", 272000, "40-seat pilot", "Naomi narrows rollout to sales only.", "ln-12"],
    ]),
    transcript: transcript([
      ["naomi", 6, "Harper, thanks for making time. You asked to see how Harbor lands in a sales org that already lives in Salesforce."],
      ["harper", 24, "Yes. We record everything. Nobody reads the recordings. Managers still ask 'what did they say about budget?'"],
      ["chris", 48, "That is the pattern we see. The artifact that matters is the CRM field, not the MP4."],
      ["priya", 66, "In the product, summaries map to opportunity notes. Action items can assign back to the AE or SE."],
      ["harper", 91, "Can it push to Salesforce without a seller clicking five times? Because they will not click five times."],
      ["naomi", 118, "Default is automatic on meeting end, with a 10-minute edit window. Most teams leave it on."],
      ["harper", 141, "Security is going to ask about Okta, retention, and whether prompts leave our VPC. I need real answers, not a slide."],
      ["priya", 168, "Okta is GA. Retention is configurable up to two years on enterprise. Inference is currently multi-tenant US; private networking is on the Q4 list, not this quarter."],
      ["harper", 201, "Q4 might be a problem. Procurement wanted this for October. I can maybe sell a pilot if the data model is clean."],
      ["chris", 228, "Northstar Health did SSO plus a 90-day pilot on 35 users. Happy to share the writeup."],
      ["harper", 251, "Send it. Also pricing: we are not buying 400 seats to learn the product."],
      ["naomi", 272, "Then we do not sell 400 seats. Forty sellers, sixty days, Salesforce notes only. If activation is real, we expand."],
      ["harper", 301, "Forty I can get. I need a DPA redline and a security call with someone who does not sound like marketing."],
      ["priya", 328, "I'll join Tuesday. Bring your CISO questions. I'll be boring on purpose."],
      ["harper", 349, "Perfect. If the summary quality matches what you just showed on the Acme mock call, my team will actually use this."],
      ["naomi", 378, "I'll send the proposal this afternoon: seats, success metrics, and the legal packet."],
      ["chris", 401, "I'll include the Northstar PDF and a 12-minute clip of their workflow, not a deck."],
      ["harper", 424, "Appreciate it. I have to jump to another vendor call, unfortunately. This was the useful one."],
      ["naomi", 448, "We'll follow up in writing in an hour. Thanks Harper."],
    ]),
  },
  {
    id: "eng-standup-sep24",
    title: "Engineering standup",
    type: "standup",
    status: "ready",
    platform: "Google Meet",
    startsAt: "2026-09-24T14:15:00.000Z",
    durationMin: 18,
    team: "Engineering",
    participants: [people.alex, people.sam, people.owen, people.elena],
    overview:
      "A short standup covering checkout p95, the billing spike, and a design review later today. Owen confirmed the queue lag is back under budget after the worker hotfix. Sam is blocked on finance's event taxonomy.",
    takeaways: [
      "Checkout p95 is 420ms after the hotfix, under the 500ms SLO.",
      "Billing spike needs the finance event names by Thursday.",
      "Design critique for onboarding is at 4pm; Elena wants engineering in the room.",
    ],
    decisions: [
      "No more checkout cherry-picks this week unless SLO regresses.",
      "Sam pairs with Theo tomorrow on the taxonomy doc.",
    ],
    followUps: [
      "Owen to post the latency graph in #incidents.",
      "Alex to unblock the Linear ticket for metering.",
    ],
    topics: [
      { name: "Checkout latency", weight: 84 },
      { name: "Billing instrumentation", weight: 70 },
      { name: "Onboarding review", weight: 46 },
    ],
    actionItems: actions([
      ["a1", "Post p95 graph and hotfix notes", "owen", "done", "Sep 24"],
      ["a2", "Pair with Theo on event taxonomy", "sam", "open", "Sep 25"],
    ]),
    highlights: marks([
      ["h1", 14000, "p95 back under SLO", "Owen: 420ms after worker hotfix.", "ln-2"],
    ]),
    transcript: transcript([
      ["alex", 4, "Standup in 15. Owen, checkout first, then Sam, then Elena if you need us."],
      ["owen", 14, "Hotfix for the worker pool is on prod. p95 is 420ms, SLO is 500. Error rate is quiet."],
      ["alex", 32, "Nice. No more cherry-picks unless it regresses. Write it up so the retro is not vibes."],
      ["owen", 48, "Graph is going in #incidents after this."],
      ["sam", 58, "Billing spike is blocked on names. Finance still uses 'usage_unit' and we use 'billable_event'. Same thing, two religions."],
      ["alex", 78, "Sit with Theo tomorrow. I'll make it a real meeting so it does not slip."],
      ["sam", 94, "Works. Once names exist I can instrument in a week, not a month."],
      ["elena", 108, "Design critique for onboarding is at 4. I need someone who knows the auth session, not just opinions about type."],
      ["alex", 126, "I'll be there. Sam if the taxonomy meeting is not exploding."],
      ["sam", 140, "I'll try. Empty states are where the activation bet dies."],
      ["alex", 154, "That is the whole Q3 speech. Okay, shipping. Ping if SLO blinks."],
    ]),
  },
  {
    id: "onboarding-design-critique",
    title: "Design critique: first-run onboarding",
    type: "internal",
    status: "ready",
    platform: "Google Meet",
    startsAt: "2026-09-23T20:00:00.000Z",
    durationMin: 41,
    team: "Design",
    participants: [people.elena, people.priya, people.alex, people.dana],
    overview:
      "Elena walked through three first-run concepts. The group chose a guided 'first insight' path over a blank dashboard. Dana asked for a shareable moment at the end of onboarding for PLG loops. Priya insisted the activation event is 'created first highlight', not 'finished tour'.",
    takeaways: [
      "Concept B (first insight in 90 seconds) wins over empty canvas and long tour.",
      "Activation event should be creating a highlight or action item, not clicking through tips.",
      "Need a lightweight invite step before the paywall, not after.",
    ],
    decisions: [
      "Ship concept B behind a 20% experiment next week.",
      "Drop the 11-step product tour.",
    ],
    followUps: [
      "Dana to draft the invite copy.",
      "Alex to estimate experiment scaffolding.",
    ],
    topics: [
      { name: "First-run UX", weight: 95 },
      { name: "Activation metric", weight: 82 },
      { name: "PLG invite loop", weight: 60 },
    ],
    actionItems: actions([
      ["a1", "High-fi for concept B + motion spec", "elena", "open", "Sep 30"],
      ["a2", "Experiment scaffolding estimate", "alex", "open", "Sep 26"],
      ["a3", "Invite-a-teammate copy variants", "dana", "open", "Sep 29"],
    ]),
    highlights: marks([
      ["h1", 114000, "Activation is a highlight", "Priya rejects tour-complete as a metric.", "ln-6"],
    ]),
    transcript: transcript([
      ["elena", 7, "Three concepts. A is a tour. B is one insight in ninety seconds. C is a blank canvas with recipes. I have a favorite but I will behave."],
      ["priya", 32, "Please behave for two minutes. Then you can have a favorite."],
      ["dana", 44, "From growth: if they never invite anyone, we die on single-player. I need a share moment."],
      ["alex", 63, "Tours get skipped. Blank canvases get abandoned. I'm already biased to B."],
      ["elena", 82, "B uses a real snippet from their first meeting. We highlight one sentence and ask if it is an action item. That is the product."],
      ["priya", 114, "Yes. Activation is not 'finished onboarding'. Activation is they created a highlight or an action. Measure that."],
      ["dana", 141, "Can the last step be invite a teammate before we show the paywall? Paywall after a win, not after a lecture."],
      ["elena", 168, "I can put invite on the success screen. Soft, not a modal that traps them."],
      ["alex", 189, "Experiment-wise we can do 20% next week if the copy is frozen Friday. Don't make me instrument seven variants."],
      ["priya", 216, "One variant. Concept B versus current. If it wins, we go 100%."],
      ["elena", 238, "I'll drop the tour. It was a museum of features nobody asked to visit."],
      ["dana", 258, "I'll write invite copy that sounds like a teammate, not a billboard."],
      ["priya", 278, "Ship the hi-fi Monday. If B still feels clever instead of useful, we killed it ourselves."],
      ["elena", 304, "It should feel like the meeting already happened and Harbor just caught the interesting bit."],
      ["alex", 328, "That's the pitch. I'll have the estimate tomorrow."],
    ]),
  },
  {
    id: "northstar-health-qbr",
    title: "Northstar Health QBR",
    type: "customer",
    status: "ready",
    platform: "Microsoft Teams",
    startsAt: "2026-09-19T16:00:00.000Z",
    durationMin: 55,
    team: "Customer Success",
    participants: [people.chris, people.sam, people.leah, people.naomi],
    overview:
      "Quarterly business review with Northstar Health. Adoption is strong in the clinical ops team but weak among physicians. Leah wants specialty-specific summary templates and a BAA-friendly export. Sam committed to a templates beta in October.",
    takeaways: [
      "62% weekly active in ops, 11% among physicians — the gap is template relevance, not training.",
      "Need HIPAA-oriented export (PDF + audit trail) for credentialing committees.",
      "Expansion opportunity: 120 additional seats in two regional clinics if templates land.",
    ],
    decisions: [
      "Put Northstar on the October templates beta.",
      "Hold pricing for expansion until templates are in their hands.",
    ],
    followUps: [
      "Chris to schedule a physician shadow session.",
      "Naomi to draft expansion quote with a success clause.",
    ],
    topics: [
      { name: "Physician adoption", weight: 90 },
      { name: "HIPAA export", weight: 73 },
      { name: "Seat expansion", weight: 65 },
    ],
    actionItems: actions([
      ["a1", "Enroll Northstar in templates beta", "sam", "open", "Oct 8"],
      ["a2", "Physician workflow shadow (2 clinics)", "chris", "open", "Oct 3"],
      ["a3", "Expansion quote with success clause", "naomi", "open", "Oct 10"],
    ]),
    highlights: marks([
      ["h1", 28000, "Physicians ignore generic notes", "Leah: summaries sound like vendor software.", "ln-2"],
    ]),
    transcript: transcript([
      ["chris", 10, "Leah, thanks for the QBR. I pulled usage: ops loves this, physicians mostly don't open it."],
      ["leah", 28, "That tracks. My ops team lives in meetings. Physicians live in the inbox and the EHR. Generic summaries feel like vendor software."],
      ["sam", 54, "We can do specialty templates — cardiology versus oncology versus admin. Different headings, different action verbs."],
      ["leah", 81, "If it says 'action items' a surgeon will ignore it. If it says 'orders to confirm' they might not."],
      ["chris", 108, "We should shadow two clinics. I don't want to guess the nouns."],
      ["leah", 124, "I'll get you 90 minutes with cardiology next week. Bring someone technical."],
      ["naomi", 144, "On expansion: two regional clinics, about 120 seats, but I will not send a quote that assumes the product they don't use yet."],
      ["leah", 172, "Correct. Also our credentialing committee wants a PDF export with an audit trail. That is a HIPAA conversation, not a feature request in a vacuum."],
      ["sam", 201, "Export with actor, timestamp, and hash is doable for October if we keep the template to PDF, not a new EHR integration."],
      ["leah", 232, "PDF is fine. Do not try to write to Epic this year. I am still recovering from the last vendor who promised that."],
      ["chris", 258, "Noted. Success plan: templates beta in October, shadow next week, expansion conversation after physicians actually click."],
      ["leah", 286, "If the cardiology template is good, I'll champion the 120 seats. If it's another generic recap, I'll quietly stop forwarding your emails."],
      ["sam", 318, "That's the most honest success metric I've heard all month."],
      ["naomi", 334, "We'll write the quote with a clause so you aren't paying for seats that never log in."],
      ["leah", 358, "Send calendar holds before you send PDFs. My admin filters vendor PDFs."],
      ["chris", 378, "Holds first. Thanks Leah. We'll be boring and specific."],
    ]),
  },
  {
    id: "staff-eng-interview",
    title: "Hiring loop: Staff Engineer",
    type: "interview",
    status: "ready",
    platform: "Zoom",
    startsAt: "2026-09-18T18:00:00.000Z",
    durationMin: 44,
    team: "Talent",
    participants: [people.riley, people.alex, people.sam, people.mica],
    overview:
      "Mica Santos walked through a past incident and a system design for meeting ingestion. Strong on reliability tradeoffs, lighter on product sense. The panel leaned hire, with a catch-up on customer-facing communication.",
    takeaways: [
      "Excellent incident narrative: load shedding, SLOs, and saying no to a risky deploy.",
      "Design for ingestion was pragmatic (queue + idempotent workers) rather than fashionable.",
      "Needs coaching on translating tradeoffs for non-engineers.",
    ],
    decisions: [
      "Advance Mica to founder interview with Jordan.",
      "If hired, first 90 days on the reliability rotation, not billing.",
    ],
    followUps: [
      "Riley to collect written feedback by tomorrow 10am.",
      "Alex to send the take-home skip rationale to Jordan.",
    ],
    topics: [
      { name: "Incident judgment", weight: 86 },
      { name: "Ingestion design", weight: 77 },
      { name: "Hiring bar", weight: 69 },
    ],
    actionItems: actions([
      ["a1", "Scorecards in Ashby before 10am", "alex", "open", "Sep 19"],
      ["a2", "Schedule Jordan interview", "riley", "done", "Sep 19"],
    ]),
    highlights: marks([
      ["h1", 90000, "Load shedding story", "Mica refused a Friday deploy with a clean SLO argument.", "ln-6"],
    ]),
    transcript: transcript([
      ["riley", 5, "Mica, this is the staff loop: past incident, then a sketch of how you'd ingest meetings. No trick puzzles."],
      ["mica", 22, "Appreciate that. Last year we had a queue meltdown after a retry storm. I argued for load shedding instead of adding brokers."],
      ["sam", 48, "What did you shed?"],
      ["mica", 56, "Non-urgent transcripts first. Live captions were sacred. We published a degraded banner instead of lying with silence."],
      ["alex", 81, "Friday deploy pressure?"],
      ["mica", 90, "PM wanted a flag flip. SLO was already orange. I said no, we wait for Monday with a rollback plan that we actually rehearsed."],
      ["sam", 118, "Good. Ingestion: meetings are late, duplicate, and sometimes encrypted. How do you not make that our problem twice?"],
      ["mica", 141, "Idempotency keys from calendar event plus start time. Workers are dumb. A repair job exists because reality is rude."],
      ["alex", 168, "Where would you over-invest?"],
      ["mica", 176, "Observability of stuck meetings. Users forgive a delay. They do not forgive a black hole."],
      ["riley", 198, "How do you explain that to a customer success lead who just wants the file?"],
      ["mica", 214, "I'd do better with practice. I tend to say 'backpressure' when I should say 'we're unblocking the oldest meetings first'."],
      ["sam", 242, "That's coachable. The technical taste is there."],
      ["alex", 258, "I'd put you on reliability, not billing, for the first 90 days. Billing is political."],
      ["mica", 278, "I'd prefer that. I like being where the pages are honest."],
      ["riley", 294, "We'll get you time with Jordan. Thanks for being concrete. Most candidates design a spaceship."],
      ["mica", 318, "I have been on call for spaceships. They page at 3am too."],
    ]),
  },
  {
    id: "board-prep-finance",
    title: "Board prep with finance",
    type: "internal",
    status: "ready",
    platform: "Google Meet",
    startsAt: "2026-09-17T15:30:00.000Z",
    durationMin: 36,
    team: "Finance",
    participants: [people.theo, people.jordan, people.priya, people.dana],
    overview:
      "Theo walked Jordan through the Q3 board pack: burn, net dollar retention, and the usage-based billing narrative. They agreed to show a conservative path that does not assume Acme's 400 seats. Dana will tighten the story on organic signups.",
    takeaways: [
      "NDR is 112%; keep that as the lead metric, not logo count.",
      "Do not put Acme expansion in the committed forecast.",
      "Cash runway is 17 months at current burn; hiring plan stays at +8, not +14.",
    ],
    decisions: [
      "Board deck v2 drops the aggressive hiring slide.",
      "Usage-based billing described as a 2026 H2 experiment, not a 2026 Q4 certainty.",
    ],
    followUps: [
      "Theo to send v2 by Wednesday 9am.",
      "Dana to replace vanity signup chart with activation.",
    ],
    topics: [
      { name: "Board narrative", weight: 88 },
      { name: "Hiring vs runway", weight: 76 },
      { name: "Billing forecast", weight: 64 },
    ],
    actionItems: actions([
      ["a1", "Board deck v2 without Acme as committed", "theo", "open", "Sep 18"],
      ["a2", "Replace signup chart with activation", "dana", "open", "Sep 18"],
    ]),
    highlights: marks([
      ["h1", 162000, "Acme is not a forecast", "Jordan: hope is not a line item.", "ln-8"],
    ]),
    transcript: transcript([
      ["theo", 6, "Pack is long. I'll cut it if you let me. Lead with NDR 112, then burn, then the three product bets."],
      ["jordan", 28, "Logo charts make us look busy. NDR makes us look like a business. Lead with NDR."],
      ["priya", 48, "Please do not let billing sound like it prints money in November. It is a flag for twenty accounts."],
      ["theo", 72, "I'll call it an H2 experiment. If I put Q4 revenue on it, the board will tattoo it on us."],
      ["dana", 96, "Organic signups are up, but activation is the adult metric. I'll swap the chart."],
      ["jordan", 118, "Hiring: people want fourteen. We can afford eight without getting stupid."],
      ["theo", 138, "Runway is seventeen months at current burn. Fourteen hires makes that a short story."],
      ["jordan", 162, "Acme is not in the forecast. I'll say it twice. Hope is not a line item."],
      ["priya", 184, "Good. If Harper's pilot works, that's a Q4 surprise, not a Q3 promise."],
      ["theo", 206, "v2 Wednesday 9am. I'll kill the appendix that nobody reads except the one person who will."],
      ["dana", 228, "I'll send activation copy tonight so you are not waiting on marketing adjectives."],
      ["jordan", 248, "Keep the tone calm. We are not raising next month. We are explaining the business we already have."],
    ]),
  },
  {
    id: "campaign-kickoff",
    title: "H2 campaign kickoff",
    type: "planning",
    status: "ready",
    platform: "Zoom",
    startsAt: "2026-09-16T19:00:00.000Z",
    durationMin: 50,
    team: "Marketing",
    participants: [people.dana, people.priya, people.naomi, people.elena],
    overview:
      "Marketing kicked off the 'Meetings you can search' campaign. The team chose search and action items as the hero, not recording. Naomi asked for sales-enablement one-pagers before the webinar on Oct 8.",
    takeaways: [
      "Hero message: searchable meetings and action items, not 'we record Zoom'.",
      "Webinar on Oct 8 needs a live Harbor workspace, not slides.",
      "Paid social paused until the onboarding experiment ships so the landing page matches the product.",
    ],
    decisions: [
      "Pause paid until Oct 2.",
      "Webinar demo uses the Acme mock workspace.",
    ],
    followUps: [
      "Elena to supply stills from concept B.",
      "Naomi to list the five objections the one-pager must kill.",
    ],
    topics: [
      { name: "Campaign message", weight: 91 },
      { name: "Webinar demo", weight: 70 },
      { name: "Paid pause", weight: 58 },
    ],
    actionItems: actions([
      ["a1", "Campaign narrative doc + landing headline", "dana", "open", "Sep 28"],
      ["a2", "Five sales objections one-pager", "naomi", "open", "Sep 30"],
      ["a3", "Product stills from concept B", "elena", "open", "Sep 29"],
    ]),
    highlights: marks([
      ["h1", 9000, "Don't sell recording", "Dana: Fathom already taught buyers that category.", "ln-1"],
    ]),
    transcript: transcript([
      ["dana", 9, "If we sell 'we record your Zoom' we are a commodity. We sell meetings you can search and assign."],
      ["priya", 31, "Yes. Recording is table stakes and, for this demo, mocked anyway. The product is the notes."],
      ["naomi", 52, "Sellers get stuck on 'does it join the meeting?'. I need a one-pager that moves the conversation to CRM notes in sixty seconds."],
      ["elena", 81, "I can give you stills from the new first-run. It looks like a product, not a waveform."],
      ["dana", 104, "Webinar October 8. Live workspace. If we screenshare slides I will resign theatrically."],
      ["priya", 128, "Use the Acme mock. Harper already gave us language we can steal: 'nobody reads the recording'."],
      ["naomi", 152, "Stealing customer language is the entire job. I'll write the objections: SSO, Salesforce clicks, 'our legal is slow'."],
      ["dana", 180, "Paid social is paused until onboarding matches the landing page. I will not buy traffic into a tour."],
      ["priya", 206, "Experiment should be live by then. If not, we keep the pause. Growth vanity is expensive."],
      ["elena", 228, "I'll export stills without fake browser chrome. Dark and light."],
      ["dana", 248, "Headline options in the doc tomorrow. Vote in comments, not in a new meeting."],
    ]),
  },
  {
    id: "checkout-latency-retro",
    title: "Incident retro: checkout latency",
    type: "retro",
    status: "ready",
    platform: "Google Meet",
    startsAt: "2026-09-12T21:00:00.000Z",
    durationMin: 33,
    team: "Engineering",
    participants: [people.owen, people.alex, people.sam, people.priya],
    overview:
      "Retro for the Sep 11 checkout latency incident. A retry storm after a payments timeout saturated workers. Detection took 14 minutes because the dashboard was on average, not p95. The team agreed on load shedding and a dedicated reliability sprint.",
    takeaways: [
      "Alert on p95 and queue depth, not averages.",
      "Retries need jitter and a budget; infinite hope is not a policy.",
      "Customer comms were late; CS got paged from Twitter.",
    ],
    decisions: [
      "Two-week reliability sprint starting Sep 29.",
      "Owen owns a load-shedding runbook.",
    ],
    followUps: [
      "Priya to brief CS on status page language.",
      "Sam to cap retries in the payments client.",
    ],
    topics: [
      { name: "Retry storm", weight: 93 },
      { name: "Observability gap", weight: 81 },
      { name: "Comms", weight: 55 },
    ],
    actionItems: actions([
      ["a1", "Load-shedding runbook + game day", "owen", "open", "Sep 30"],
      ["a2", "Cap payment client retries with jitter", "sam", "open", "Sep 26"],
      ["a3", "Status page copy for CS", "priya", "done", "Sep 13"],
    ]),
    highlights: marks([
      ["h1", 18000, "Averages lied", "Owen: p95 was on fire while the dashboard looked calm.", "ln-2"],
    ]),
    transcript: transcript([
      ["alex", 5, "Blameless, specific, short. What broke, how we knew, what we change."],
      ["owen", 18, "Payments timed out. Client retried without jitter. Workers drowned. Checkout p95 went to 4s. The dashboard still said 'fine' because it showed averages."],
      ["sam", 52, "That's on the client I own. I'll cap retries. We were being 'resilient' in the way that causes outages."],
      ["priya", 78, "CS found out from a customer screenshot. That is unacceptable. Status page should have been up at minute five, not minute forty."],
      ["alex", 104, "Detection: 14 minutes. That's the embarrassment. Alert on queue depth and p95."],
      ["owen", 126, "I'll write a load-shedding runbook and we'll game-day it. Drop non-critical jobs, keep checkout."],
      ["sam", 152, "I can pair on the client cap this week. Should have existed before the clever queue."],
      ["priya", 174, "I'll give CS three sentences they can post without waiting for a blog post."],
      ["alex", 196, "We already reserved two weeks from Sep 29. This retro is why. Don't donate that time to features."],
      ["owen", 222, "I won't. I'd like not to do this meeting again with a new date in the title."],
    ]),
  },
  {
    id: "lattice-partnership",
    title: "Partnership: Lattice Labs",
    type: "customer",
    status: "ready",
    platform: "Zoom",
    startsAt: "2026-09-10T17:00:00.000Z",
    durationMin: 39,
    team: "Partnerships",
    participants: [people.nina, people.jordan, people.priya, people.dana],
    overview:
      "Lattice Labs proposed co-selling into mid-market HR teams. Jordan was open to a technical integration (push highlights into Lattice) but pushed back on a co-branded SKU. They agreed on a 90-day integration spike with a shared pipeline review.",
    takeaways: [
      "Integration > co-branded SKU. Harbor stays Harbor.",
      "Lattice can source 15 intro meetings; Lumen will not pay a reverse referral on existing opps.",
      "Legal needs a mutual NDA addendum for product telemetry sharing.",
    ],
    decisions: [
      "90-day integration spike, no SKU.",
      "Monthly pipeline review, not a joint forecast.",
    ],
    followUps: [
      "Priya to write a one-page integration contract (API, not slides).",
      "Dana to pause co-marketing until there is a working push.",
    ],
    topics: [
      { name: "Co-sell motion", weight: 79 },
      { name: "Product integration", weight: 84 },
      { name: "Brand", weight: 61 },
    ],
    actionItems: actions([
      ["a1", "Integration one-pager (API + events)", "priya", "open", "Sep 24"],
      ["a2", "Mutual NDA addendum", "jordan", "open", "Sep 26"],
    ]),
    highlights: marks([
      ["h1", 32000, "No co-branded SKU", "Jordan: we will not become a feature inside Lattice.", "ln-2"],
    ]),
    transcript: transcript([
      ["nina", 8, "We can open 15 intros into HR teams who already buy Lattice. The ask is a co-sell motion and, ideally, a bundle."],
      ["jordan", 32, "Intros yes. Bundle no. Harbor is not a checkbox inside someone else's SKU."],
      ["priya", 54, "An integration I like: push a highlight or action into Lattice as a performance note, with the person's consent."],
      ["nina", 82, "That's the story HR actually wants. Managers hate hunting through recordings for 'what did we agree in 1:1'."],
      ["dana", 108, "I can co-market when that push is real. A landing page before the API is how you get angry webinars."],
      ["jordan", 134, "Ninety days to spike the integration. Monthly pipeline review. We do not merge forecasts and pretend we are one company."],
      ["nina", 162, "Fair. We won't touch your existing opps. Reverse referrals only on net-new."],
      ["priya", 184, "I'll write the API surface on one page. If it needs a novel, it's the wrong integration."],
      ["jordan", 208, "Legal will want an NDA addendum if we share even aggregated telemetry. I'll start that so it isn't a surprise in week eight."],
      ["nina", 236, "I'll send the intro list once the one-pager exists. I don't want to burn those relationships on a mockup."],
      ["dana", 258, "I'll keep the brand work in a drawer. When it works, we'll make it loud."],
    ]),
  },
  {
    id: "q4-planning-war-room",
    title: "Q4 planning war room",
    type: "planning",
    status: "ready",
    platform: "Google Meet",
    startsAt: "2026-09-21T14:00:00.000Z",
    durationMin: 58,
    team: "Leadership",
    participants: [
      people.jordan,
      people.priya,
      people.alex,
      people.sam,
      people.elena,
      people.chris,
      people.naomi,
      people.dana,
    ],
    overview:
      "An hour-long leadership war room covering Q4 capacity, Acme expansion risk, checkout reliability, onboarding experiment, and marketing pause. Eight people, overlapping workstreams, and a long action list — the kind of call where notes have to carry the room after people drop.",
    takeaways: [
      "Headcount stays at +8; marketing paid stays paused until onboarding experiment is live.",
      "Acme remains a 40-seat pilot, not a 400-seat forecast.",
      "Reliability sprint is inviolable even if product wants billing earlier.",
      "Dana needs a live workspace for the Oct 8 webinar, not slides.",
    ],
    decisions: [
      "Protect the two-week reliability sprint starting Sep 29.",
      "Naomi owns Acme weekly until security questionnaire is done.",
      "Elena's concept B is the only onboarding experiment.",
    ],
    followUps: [
      "Priya publishes a one-page Q4 capacity map.",
      "Chris schedules the Northstar physician shadow and reports back here, not in Slack.",
    ],
    topics: [
      { name: "Q4 capacity", weight: 88 },
      { name: "Acme expansion", weight: 76 },
      { name: "Reliability", weight: 71 },
      { name: "Onboarding experiment", weight: 64 },
      { name: "Webinar demo", weight: 48 },
    ],
    actionItems: actions([
      ["a1", "Q4 capacity one-pager with names, not themes", "priya", "open", "Sep 24"],
      ["a2", "Keep reliability sprint dates locked in Linear", "alex", "open", "Sep 22"],
      ["a3", "Metering spike still behind the sprint, not instead of it", "sam", "open", "Sep 29"],
      ["a4", "Concept B hi-fi for the war-room follow-up", "elena", "open", "Sep 25"],
      ["a5", "Acme security call agenda to Priya", "naomi", "open", "Sep 23"],
      ["a6", "Northstar cardiology shadow hold", "chris", "open", "Oct 3"],
      ["a7", "Oct 8 webinar run-of-show using Acme mock workspace", "dana", "open", "Sep 30"],
      ["a8", "Board language: Acme is not committed revenue", "jordan", "done", "Sep 21"],
    ]),
    highlights: marks([
      ["h1", 248000, "Capacity is the constraint", "Jordan: we cannot staff twelve bets with eight hires.", "ln-6"],
      ["h2", 968000, "Reliability is not optional", "Alex refuses to donate the sprint to billing.", "ln-18"],
    ]),
    transcript: transcript([
      ["jordan", 12, "Eight of us, fifty-eight minutes, one map. If it is not on the one-pager it does not exist in Q4."],
      ["priya", 48, "Three bets still: onboarding, billing flag, insights workspace. Everything else is a parasite."],
      ["alex", 96, "Engineering can do two of those plus the reliability sprint. Not three plus a rewrite plus Acme custom."],
      ["sam", 148, "Metering is a two-engineer slice after Sep 29. If we start it now we will ship a lying invoice."],
      ["elena", 204, "Onboarding concept B needs this room to stop asking for a tour. Tours are how we lose the activation bet."],
      ["jordan", 248, "Capacity is the constraint. We cannot staff twelve bets with eight hires. Say it back to me if you disagree."],
      ["dana", 312, "I will not buy traffic into a product that still looks like a museum. Paid stays paused."],
      ["naomi", 368, "Acme will ask for 400 seats. The honest offer is forty and a security call. Harper already agreed to that."],
      ["chris", 428, "Northstar is the proof point for Acme. If physicians ignore templates, Harper will smell it."],
      ["priya", 492, "Then Chris's shadow is not a side quest. It is on the Q4 map."],
      ["alex", 548, "Checkout p95 is green. If we steal Owen's sprint for a webinar, we will have this meeting again with worse numbers."],
      ["sam", 612, "I can demo metering on a whiteboard. I cannot demo it in production before the names match finance."],
      ["elena", 676, "I'll have hi-fis Friday. If first-run still apologizes, we failed in design, not in ads."],
      ["dana", 734, "Oct 8 webinar: live Harbor workspace, Acme mock, no slides. I will cancel if it is a deck."],
      ["jordan", 798, "Good. Dana, you get a working workspace or you get a cancellation, not a compromise."],
      ["naomi", 854, "Legal packet for Acme goes today. I need Priya on Tuesday's questionnaire, not a substitute."],
      ["priya", 912, "I'll be there. Boring on purpose."],
      ["alex", 968, "Reliability sprint is not optional. I will not donate it to billing even if the board slide looks hungrier."],
      ["jordan", 1024, "Board slide will look calm. Hungry slides get us fourteen hires we cannot pay for."],
      ["chris", 1088, "I'll put the Northstar hold on calendars before PDFs. Leah's admin filters vendors."],
      ["sam", 1146, "If Acme wants custom metering before the flag is stable, Naomi stalls. Custom is how the product forks."],
      ["naomi", 1204, "Stall is my job. I'll use Harper's own sentence: nobody reads the recording."],
      ["elena", 1262, "Invite step on the success screen, not a trap modal. Dana, I need your copy by Monday."],
      ["dana", 1318, "You'll have two lines that sound like a teammate. Not a billboard."],
      ["priya", 1374, "Activation is creating a highlight or action, not finishing a tour. That number goes on the one-pager."],
      ["jordan", 1432, "Put owners next to numbers. I do not want a theme cloud."],
      ["alex", 1488, "Linear tonight. Ghost tickets stop recruiting people if I delete them in public."],
      ["chris", 1544, "CS will not invent status-page language in the moment. Priya, we still need those three sentences."],
      ["priya", 1600, "You'll have them. They will be dull and accurate."],
      ["sam", 1658, "One more risk: if the war room becomes a weekly two-hour meeting, we will plan instead of ship."],
      ["jordan", 1712, "This format is monthly. Next time we look at the one-pager, not a new brainstorm."],
      ["elena", 1768, "I'll record a two-minute walkthrough of concept B so this group does not need another design meeting."],
      ["dana", 1824, "I'll steal stills from that walkthrough for the landing page. Dark and light."],
      ["naomi", 1880, "If Harper's pilot slips, I will not quietly inflate the forecast. I'll say slip."],
      ["jordan", 1936, "Say slip. Hope is not a line item. We already had that fight with finance."],
      ["alex", 1992, "I'll keep a spare engineer for pages, not features. That is the reliability sprint in one sentence."],
      ["priya", 2048, "One-pager Friday: bets, owners, dates, what we are not doing, and the eight of us as the distribution list."],
      ["chris", 2104, "Add Leah and Harper as readers, not editors. They do not get to rewrite Q4."],
      ["dana", 2160, "Headline stays 'meetings you can search'. We are not selling a bot that joins Zoom."],
      ["jordan", 2216, "That's the hour. Eight people, one map, no extra bets. Go."],
      ["priya", 2264, "Notes will carry the owners. If your name is on the one-pager, you already agreed in this room."],
    ]),
  },
  {
    id: "sales-pipeline-review",
    title: "Sales pipeline review",
    type: "internal",
    status: "processing",
    platform: "Zoom",
    startsAt: "2026-09-25T13:00:00.000Z",
    durationMin: 40,
    team: "Sales",
    participants: [people.naomi, people.jordan, people.chris],
    overview: "Harbor is still generating notes for this recording.",
    takeaways: [],
    decisions: [],
    followUps: [],
    topics: [],
    actionItems: [],
    highlights: [],
    transcript: [],
  },
  {
    id: "q4-all-hands",
    title: "Q4 all-hands",
    type: "internal",
    status: "upcoming",
    platform: "Google Meet",
    startsAt: "2026-09-26T17:00:00.000Z",
    durationMin: 60,
    team: "Company",
    participants: [people.jordan, people.priya, people.alex, people.dana, people.theo],
    overview: "Jordan will share Q3 bets, runway, and the onboarding experiment. No recording notes yet.",
    takeaways: [],
    decisions: [],
    followUps: [],
    topics: [],
    actionItems: [],
    highlights: [],
    transcript: [],
  },
];

export function getMeetings(): Meeting[] {
  return [...meetings].sort(
    (a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime(),
  );
}

export function getMeeting(id: string): Meeting | undefined {
  return meetings.find((m) => m.id === id);
}

export function getReadyMeetings(): Meeting[] {
  return getMeetings().filter((m) => m.status === "ready");
}

export function participantById(meeting: Meeting, id: string): Participant | undefined {
  return meeting.participants.find((p) => p.id === id);
}

export function allHighlights() {
  return getReadyMeetings().flatMap((meeting) =>
    meeting.highlights.map((highlight) => ({ meeting, highlight })),
  );
}

export function stats() {
  const all = getMeetings();
  const ready = all.filter((m) => m.status === "ready");
  const upcoming = all.filter((m) => m.status === "upcoming");
  const openActions = ready.reduce(
    (n, m) => n + m.actionItems.filter((a) => a.status === "open").length,
    0,
  );
  const hours = ready.reduce((n, m) => n + m.durationMin, 0) / 60;
  return {
    recorded: ready.length,
    upcoming: upcoming.length,
    openActions,
    hours: Math.round(hours * 10) / 10,
  };
}
