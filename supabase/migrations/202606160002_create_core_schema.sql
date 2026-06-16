create extension if not exists "pgcrypto" with schema extensions;

create table if not exists public.regions (
  id text primary key,
  name text not null,
  district text not null default '',
  hot_score numeric not null default 0,
  trend_direction text not null default 'stable'
    check (trend_direction in ('up', 'down', 'stable')),
  place_count integer not null default 0,
  image_url text,
  search_volume numeric not null default 0,
  population_density numeric not null default 50,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.places (
  id text primary key,
  region_id text not null references public.regions(id) on delete cascade,
  name text not null,
  address text not null default '',
  category text not null,
  moods text[] not null default '{}',
  rating numeric not null default 0,
  review_count integer not null default 0,
  image_url text,
  kakao_place_id text not null,
  lat double precision not null,
  lng double precision not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  title text not null,
  place_ids text[] not null default '{}',
  places jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.regions enable row level security;
alter table public.places enable row level security;
alter table public.courses enable row level security;

drop policy if exists "Anyone can read regions" on public.regions;
create policy "Anyone can read regions"
  on public.regions
  for select
  using (true);

drop policy if exists "Anyone can read places" on public.places;
create policy "Anyone can read places"
  on public.places
  for select
  using (true);

drop policy if exists "Anyone can read courses" on public.courses;
create policy "Anyone can read courses"
  on public.courses
  for select
  using (true);

drop policy if exists "Authenticated users can create own courses" on public.courses;
create policy "Authenticated users can create own courses"
  on public.courses
  for insert
  with check (auth.uid() = user_id or user_id is null);

drop policy if exists "Users can update own courses" on public.courses;
create policy "Users can update own courses"
  on public.courses
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own courses" on public.courses;
create policy "Users can delete own courses"
  on public.courses
  for delete
  using (auth.uid() = user_id);

insert into public.regions (
  id,
  name,
  district,
  hot_score,
  trend_direction,
  place_count,
  image_url,
  search_volume,
  population_density
) values
  ('seongsu', '성수동', '서울 성동구', 94.2, 'up', 142, null, 90, 70),
  ('hongdae', '홍대·합정', '서울 마포구', 88.7, 'stable', 218, null, 85, 70),
  ('gangnam', '강남·청담', '서울 강남구', 82.1, 'stable', 189, null, 80, 60),
  ('itaewon', '이태원·한남', '서울 용산구', 76.5, 'up', 97, null, 72, 65),
  ('yeonnam', '연남·망원', '서울 마포구', 71.3, 'down', 83, null, 70, 50)
on conflict (id) do update set
  name = excluded.name,
  district = excluded.district,
  hot_score = excluded.hot_score,
  trend_direction = excluded.trend_direction,
  place_count = excluded.place_count,
  image_url = excluded.image_url,
  search_volume = excluded.search_volume,
  population_density = excluded.population_density,
  updated_at = now();
