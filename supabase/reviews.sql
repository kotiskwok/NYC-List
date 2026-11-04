-- Spotted In: reviews of places (stars, a comment and a photo) that every Spotted In user who saved
-- the same place can read. Run this once in Supabase → SQL Editor → New query → Run. Safe to run again.
--
-- nyc_reviews         one review per person per place. place_key is the Google place id ("g:ChIJ…").
-- nyc_review_reports  "Report" taps. A review someone reported is hidden for them; at 3 reports it's hidden for everyone.
-- nyc_blocks          "Block" taps: you no longer see that person's reviews.
-- (Apple asks apps with posts from other people to offer report and block, and to act on reports.)

create table if not exists public.nyc_reviews (
  id         uuid primary key default gen_random_uuid(),
  place_key  text not null check (char_length(place_key) between 3 and 200),
  place_name text not null default '',
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name       text not null default '',
  stars      smallint not null check (stars between 1 and 5),
  body       text not null default '' check (char_length(body) <= 1000),
  photo      text not null default '' check (char_length(photo) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (place_key, user_id)
);
create index if not exists nyc_reviews_place on public.nyc_reviews (place_key, created_at desc);

create table if not exists public.nyc_review_reports (
  review_id  uuid not null references public.nyc_reviews (id) on delete cascade,
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  reason     text not null default '',
  created_at timestamptz not null default now(),
  primary key (review_id, user_id)
);

create table if not exists public.nyc_blocks (
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  blocked    uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, blocked)
);

-- How many people reported a review (security definer: policies can count all reports, not just your own).
create or replace function public.nyc_review_report_count(r uuid) returns integer
  language sql stable security definer set search_path = '' as $$
  select count(*)::integer from public.nyc_review_reports x where x.review_id = r;
$$;

alter table public.nyc_reviews enable row level security;
alter table public.nyc_review_reports enable row level security;
alter table public.nyc_blocks enable row level security;

drop policy if exists "Reviews: signed-in people read" on public.nyc_reviews;
create policy "Reviews: signed-in people read" on public.nyc_reviews
  for select to authenticated using (
    user_id = auth.uid() or (
      public.nyc_review_report_count(id) < 3
      and not exists (select 1 from public.nyc_review_reports x where x.review_id = id and x.user_id = auth.uid())
      and not exists (select 1 from public.nyc_blocks b where b.user_id = auth.uid() and b.blocked = nyc_reviews.user_id)
      and not exists (select 1 from public.nyc_blocks b where b.user_id = nyc_reviews.user_id and b.blocked = auth.uid())));
drop policy if exists "Reviews: write your own" on public.nyc_reviews;
create policy "Reviews: write your own" on public.nyc_reviews
  for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "Reviews: edit your own" on public.nyc_reviews;
create policy "Reviews: edit your own" on public.nyc_reviews
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "Reviews: delete your own" on public.nyc_reviews;
create policy "Reviews: delete your own" on public.nyc_reviews
  for delete to authenticated using (user_id = auth.uid());

drop policy if exists "Reports: file your own" on public.nyc_review_reports;
create policy "Reports: file your own" on public.nyc_review_reports
  for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "Reports: see your own" on public.nyc_review_reports;
create policy "Reports: see your own" on public.nyc_review_reports
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "Blocks: your own" on public.nyc_blocks;
create policy "Blocks: your own" on public.nyc_blocks
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

grant select, insert, update, delete on public.nyc_reviews to authenticated;
grant select, insert on public.nyc_review_reports to authenticated;
grant select, insert, delete on public.nyc_blocks to authenticated;
