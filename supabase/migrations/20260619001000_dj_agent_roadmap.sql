alter table public.songs
  add column if not exists album text,
  add column if not exists rating int check (rating is null or rating between 1 and 5),
  add column if not exists comments text,
  add column if not exists source_software text,
  add column if not exists existing_playlist text,
  add column if not exists existing_crate text,
  add column if not exists external_url text,
  add column if not exists source_platform text,
  add column if not exists import_id uuid,
  add column if not exists intro_cue text,
  add column if not exists mix_in_cue text,
  add column if not exists mix_out_cue text,
  add column if not exists drop_cue text,
  add column if not exists loop_cue text;

create table if not exists public.playlist_imports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_name text,
  source_type text not null,
  source_software text,
  status text not null default 'reviewed',
  total_tracks int not null default 0,
  imported_tracks int not null default 0,
  warnings text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.imported_tracks (
  id uuid primary key default gen_random_uuid(),
  import_id uuid not null references public.playlist_imports(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  song_id uuid references public.songs(id) on delete set null,
  row_index int not null,
  raw_data jsonb not null default '{}',
  normalized_data jsonb not null default '{}',
  confidence text not null default 'low',
  confidence_score int not null default 0,
  warnings text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  gig_id uuid references public.gigs(id) on delete set null,
  name text not null,
  event_type text not null,
  event_duration int not null,
  crowd_age_range text,
  music_preferences text[] not null default '{}',
  energy_preference text not null default 'balanced',
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.playlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  source_software text,
  source_type text,
  external_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.playlist_songs (
  id uuid primary key default gen_random_uuid(),
  playlist_id uuid not null references public.playlists(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  song_id uuid not null references public.songs(id) on delete cascade,
  position int not null default 0,
  created_at timestamptz not null default now(),
  unique (playlist_id, song_id)
);

create table if not exists public.transitions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  setlist_id uuid references public.setlists(id) on delete cascade,
  current_song_id uuid references public.songs(id) on delete set null,
  next_song_id uuid references public.songs(id) on delete set null,
  position int not null,
  bpm_difference numeric,
  key_compatibility text,
  energy_difference int,
  transition_type text not null,
  transition_bars int not null default 16,
  transition_instruction text not null,
  dj_notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.event_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  event_type text not null,
  energy_curve text not null,
  sections jsonb not null default '[]',
  recommended_transition_types text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.dj_software_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  software text not null,
  import_capabilities text[] not null default '{}',
  export_capabilities text[] not null default '{}',
  settings jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, software)
);

create table if not exists public.set_exports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  setlist_id uuid not null references public.setlists(id) on delete cascade,
  format text not null check (format in ('csv', 'json')),
  payload jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.setlist_tracks
  add column if not exists section text,
  add column if not exists intro_cue text,
  add column if not exists mix_in_cue text,
  add column if not exists mix_out_cue text,
  add column if not exists drop_cue text,
  add column if not exists loop_cue text,
  add column if not exists transition_type text,
  add column if not exists transition_bars int,
  add column if not exists transition_instruction text,
  add column if not exists performance_instructions text;

create index if not exists playlist_imports_user_id_idx on public.playlist_imports(user_id);
create index if not exists imported_tracks_user_id_idx on public.imported_tracks(user_id);
create index if not exists events_user_id_idx on public.events(user_id);
create index if not exists transitions_setlist_id_idx on public.transitions(setlist_id);

alter table public.playlist_imports enable row level security;
alter table public.imported_tracks enable row level security;
alter table public.events enable row level security;
alter table public.playlists enable row level security;
alter table public.playlist_songs enable row level security;
alter table public.transitions enable row level security;
alter table public.event_templates enable row level security;
alter table public.dj_software_profiles enable row level security;
alter table public.set_exports enable row level security;

create policy "playlist imports own select" on public.playlist_imports for select to authenticated using (user_id = auth.uid());
create policy "playlist imports own insert" on public.playlist_imports for insert to authenticated with check (user_id = auth.uid());
create policy "playlist imports own update" on public.playlist_imports for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "playlist imports own delete" on public.playlist_imports for delete to authenticated using (user_id = auth.uid());

create policy "imported tracks own select" on public.imported_tracks for select to authenticated using (user_id = auth.uid());
create policy "imported tracks own insert" on public.imported_tracks for insert to authenticated with check (user_id = auth.uid());
create policy "imported tracks own update" on public.imported_tracks for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "imported tracks own delete" on public.imported_tracks for delete to authenticated using (user_id = auth.uid());

create policy "events own select" on public.events for select to authenticated using (user_id = auth.uid());
create policy "events own insert" on public.events for insert to authenticated with check (user_id = auth.uid());
create policy "events own update" on public.events for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "events own delete" on public.events for delete to authenticated using (user_id = auth.uid());

create policy "playlists own select" on public.playlists for select to authenticated using (user_id = auth.uid());
create policy "playlists own insert" on public.playlists for insert to authenticated with check (user_id = auth.uid());
create policy "playlists own update" on public.playlists for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "playlists own delete" on public.playlists for delete to authenticated using (user_id = auth.uid());

create policy "playlist songs own select" on public.playlist_songs for select to authenticated using (user_id = auth.uid());
create policy "playlist songs own insert" on public.playlist_songs for insert to authenticated with check (user_id = auth.uid());
create policy "playlist songs own update" on public.playlist_songs for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "playlist songs own delete" on public.playlist_songs for delete to authenticated using (user_id = auth.uid());

create policy "transitions own select" on public.transitions for select to authenticated using (user_id = auth.uid());
create policy "transitions own insert" on public.transitions for insert to authenticated with check (user_id = auth.uid());
create policy "transitions own update" on public.transitions for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "transitions own delete" on public.transitions for delete to authenticated using (user_id = auth.uid());

create policy "event templates authenticated select" on public.event_templates for select to authenticated using (true);

create policy "dj software profiles own select" on public.dj_software_profiles for select to authenticated using (user_id = auth.uid());
create policy "dj software profiles own insert" on public.dj_software_profiles for insert to authenticated with check (user_id = auth.uid());
create policy "dj software profiles own update" on public.dj_software_profiles for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "dj software profiles own delete" on public.dj_software_profiles for delete to authenticated using (user_id = auth.uid());

create policy "set exports own select" on public.set_exports for select to authenticated using (user_id = auth.uid());
create policy "set exports own insert" on public.set_exports for insert to authenticated with check (user_id = auth.uid());
create policy "set exports own delete" on public.set_exports for delete to authenticated using (user_id = auth.uid());

grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
