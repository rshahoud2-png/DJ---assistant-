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

## Future

- Serato crate generation
- rekordbox playlist generation
- VirtualDJ playlist generation
- Plugin integrations
- Direct synchronization
- Optional desktop agent support for local DJ-library sync

The current schema includes `source_software`, `existing_playlist`, `existing_crate`, `playlists`, `playlist_songs`, and `dj_software_profiles` so these features can be added without replacing the core data model.
