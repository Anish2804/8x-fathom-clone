# Harbor — Fathom-style AI meeting notes

A polished meeting-notetaker clone for the 8x assignment. It covers the product surface of [Fathom](https://fathom.video): a dashboard, searchable meetings, a detail page with transcript + AI summary + action items + highlights, and global search.

**Recording / bot capture is mocked.** There is no Zoom, Google Meet, or Teams bot. Playback is a simulated timeline so you can demo transcript sync, highlights, and search without recording infrastructure.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Seeded in-memory data (`src/data/meetings.ts`) — 12 meetings
- Client-only extras: theme, user highlights, action-item toggles (localStorage)

## Local setup

Requires Node.js 20+.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build
npm start
```

## What to click

1. Home — counts, upcoming, recent meetings  
2. Meetings — search + type/status filters  
3. A recorded meeting (e.g. **Q3 product planning offsite**) — player, transcript search, summary, topics, actions, highlights  
4. Search — try `activation`, `Harper`, or `Salesforce`  
5. Highlights — seeded moments; add more from a transcript line  

Processing and upcoming meetings show explicit empty/processing states.

## Mocked recording (assignment constraint)

Allowed by the brief: do not spend time on meeting-join bots.

- Playback is a waveform + timer, not an audio/video file  
- Transcripts, summaries, and action items are authored from seed data  
- The sidebar and meeting player say this out loud so evaluators are not misled  

## Capture logs

Keep `.agent-logs/` and `CAPTURE-TEST.md`. Do not ignore or tidy agent logs. Hook config lives in `.cursor/hooks.json`.

## Fastest public HTTPS deploy (Vercel)

This is a standard Next.js app. Vercel is the shortest path to a public HTTPS URL.

1. Push this repo to GitHub (public).  
2. Go to [https://vercel.com/new](https://vercel.com/new) and import the repository.  
3. Framework preset: **Next.js**. Build command `npm run build`, output default. No env vars required.  
4. Click **Deploy**. Vercel gives `https://<project>.vercel.app`.  
5. Optional: add a custom domain in Project → Settings → Domains.

CLI alternative (after `npm i -g vercel`):

```bash
npx vercel login
npx vercel
npx vercel --prod
```

No Kubernetes, databases, or extra services.

## Project layout

```
src/app/                pages (home, meetings, search, highlights)
src/components/         shell, player, transcript, summary
src/data/meetings.ts    seed workspace
src/lib/                search, formatting, localStorage
.agent-logs/            assignment capture (do not edit)
```
