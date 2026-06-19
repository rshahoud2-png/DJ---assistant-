# AI DJ Assistant

A free, rule-based DJ setlist assistant built with Next.js App Router, TypeScript, Tailwind CSS, Supabase Auth, Supabase Postgres, Supabase Storage, Vercel, and GitHub.

This MVP does not use paid AI APIs, hosted AI models, stem separation, or mashup rendering. Manual metadata entry is required.

## Features

- Supabase email/password auth
- Music library with manual BPM, key, energy, mood, language, culture, and best-use metadata
- Private song file uploads to Supabase Storage bucket `song-files`
- Gig questionnaire for event requirements
- Rule-based setlist generator with scores, reasons, BPM notes, key notes, warnings, suggestions, and special-moment DJ notes
- Saved setlists and crates/playlists
- Owner-only RLS policies for user data

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create a Supabase project on the free tier.

3. Copy environment variables:

```bash
cp .env.example .env.local
```

Fill in:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Do not commit real keys.

4. Apply the SQL migration in `supabase/migrations/20260619000000_initial_schema.sql` using Supabase SQL editor or the Supabase CLI.

5. Run locally:

```bash
npm run dev
```

## Supabase Storage

The migration creates a private bucket named `song-files` and RLS policies on `storage.objects`.

Important rules:

- Do not make copyrighted song files public.
- Store files under user-owned paths.
- Use Supabase signed URLs for playback when adding a player.
- The current MVP uploads files privately and stores `file_path` on the song row.

## Vercel Deployment

1. Push this repo to GitHub.
2. Import the GitHub repo into Vercel.
3. Add the same environment variables in Vercel Project Settings.
4. Deploy.

The app is designed for the Vercel free tier and Supabase free tier. Keep song uploads within free-tier storage limits.

## Recommendation Engine

The rule engine lives in `src/lib/recommendation`.

It scores each song by matching requested styles, culture/language preferences, mood, desired vibe, event type, explicit-content rules, energy curve fit, BPM transition smoothness, Camelot key compatibility, must-play songs, do-not-play exclusions, artist repeat penalties, and best-use tags for special moments.

Hard filters always run before scoring:

- explicit songs are excluded if explicit content is not allowed
- do-not-play songs are excluded
- must-play songs are included when found in the library

See `docs/recommendation-engine.md` for more detail.

## Future Work

Automatic BPM/key detection is intentionally future work. See `docs/future-audio-analysis.md` for free/local options such as Mixxx-style analysis, Essentia, librosa, and a local Python worker.
