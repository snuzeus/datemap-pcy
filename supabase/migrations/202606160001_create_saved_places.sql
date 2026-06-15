create extension if not exists "pgcrypto" with schema extensions;

create table if not exists public.saved_places (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  place_id text not null,
  place jsonb not null,
  created_at timestamptz not null default now(),
  constraint saved_places_user_place_unique unique (user_id, place_id)
);

alter table public.saved_places enable row level security;

drop policy if exists "Users can read own saved places" on public.saved_places;
create policy "Users can read own saved places"
  on public.saved_places
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own saved places" on public.saved_places;
create policy "Users can insert own saved places"
  on public.saved_places
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own saved places" on public.saved_places;
create policy "Users can update own saved places"
  on public.saved_places
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own saved places" on public.saved_places;
create policy "Users can delete own saved places"
  on public.saved_places
  for delete
  using (auth.uid() = user_id);
