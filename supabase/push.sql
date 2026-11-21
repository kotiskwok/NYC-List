-- List notifications: "Sonia added Lucali to Sonia's Visit". Run once in Supabase → SQL Editor → New query → Run (safe to re-run).
--
-- nyc_push_tokens: one row per iPhone that allowed notifications (Apple's device token), owned by whoever is signed in on it.
-- Nobody can read anyone else's tokens. The server only gets them through nyc_push_targets(), and only for a list the
-- caller is on, minus the caller's own phones.

create table if not exists public.nyc_push_tokens (
  token      text primary key check (char_length(token) between 32 and 200),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  platform   text not null default 'ios',
  updated_at timestamptz not null default now()
);
create index if not exists nyc_push_tokens_user on public.nyc_push_tokens (user_id);
alter table public.nyc_push_tokens enable row level security;

drop policy if exists "Push tokens: your own" on public.nyc_push_tokens;
create policy "Push tokens: your own" on public.nyc_push_tokens
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Save this phone's token for whoever is signed in now (a phone that switched accounts moves over).
create or replace function public.nyc_save_push_token(t text, plat text default 'ios') returns void
  language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  delete from public.nyc_push_tokens where token = t;
  insert into public.nyc_push_tokens (token, user_id, platform) values (t, auth.uid(), coalesce(plat, 'ios'));
end;
$$;

-- The phones to tell about a change to list `trip`: everyone on it except the caller. Empty unless the caller is on it.
create or replace function public.nyc_push_targets(trip uuid)
  returns table (token text, platform text, trip_name text)
  language sql stable security definer set search_path = '' as $$
  select p.token, p.platform, t.name
  from public.nyc_trips t
  join public.nyc_push_tokens p on p.user_id = t.owner
       or p.user_id in (select m.user_id from public.nyc_trip_members m where m.trip_id = t.id)
  where t.id = trip
    and p.user_id <> auth.uid()
    and (t.owner = auth.uid() or exists (select 1 from public.nyc_trip_members m where m.trip_id = t.id and m.user_id = auth.uid()));
$$;

-- A token Apple says is no longer valid (app deleted, notifications reset). Only for lists the caller is on.
create or replace function public.nyc_drop_push_token(t text, trip uuid) returns void
  language sql security definer set search_path = '' as $$
  delete from public.nyc_push_tokens p
  where p.token = t and exists (select 1 from public.nyc_push_targets(trip) x where x.token = t);
$$;

revoke all on function public.nyc_save_push_token(text, text) from public, anon;
revoke all on function public.nyc_push_targets(uuid) from public, anon;
revoke all on function public.nyc_drop_push_token(text, uuid) from public, anon;
grant execute on function public.nyc_save_push_token(text, text) to authenticated;
grant execute on function public.nyc_push_targets(uuid) to authenticated;
grant execute on function public.nyc_drop_push_token(text, uuid) to authenticated;
