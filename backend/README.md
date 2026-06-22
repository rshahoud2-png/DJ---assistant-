# DJ Agent Python Analysis Backend

FastAPI service for real audio analysis using librosa. This backend is deployed separately from the Vercel frontend, for example on Fly.io.

## Endpoints

- `GET /health`
- `POST /analyze-track`
- `POST /generate-cues`
- `POST /analyze-transition`
- `POST /generate-set-analysis`

## Analysis Engine

`/analyze-track` loads the uploaded audio into a temporary file, analyzes it with librosa/scipy/numpy, and deletes the temp file after processing.

It estimates:

- duration
- BPM
- beat timestamps
- downbeat approximation
- 16/32-beat phrase boundaries
- RMS energy curve
- onset strength
- spectral flux / novelty curve
- intro start/end
- vocal or main-section start
- first drop/hook
- breakdown
- build-up
- peak energy section
- outro start/end
- best mix-in and mix-out cues
- stable loop region
- confidence scores and warnings

No GPU, paid AI, hosted model, or permanent audio storage is required.

## Local Backend Run

```bash
cd backend
python -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8080
```

Local backend development is optional. The web app does not require localhost in production.

## Fly.io Deployment

```bash
cd backend
cp fly.toml.example fly.toml
fly launch --no-deploy
fly secrets set SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=...
fly deploy
```

Set `ALLOWED_ORIGINS` to your Vercel domain.

## Security Notes

- Use environment variables for Supabase and deployment configuration.
- Do not hard-code Supabase keys.
- Uploaded audio is written to a temporary file, processed, and deleted after analysis.
- The backend does not permanently store uploaded music unless future code explicitly adds that behavior.

## Export Roadmap

V1:

- Analyze audio
- Generate cue points
- Generate transition notes
- Export CSV/JSON from the frontend app

V2:

- Export rekordbox XML cue metadata
- Export VirtualDJ database XML cue metadata
- Experimental Serato cue/crate metadata support

DJ Agent should never rewrite or permanently modify user audio files in v1.
