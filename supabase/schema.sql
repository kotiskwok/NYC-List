-- My NYC List: one row per signed-in user holding their whole list as JSON.
-- Run this once in Supabase → SQL Editor → New query → Run.

create table if not exists public.nyc_list (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.nyc_list enable row level security;

drop policy if exists "Read own list" on public.nyc_list;
create policy "Read own list" on public.nyc_list
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Create own list" on public.nyc_list;
create policy "Create own list" on public.nyc_list
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Update own list" on public.nyc_list;
create policy "Update own list" on public.nyc_list
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
