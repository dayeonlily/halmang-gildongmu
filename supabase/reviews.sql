-- 여행 후기 기능용 표입니다.
-- Supabase 대시보드 → SQL Editor 에 통째로 붙여 넣고 Run (여러 번 실행해도 안전합니다)

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
