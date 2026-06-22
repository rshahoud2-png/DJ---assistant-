# Audio Analysis Backend

DJ Agent uses a separate Python FastAPI backend as the music-analysis brain. The frontend remains deployable on Vercel and calls the backend using `NEXT_PUBLIC_PYTHON_API_URL` or future Vite clients using `VITE_PYTHON_API_URL`.

## Endpoints

### `GET /health`

Returns service status and analysis engine version.

### `POST /analyze-track`

Accepts an uploaded audio file and returns real audio analysis:

- estimated BPM
- duration
- beat timestamps
- downbeat approximation
- phrase boundaries
- RMS energy curve
- onset strength
- spectral flux / novelty curve
- intro start/end
- vocal/start-of-main-section estimate
- first drop/hook
- breakdown
- build-up
- peak energy section
- outro start/end
- best mix-in and mix-out cues
- loop region
- confidence scores and warnings

### `POST /generate-cues`

Accepts one track analysis and returns:

- Hot Cue A: Intro Start
- Hot Cue B: Mix In / Vocal Start
- Hot Cue C: Drop / Hook
- Hot Cue D: Mix Out / Outro
- Loop suggestion
- suggested transition length in bars
- DJ notes
- warnings

### `POST /analyze-transition`

Compares two analyzed tracks using BPM, energy, phrase structure, and cue confidence. Returns transition type, score, phrase notes, mix-in/mix-out cues, warnings, and a performance instruction.

### `POST /generate-set-analysis`

Builds an event timeline and ordered setlist using analyzed structure data, not just metadata. Returns ordered tracks, event sections, cue notes, transition notes, warnings, and confidence.

## Storage

Supabase migration `20260622001000_audio_analysis_storage.sql` adds:

- `track_analyses`
- `cue_points`
- `transition_analyses`
- `setlist_analysis`

All tables use authenticated user RLS.

## Known Limitations

- Cue detection is heuristic and must expose confidence.
- No stem separation is included.
- No GPU or paid AI is required.
- v1 does not rewrite audio files or inject cue metadata into DJ software libraries.

## Future AI Integration Plan

The backend can later add optional AI explanation providers, but the core analysis should remain deterministic and usable without paid AI.
