# Integration Roadmap

DJ Agent is designed to become the AI layer above Serato DJ, rekordbox, and VirtualDJ.

## MVP

Import:

- Serato text/crate-style exports
- rekordbox XML exports
- VirtualDJ XML exports
- CSV

Export:

- CSV
- JSON

The MVP export preserves song order, event metadata, cue notes, transition notes, performance instructions, section labels, confidence, and warnings.

## Export Roadmap

V1:

- CSV export for spreadsheets, client review, and manual DJ software prep
- JSON export for future integrations and backups
- Performance-plan export with sections, cues, transitions, and DJ notes

V2:

- rekordbox XML playlist export with compatible cue metadata where supported
- VirtualDJ database/export XML mapping for cue and comment fields
- Serato-friendly crate or text export where the public format allows safe generation

V3:

- Optional desktop agent for local DJ-library sync
- Direct synchronization with supported DJ software exports
- Plugin-style integrations if vendor APIs become available

## Safety Rules

- DJ Agent does not modify original audio files.
- DJ Agent does not download copyrighted audio from streaming services.
- Cue and transition exports are metadata-first and should be reviewed in the DJ's software before performance.

## Future

- Serato crate generation
- rekordbox playlist generation
- VirtualDJ playlist generation
- Plugin integrations
- Direct synchronization
- Optional desktop agent support for local DJ-library sync

The current schema includes `source_software`, `existing_playlist`, `existing_crate`, `playlists`, `playlist_songs`, `dj_software_profiles`, `track_analyses`, `cue_points`, `transition_analyses`, and `setlist_analysis` so these features can be added without replacing the core data model.
