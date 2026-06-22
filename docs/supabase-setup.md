# Supabase Setup

1. Create a Supabase project.
2. Enable email/password authentication.
3. Run migrations in order:
   - `supabase/migrations/20260619000000_initial_schema.sql`
   - `supabase/migrations/20260619001000_dj_agent_roadmap.sql`
4. Confirm private storage bucket `song-files` exists.
5. Keep RLS enabled on all public tables.

The second migration adds DJ Agent roadmap tables, event templates, import history, transition records, cue fields, DJ software profiles, and export history.

Manual action required: run the SQL migration in Supabase SQL Editor or through the Supabase CLI before using the new roadmap/export features in production.
