create table if not exists public.track_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  song_id uuid references public.songs(id) on delete cascade,
  duration numeric,
  bpm numeric,
  beat_timestamps jsonb not null default '[]',
  energy_curve jsonb not null default '[]',
  structure jsonb not null default '{}',
  confidence numeric,
  created_at timestamptz not null default now()
);

create table if not exists public.cue_points (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.track_analyses(id) on delete cascade,
  song_id uuid references public.songs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  cue_type text not null,
  cue_name text not null,
  timestamp_seconds numeric not null,
  confidence numeric,
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.transition_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  current_song_id uuid references public.songs(id) on delete set null,
  next_song_id uuid references public.songs(id) on delete set null,
  compatibility_score int,
  transition_type text,
  transition_bars int,
  instruction text,
  warnings jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create table if not exists public.setlist_analysis (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_id uuid references public.events(id) on delete set null,
  setlist_id uuid references public.setlists(id) on delete cascade,
  analysis jsonb not null default '{}',
  confidence numeric,
  warnings jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create index if not exists track_analyses_user_id_idx on public.track_analyses(user_id);
create index if not exists track_analyses_song_id_idx on public.track_analyses(song_id);
create index if not exists cue_points_analysis_id_idx on public.cue_points(analysis_id);
create index if not exists cue_points_user_id_idx on public.cue_points(user_id);
create index if not exists transition_analyses_user_id_idx on public.transition_analyses(user_id);
create index if not exists setlist_analysis_user_id_idx on public.setlist_analysis(user_id);

alter table public.track_analyses enable row level security;
alter table public.cue_points enable row level security;
alter table public.transition_analyses enable row level security;
alter table public.setlist_analysis enable row level security;

create policy "track analyses own select" on public.track_analyses for select to authenticated using (user_id = auth.uid());
create policy "track analyses own insert" on public.track_analyses for insert to authenticated with check (user_id = auth.uid());
create policy "track analyses own update" on public.track_analyses for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "track analyses own delete" on public.track_analyses for delete to authenticated using (user_id = auth.uid());

create policy "cue points own select" on public.cue_points for select to authenticated using (user_id = auth.uid());
create policy "cue points own insert" on public.cue_points for insert to authenticated with check (user_id = auth.uid());
create policy "cue points own update" on public.cue_points for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "cue points own delete" on public.cue_points for delete to authenticated using (user_id = auth.uid());

create policy "transition analyses own select" on public.transition_analyses for select to authenticated using (user_id = auth.uid());
create policy "transition analyses own insert" on public.transition_analyses for insert to authenticated with check (user_id = auth.uid());
create policy "transition analyses own update" on public.transition_analyses for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "transition analyses own delete" on public.transition_analyses for delete to authenticated using (user_id = auth.uid());

create policy "setlist analysis own select" on public.setlist_analysis for select to authenticated using (user_id = auth.uid());
create policy "setlist analysis own insert" on public.setlist_analysis for insert to authenticated with check (user_id = auth.uid());
create policy "setlist analysis own update" on public.setlist_analysis for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "setlist analysis own delete" on public.setlist_analysis for delete to authenticated using (user_id = auth.uid());

grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
