-- Supabase 대시보드 → SQL Editor 에 통째로 붙여 넣고 Run
-- 로그인한 사용자 본인의 행만 읽고 쓸 수 있도록 RLS 를 켭니다.

-- ① 가족 프로필 (회원 1명 = 1행)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  guardian_age text not null default '30s',
  child_age_bands text[] not null default '{}',
  needs text[] not null default '{}',
  budget text not null default 'any',
  updated_at timestamptz not null default now()
);

-- ② 여행 바구니 (장소를 담고 날짜별로 배치)
create table if not exists public.basket_items (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  content_id text not null,
  content_type text not null default '',
  title text not null,
  addr text not null default '',
  image text not null default '',
  lat double precision,
  lng double precision,
  score int,
  day int not null default 1,
  memo text not null default '',
  created_at timestamptz not null default now(),
  unique (user_id, content_id)
);

-- ③ 아이 미션 완료 기록 (스탬프)
create table if not exists public.mission_stamps (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  mission_id text not null,
  done_at timestamptz not null default now(),
  primary key (user_id, mission_id)
);

alter table public.profiles enable row level security;
alter table public.basket_items enable row level security;
alter table public.mission_stamps enable row level security;

drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "own basket" on public.basket_items;
create policy "own basket" on public.basket_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own stamps" on public.mission_stamps;
create policy "own stamps" on public.mission_stamps
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ④ 여행 후기 (supabase/reviews.sql 과 같은 내용)

create table if not exists public.trip_reviews (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  day int not null default 1,                         -- 몇 일차에 대한 후기인지
  title text not null default '' check (char_length(title) <= 60),
  body text not null check (char_length(body) between 1 and 1500),
  rating int not null default 5 check (rating between 1 and 5),
  route jsonb not null default '[]',                  -- 그날 돌아다닌 장소들 [{id, title}] (후기를 쓸 때의 스냅샷)
  is_public boolean not null default false,           -- true 면 다른 가족도 볼 수 있음 (작성자가 직접 선택)
  author text not null default '',                    -- 공개 시 보여줄 이름(이메일은 절대 공개하지 않음)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists trip_reviews_public_idx on public.trip_reviews (is_public, created_at desc);

alter table public.trip_reviews enable row level security;

-- 내 후기는 나만 읽고 쓰고 지울 수 있다
drop policy if exists "own reviews" on public.trip_reviews;
create policy "own reviews" on public.trip_reviews
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 공개로 표시한 후기는 누구나 읽을 수 있다 (읽기 전용)
drop policy if exists "public reviews are readable" on public.trip_reviews;
create policy "public reviews are readable" on public.trip_reviews
  for select using (is_public = true);
