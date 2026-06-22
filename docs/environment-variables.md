# Environment Variables

## Frontend on Vercel

Required variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Optional when the Python audio-analysis backend is deployed:

- `NEXT_PUBLIC_PYTHON_API_URL`: public Fly.io backend URL used by the existing Next.js app
- `VITE_PYTHON_API_URL`: future-compatible Vite client variable; included for architecture portability

## Python Backend on Fly.io

Recommended variables/secrets:

- `SUPABASE_URL`: Supabase project URL for backend-only integrations
- `SUPABASE_SERVICE_ROLE_KEY`: service role key for trusted backend-only operations
- `ALLOWED_ORIGINS`: comma-separated list of allowed frontend origins, such as your Vercel production URL and preview URL pattern

## Rules

- Do not commit real keys.
- Only `NEXT_PUBLIC_*` and `VITE_*` values are exposed to browser clients.
- Never use the service role key in client components.
- Add frontend variables in Vercel Project Settings.
- Add backend secrets with `fly secrets set`.
