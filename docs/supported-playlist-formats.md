# Supported Library Import Formats

DJ Agent imports metadata only. It does not download audio, play music, or act as DJ software.

## Current MVP Import

- Serato text/crate-style exports
- rekordbox XML exports
- VirtualDJ database/export XML
- CSV
- TXT/manual paste
- M3U/M3U8
- PLS
- XSPF
- JSON

## Metadata Extracted

- Track title
- Artist
- Album
- BPM
- Key and Camelot key when present
- Genre
- Duration
- Rating/comments when present
- Source software
- Existing playlist/crate names when present
- Local file path or external URL as metadata

Rows receive confidence labels before import:

- High: title, artist, BPM, and key present
- Medium: title and artist present
- Low: filename/path-only or sparse metadata
