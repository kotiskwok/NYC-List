-- Coming Soon cities: votes to open a city, and a count of spots people save in cities that aren't open yet.
-- Run once in Supabase → SQL Editor → New query → Run (safe to re-run).
--
-- One row per person per city. city is a Coming Soon map id from src/logic.js ('phl', 'chi', 'la'…), or 'else:<Town, ST>'
-- for spots saved outside every listed city (for example 'else:Princeton, NJ').
-- The app writes only through nyc_city_note(), and everyone signed in can read the totals (never who voted).
--
-- Which city to open next (run this in the SQL Editor any time):
--   select * from public.nyc_city_counts() order by people desc;

create table if not exists public.nyc_city_demand (
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  city       text not null check (char_length(city) between 1 and 80),
  voted      boolean not null default false,
  saves      integer not null default 0 check (saves >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, city)
);

alter table public.nyc_city_demand enable row level security;

drop policy if exists "City demand: read your own" on public.nyc_city_demand;
create policy "City demand: read your own" on public.nyc_city_demand
  for select to authenticated using (user_id = auth.uid());

-- p_kind: 'vote', 'unvote' or 'save' (a spot saved there).
create or replace function public.nyc_city_note(p_city text, p_kind text) returns void
  language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  if p_kind not in ('vote', 'unvote', 'save') then raise exception 'Unknown kind'; end if;
  if p_city is null or char_length(p_city) not between 1 and 80 then raise exception 'Bad city'; end if;
  insert into public.nyc_city_demand as d (user_id, city, voted, saves)
    values (auth.uid(), p_city, p_kind = 'vote', case when p_kind = 'save' then 1 else 0 end)
  on conflict (user_id, city) do update set
    voted = case when p_kind = 'vote' then true when p_kind = 'unvote' then false else d.voted end,
    saves = least(d.saves + case when p_kind = 'save' then 1 else 0 end, 100000),
    updated_at = now();
end;
$$;
revoke all on function public.nyc_city_note(text, text) from public, anon;
grant execute on function public.nyc_city_note(text, text) to authenticated;

-- Totals per city: votes, people who want it (voted or saved a spot there) and spots saved.
create or replace function public.nyc_city_counts()
  returns table (city text, votes bigint, people bigint, saves bigint)
  language sql stable security definer set search_path = '' as $$
  select d.city, count(*) filter (where d.voted), count(*) filter (where d.voted or d.saves > 0), coalesce(sum(d.saves), 0)
  from public.nyc_city_demand d group by d.city;
$$;
revoke all on function public.nyc_city_counts() from public, anon;
grant execute on function public.nyc_city_counts() to authenticated;
