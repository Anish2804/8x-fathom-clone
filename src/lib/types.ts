export type MeetingStatus = "upcoming" | "processing" | "ready";
export type MeetingType =
  | "internal"
  | "customer"
  | "interview"
  | "standup"
  | "planning"
  | "retro";
export type Platform = "Zoom" | "Google Meet" | "Microsoft Teams";
export type ActionStatus = "open" | "done";

export type Participant = {
  id: string;
  name: string;
  email: string;
  role: string;
  hue: number;
};

export type TranscriptLine = {
  id: string;
  speakerId: string;
  startMs: number;
  endMs: number;
  text: string;
};

export type ActionItem = {
  id: string;
  text: string;
  assigneeId: string;
  status: ActionStatus;
  due?: string;
};

export type Highlight = {
  id: string;
  startMs: number;
  title: string;
  description: string;
  lineId?: string;
};

export type Topic = {
  name: string;
  weight: number;
};

export type Meeting = {
  id: string;
  title: string;
  type: MeetingType;
  status: MeetingStatus;
  platform: Platform;
  startsAt: string;
  durationMin: number;
  team: string;
  participants: Participant[];
  overview: string;
  takeaways: string[];
  decisions: string[];
  followUps: string[];
  topics: Topic[];
  actionItems: ActionItem[];
  highlights: Highlight[];
  transcript: TranscriptLine[];
};

export type SearchHitKind = "meeting" | "transcript" | "summary" | "participant";

export type SearchHit = {
  id: string;
  kind: SearchHitKind;
  meetingId: string;
  meetingTitle: string;
  title: string;
  snippet: string;
  href: string;
};
