# DJ Agent Python Analysis Backend

FastAPI service for real audio analysis using librosa. This backend is deployed separately from the Vercel frontend, for example on Fly.io.

## Endpoints

- `GET /health`
- `POST /analyze-track`
- `POST /generate-cues`
- `POST /analyze-transition`
- `POST /generate-set-analysis`

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
