# DJ Agent

DJ Agent is an AI-powered DJ preparation assistant for professional DJs, wedding DJs, club DJs, mobile DJs, bars, restaurants, lounges, and nightclubs.

This is not a music player, DJ software, or a basic playlist creator. DJ Agent analyzes a DJ's existing library metadata and generated audio analysis to create a complete event-ready performance roadmap with song order, cue recommendations, transition instructions, energy management, and DJ notes.

The MVP uses rule-based intelligence by default. A separate Python FastAPI backend can perform real audio analysis with librosa when deployed. No paid AI APIs or hosted models are required.

## Stack

- React and TypeScript
- Next.js App Router for the existing GitHub/Vercel architecture
- Tailwind CSS
- shadcn/ui-compatible component structure
- Supabase Auth, Postgres, and Storage
- Vercel deployment from GitHub
- Optional Python FastAPI analysis backend on Fly.io

The existing project is intentionally continued rather than rebuilt from scratch.

## Core Features

- Universal library importer for Serato exports, rekordbox XML, VirtualDJ XML, CSV, TXT, M3U/M3U8, PLS, XSPF, JSON, and manual paste lists
- Import review table with editable rows, confidence badges, and missing metadata warnings
- Music library with imported and manual BPM, key, energy, mood, language, culture, and best-use metadata
- Event questionnaire for event type, duration, crowd demographics, music preferences, and energy preference
- Rule-based set builder engine with warmup, build-up, peak-time, cooldown, and closing sections
- Transition engine with blend, echo out, loop transition, fade, cut, drop swap, and slam mix recommendations
- Cue point engine with estimated intro, mix-in, mix-out, drop, loop, transition length, and DJ notes
- Audio Analysis dashboard at `/analysis` for real track upload, structure analysis, cue generation, and transition analysis
- Live-readable Generated Set performance view
- CSV and JSON export preserving song order, cue notes, transition notes, and event information
- DJ Software Integrations page for Serato DJ, rekordbox, and VirtualDJ
- Python audio analysis backend for BPM, beats, phrase boundaries, RMS energy, onset strength, spectral flux, novelty curves, cue estimates, transitions, and set analysis
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
- `NEXT_PUBLIC_PYTHON_API_URL`

`VITE_PYTHON_API_URL` is also included for Vite-compatible future clients, but this repo currently uses Next.js.

Do not commit real keys.

## Supabase

Apply migrations in order:

- `supabase/migrations/20260619000000_initial_schema.sql`
- `supabase/migrations/20260619001000_dj_agent_roadmap.sql`
- `supabase/migrations/20260622001000_audio_analysis_storage.sql`

The migrations create owner-only tables and private storage buckets. Run the migrations manually in Supabase before using roadmap/export/audio-analysis persistence features in production.

## Python Analysis Backend

The backend lives in `backend/` and exposes:

- `GET /health`
- `POST /analyze-track`
- `POST /generate-cues`
- `POST /analyze-transition`
- `POST /generate-set-analysis`

It uses librosa to load uploaded audio, estimate tempo, detect beats, approximate downbeats and phrases, compute RMS energy, onset strength, spectral flux, and novelty curves, then estimate intro, vocal/start-main, drop/hook, breakdown, build-up, peak, outro, best mix-in, best mix-out, and loop regions. Uploads are processed through temporary files and deleted after analysis.

### Fly.io Deployment

```bash
cd backend
cp fly.toml.example fly.toml
fly launch --no-deploy
fly secrets set SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=...
fly deploy
```

Set `ALLOWED_ORIGINS` to your Vercel domain and set `NEXT_PUBLIC_PYTHON_API_URL` in Vercel to the Fly.io backend URL.

## Deployment

Deploy the frontend directly from GitHub to Vercel. Add the same environment variables in Vercel Project Settings.

No SQLite, local database, local file storage, Electron app, or localhost dependency is required for production. The Python backend is deployed separately to Fly.io.

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

## Known Limitations

- Audio analysis is heuristic and designed for DJ preparation guidance, not perfect waveform editing.
- The backend does not perform stem separation, vocal isolation, or copyrighted-audio downloading.
- Key detection remains metadata-driven unless a future local/free analyzer is added.
- Long or very large audio files can exceed browser, Vercel, or Fly.io plan limits depending on deployment settings.

## Future AI Integration Plan

The app keeps the deterministic analysis and recommendation layers separate from future AI providers. Later, Groq, OpenAI, Anthropic, or another provider can be added as an optional explanation layer without replacing the free rule-based engine or making paid AI required.

## Documentation

- `backend/README.md`
- `docs/audio-analysis-backend.md`
- `docs/supabase-setup.md`
- `docs/vercel-deployment.md`
- `docs/environment-variables.md`
- `docs/database-schema.md`
- `docs/integration-roadmap.md`
- `docs/supported-playlist-formats.md`
- `docs/recommendation-engine.md`
- `docs/future-audio-analysis.md`
