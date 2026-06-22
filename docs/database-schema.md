# Database Schema

DJ Agent uses Supabase Postgres with RLS.

## Core Tables

- `profiles`: app profile for each Supabase auth user
- `songs`: library metadata, BPM/key/genre/energy, source software, and cue estimates
- `gigs`: existing event container used by the app
- `gig_requirements`: event questionnaire data
- `setlists`: generated performance roadmap headers
- `setlist_tracks`: ordered roadmap tracks with score, section, cues, transition, and performance instructions
- `transitions`: normalized transition records between adjacent songs

## Import and DJ Software Tables

- `playlist_imports`: import batch metadata
- `imported_tracks`: raw and normalized imported rows
- `playlists`: future-ready imported playlists/crates
- `playlist_songs`: songs inside imported playlists/crates
- `dj_software_profiles`: user-level Serato, rekordbox, and VirtualDJ configuration

## Audio Analysis Tables

- `track_analyses`: per-user analysis payloads for real uploaded audio, including BPM, duration, beats, downbeats, phrase boundaries, energy curve, onset strength, spectral flux, novelty curve, structure estimates, confidence scores, warnings, and backend version
- `cue_points`: generated cue markers tied to a track analysis or song, including intro, vocal/build, drop/hook, mix-out, and loop-style cue data
- `transition_analyses`: structure-aware transition compatibility records between two analyzed tracks, including transition type, bars, BPM difference, energy direction, phrase notes, performance instructions, warnings, and confidence
- `setlist_analysis`: generated event-level analysis payloads with ordered setlists, event sections, cue notes, transition notes, warnings, and confidence score

These tables are created by `supabase/migrations/20260622001000_audio_analysis_storage.sql` and use owner-only RLS policies.

## Product Roadmap Tables

- `events`: future event abstraction for the DJ Agent product model
- `event_templates`: reusable event flow templates
- `set_exports`: CSV/JSON export history

All user-owned tables use `user_id = auth.uid()` policies.
