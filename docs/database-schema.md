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

## Product Roadmap Tables

- `events`: future event abstraction for the DJ Agent product model
- `event_templates`: reusable event flow templates
- `set_exports`: CSV/JSON export history

All user-owned tables use `user_id = auth.uid()` policies.
