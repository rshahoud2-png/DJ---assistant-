# DJ Agent

DJ Agent is an AI-powered DJ preparation assistant for professional DJs, wedding DJs, club DJs, mobile DJs, bars, restaurants, lounges, and nightclubs.

This is not a music player, DJ software, or a basic playlist creator. DJ Agent analyzes a DJ's existing library metadata and generates a complete event-ready performance roadmap with song order, cue recommendations, transition instructions, energy management, and DJ notes.

The MVP uses rule-based intelligence only. No paid AI APIs or hosted AI models are required.

## Stack

- React and TypeScript
- Next.js App Router for the existing GitHub/Vercel architecture
- Tailwind CSS
- shadcn/ui-compatible component structure
- Supabase Auth, Postgres, and Storage
- Vercel deployment from GitHub

The existing project is intentionally continued rather than rebuilt from scratch.

## Core Features

- Universal library importer for Serato exports, rekordbox XML, VirtualDJ XML, CSV, TXT, M3U/M3U8, PLS, XSPF, JSON, and manual paste lists
- Import review table with editable rows, confidence badges, and missing metadata warnings
- Music library with imported and manual BPM, key, energy, mood, language, culture, and best-use metadata
- Event questionnaire for event type, duration, crowd demographics, music preferences, and energy preference
- Rule-based set builder engine with warmup, build-up, peak-time, cooldown, and closing sections
- Transition engine with blend, echo out, loop transition, fade, cut, and drop swap recommendations
- Cue point engine with estimated intro, mix-in, mix-out, drop, loop, and transition length
- Live-readable Generated Set performance view
- CSV and JSON export preserving song order, cue notes, transition notes, and event information
- DJ Software Integrations page for Serato DJ, rekordbox, and VirtualDJ
- Owner-only RLS policies for user data

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Fill in:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Do not commit real keys.

## Supabase

Apply migrations in order:

- `supabase/migrations/20260619000000_initial_schema.sql`
- `supabase/migrations/20260619001000_dj_agent_roadmap.sql`

The migrations create owner-only tables and a private `song-files` bucket. Run the second migration manually in Supabase before using roadmap/export features in production.

## Deployment

Deploy directly from GitHub to Vercel. Add the same environment variables in Vercel Project Settings.

No SQLite, Docker, local database, local file storage, Electron app, Python service, or localhost dependency is required for production.

## Recommendation Engine

The rule engine lives in `src/lib/recommendation`.

It scores songs by BPM compatibility, key compatibility, genre compatibility, energy progression, event type, crowd demographics, requested styles, blocked styles, culture/language preferences, explicit-content rules, must-play songs, do-not-play exclusions, artist repeat penalties, and best-use tags.

It produces a performance roadmap, not just a playlist:

- Section
- Cue notes
- Transition type
- Transition bars
- Transition instruction
- Performance instructions

## Documentation

- `docs/supabase-setup.md`
- `docs/vercel-deployment.md`
- `docs/environment-variables.md`
- `docs/database-schema.md`
- `docs/integration-roadmap.md`
- `docs/supported-playlist-formats.md`
- `docs/recommendation-engine.md`
- `docs/future-audio-analysis.md`
