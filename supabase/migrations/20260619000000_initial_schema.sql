create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  dj_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.songs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  artist text not null,
  genre text,
  subgenre text,
  bpm numeric check (bpm is null or bpm > 0),
  musical_key text,
  camelot_key text,
  energy_level int check (energy_level is null or energy_level between 1 and 10),
  mood text,
  language text,
  culture_tags text[] not null default '{}',
  explicit boolean not null default false,
  best_use text[] not null default '{}',
  file_path text,
  duration int,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.gigs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  event_date date,
  venue text,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.gig_requirements (
  id uuid primary key default gen_random_uuid(),
  gig_id uuid not null unique references public.gigs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  crowd_age_range text,
  requested_styles text[] not null default '{}',
  styles_to_avoid text[] not null default '{}',
  culture_language_preferences text[] not null default '{}',
  event_duration int,
  dj_set_duration int,
  desired_vibe text,
  explicit_content_allowed boolean not null default false,
  must_play_songs text[] not null default '{}',
  do_not_play_songs text[] not null default '{}',
  special_moments jsonb not null default '[]',
  energy_curve text not null default 'slow_build',
  customer_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.setlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  gig_id uuid references public.gigs(id) on delete set null,
  name text not null,
  energy_curve_explanation text,
  warnings text[] not null default '{}',
  suggestions text[] not null default '{}',
  dj_notes text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.setlist_tracks (
  id uuid primary key default gen_random_uuid(),
  setlist_id uuid not null references public.setlists(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  song_id uuid references public.songs(id) on delete set null,
  position int not null,
  score int not null,
  selected_reason text not null,
  bpm_transition_note text,
  key_compatibility_note text,
  moment text,
  created_at timestamptz not null default now(),
  unique (setlist_id, position)
);

create table public.crates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.crate_tracks (
  id uuid primary key default gen_random_uuid(),
  crate_id uuid not null references public.crates(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  song_id uuid not null references public.songs(id) on delete cascade,
  position int not null default 0,
  created_at timestamptz not null default now(),
  unique (crate_id, song_id)
);

create index songs_user_id_idx on public.songs(user_id);
create index gigs_user_id_idx on public.gigs(user_id);
create index setlists_user_id_idx on public.setlists(user_id);
create index crates_user_id_idx on public.crates(user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger songs_updated_at before update on public.songs for each row execute function public.set_updated_at();
create trigger gigs_updated_at before update on public.gigs for each row execute function public.set_updated_at();
create trigger gig_requirements_updated_at before update on public.gig_requirements for each row execute function public.set_updated_at();
create trigger setlists_updated_at before update on public.setlists for each row execute function public.set_updated_at();
create trigger crates_updated_at before update on public.crates for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.songs enable row level security;
alter table public.gigs enable row level security;
alter table public.gig_requirements enable row level security;
alter table public.setlists enable row level security;
alter table public.setlist_tracks enable row level security;
alter table public.crates enable row level security;
alter table public.crate_tracks enable row level security;

create policy "profiles own select" on public.profiles for select to authenticated using (id = auth.uid());
create policy "profiles own insert" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "profiles own update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "songs own select" on public.songs for select to authenticated using (user_id = auth.uid());
create policy "songs own insert" on public.songs for insert to authenticated with check (user_id = auth.uid());
create policy "songs own update" on public.songs for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "songs own delete" on public.songs for delete to authenticated using (user_id = auth.uid());

create policy "gigs own select" on public.gigs for select to authenticated using (user_id = auth.uid());
create policy "gigs own insert" on public.gigs for insert to authenticated with check (user_id = auth.uid());
create policy "gigs own update" on public.gigs for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "gigs own delete" on public.gigs for delete to authenticated using (user_id = auth.uid());

create policy "gig requirements own select" on public.gig_requirements for select to authenticated using (user_id = auth.uid());
create policy "gig requirements own insert" on public.gig_requirements for insert to authenticated with check (user_id = auth.uid());
create policy "gig requirements own update" on public.gig_requirements for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "gig requirements own delete" on public.gig_requirements for delete to authenticated using (user_id = auth.uid());

create policy "setlists own select" on public.setlists for select to authenticated using (user_id = auth.uid());
create policy "setlists own insert" on public.setlists for insert to authenticated with check (user_id = auth.uid());
create policy "setlists own update" on public.setlists for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "setlists own delete" on public.setlists for delete to authenticated using (user_id = auth.uid());

create policy "setlist tracks own select" on public.setlist_tracks for select to authenticated using (user_id = auth.uid());
create policy "setlist tracks own insert" on public.setlist_tracks for insert to authenticated with check (user_id = auth.uid());
create policy "setlist tracks own update" on public.setlist_tracks for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "setlist tracks own delete" on public.setlist_tracks for delete to authenticated using (user_id = auth.uid());

create policy "crates own select" on public.crates for select to authenticated using (user_id = auth.uid());
create policy "crates own insert" on public.crates for insert to authenticated with check (user_id = auth.uid());
create policy "crates own update" on public.crates for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "crates own delete" on public.crates for delete to authenticated using (user_id = auth.uid());

create policy "crate tracks own select" on public.crate_tracks for select to authenticated using (user_id = auth.uid());
create policy "crate tracks own insert" on public.crate_tracks for insert to authenticated with check (user_id = auth.uid());
create policy "crate tracks own update" on public.crate_tracks for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "crate tracks own delete" on public.crate_tracks for delete to authenticated using (user_id = auth.uid());

insert into storage.buckets (id, name, public)
values ('song-files', 'song-files', false)
on conflict (id) do update set public = false;

create policy "song files own select" on storage.objects
for select to authenticated
using (bucket_id = 'song-files' and owner = auth.uid());

create policy "song files own insert" on storage.objects
for insert to authenticated
with check (bucket_id = 'song-files' and owner = auth.uid());

create policy "song files own update" on storage.objects
for update to authenticated
using (bucket_id = 'song-files' and owner = auth.uid())
with check (bucket_id = 'song-files' and owner = auth.uid());

create policy "song files own delete" on storage.objects
for delete to authenticated
using (bucket_id = 'song-files' and owner = auth.uid());

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
