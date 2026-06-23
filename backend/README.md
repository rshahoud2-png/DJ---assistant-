# DJ Agent Python Analysis Backend

FastAPI service for real audio analysis using librosa. This backend is deployed separately from the Vercel frontend, for example on Fly.io.

## Endpoints

- `GET /health`
- `POST /analyze-track`
- `POST /generate-cues`
- `POST /analyze-transition`
- `POST /generate-set-analysis`

## Analysis Engine

`/analyze-track` loads the uploaded audio into a temporary file, analyzes it with librosa/scipy/numpy, and deletes the temp file after processing, including failure paths.

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

## Audio Decoding System Packages

The Docker image installs runtime packages needed by librosa, soundfile, scipy, and ffmpeg-backed decoding:

- `ffmpeg`
- `libsndfile1`
- `build-essential`
- `libgomp1`
- `pkg-config`
- `ca-certificates`

This is required for common DJ upload formats such as MP3, WAV, M4A, AIFF, FLAC, AAC, and OGG.

## Local Backend Run

```bash
cd backend
python -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8080
```

Local backend development is optional. The web app does not require localhost in production.

## Fly.io Deployment

```bash
cd backend
cp fly.toml.example fly.toml
fly launch --no-deploy
fly secrets set SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=...
fly secrets set ALLOWED_ORIGINS=https://your-vercel-app.vercel.app,https://*.vercel.app
fly deploy
```

The Docker command starts Uvicorn on `0.0.0.0` and honors `${PORT:-8080}`. The Fly service uses `internal_port = 8080`.

For the current production backend URL, verify:

```bash
curl https://djassistant.fly.dev/health
curl -I https://djassistant.fly.dev/docs
curl -X POST https://djassistant.fly.dev/analyze-track -F "file=@/path/to/test.wav"
```

`/analyze-track` accepts MP3, WAV, M4A, AIFF, FLAC, AAC, OGG, and returns JSON errors for unsupported files, empty uploads, oversized uploads, and decode failures when the app process is still alive.

## CORS

Set `ALLOWED_ORIGINS` to your Vercel production URL. You can also include `https://*.vercel.app` for preview deployments.

Examples:

```bash
fly secrets set ALLOWED_ORIGINS=https://your-project.vercel.app,https://*.vercel.app
```

If you intentionally want open CORS for debugging, set:

```bash
fly secrets set ALLOWED_ORIGINS=*
```

Open CORS disables credentials in the FastAPI CORS middleware.

## Security Notes

- Use environment variables for Supabase and deployment configuration.
- Do not hard-code Supabase keys.
- Uploaded audio is written to a temporary file, processed, and deleted after analysis.
- The backend does not permanently store uploaded music unless future code explicitly adds that behavior.
- `MAX_UPLOAD_MB` defaults to `80` to reduce memory/disk pressure on small Fly machines.

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
