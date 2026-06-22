# Environment Variables

Required variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Rules:

- Do not commit real keys.
- Only `NEXT_PUBLIC_*` values are exposed to the browser.
- Never use the service role key in client components.
- Add the same variables in Vercel Project Settings for production deployments.
