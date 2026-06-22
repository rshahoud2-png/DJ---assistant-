# Vercel Deployment

DJ Agent deploys directly from GitHub to Vercel.

1. Import the GitHub repository into Vercel.
2. Set the framework preset to Next.js.
3. Add environment variables from `.env.example`.
4. Deploy from the `main` branch.

No Docker, SQLite, local file storage, Electron app, Python service, or localhost dependency is required.

Vercel runs the web application and server routes. Supabase stores auth, database rows, and private uploaded files.
