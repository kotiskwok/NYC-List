-- My NYC List: shared lists (trips / itineraries).
-- Run this once in Supabase → SQL Editor → New query → Run. Safe to run again.
--
-- nyc_trips         one row per list. `data` holds {stops, days, start, cats} as JSON.
--                   The owner picks what invited people get: the list (share_list) and/or a
--                   view-only look at the owner's whole map (share_map).
-- nyc_trip_members  who joined a list through its invite link.

create table if not exists public.nyc_trips (
  id          uuid primary key default gen_random_uuid(),
  owner       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  owner_name  text not null default '',
  name        text not null default 'New List',
  share_list  boolean not null default true,
  share_map   boolean not null default false,
  invite_code text not null unique default substr(replace(gen_random_uuid()::text, '-', ''), 1, 14),
  data        jsonb not null default '{}'::jsonb,
  rev         integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.nyc_trip_members (
  trip_id   uuid not null references public.nyc_trips (id) on delete cascade,
  user_id   uuid not null references auth.users (id) on delete cascade,
  name      text not null default '',
  email     text not null default '',
  joined_at timestamptz not null default now(),
  primary key (trip_id, user_id)
);

-- Helpers (security definer so policies can use them without looping back through RLS).
create or replace function public.nyc_is_member(t uuid) returns boolean
  language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.nyc_trip_members m where m.trip_id = t and m.user_id = auth.uid());
$$;
create or replace function public.nyc_is_owner(t uuid) returns boolean
  language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.nyc_trips x where x.id = t and x.owner = auth.uid());
$$;

alter table public.nyc_trips enable row level security;
alter table public.nyc_trip_members enable row level security;

drop policy if exists "Trips: owner and members read" on public.nyc_trips;
create policy "Trips: owner and members read" on public.nyc_trips
  for select to authenticated using (owner = (select auth.uid()) or public.nyc_is_member(id));

drop policy if exists "Trips: create own" on public.nyc_trips;
create policy "Trips: create own" on public.nyc_trips
  for insert to authenticated with check (owner = (select auth.uid()));

drop policy if exists "Trips: owner and list members edit" on public.nyc_trips;
create policy "Trips: owner and list members edit" on public.nyc_trips
  for update to authenticated
  using (owner = (select auth.uid()) or (share_list and public.nyc_is_member(id)))
  with check (owner = (select auth.uid()) or (share_list and public.nyc_is_member(id)));

drop policy if exists "Trips: owner deletes" on public.nyc_trips;
create policy "Trips: owner deletes" on public.nyc_trips
  for delete to authenticated using (owner = (select auth.uid()));

-- Members can only change the list's contents (data); name, sharing and the invite link stay the owner's.
create or replace function public.nyc_trips_guard() returns trigger
  language plpgsql set search_path = '' as $$
begin
  new.owner := old.owner;
  new.created_at := old.created_at;
  if old.owner is distinct from auth.uid() then
    new.owner_name := old.owner_name;
    new.name := old.name;
    new.share_list := old.share_list;
    new.share_map := old.share_map;
    new.invite_code := old.invite_code;
  end if;
  return new;
end $$;
drop trigger if exists nyc_trips_guard on public.nyc_trips;
create trigger nyc_trips_guard before update on public.nyc_trips
  for each row execute function public.nyc_trips_guard();

drop policy if exists "Members: see people on your lists" on public.nyc_trip_members;
create policy "Members: see people on your lists" on public.nyc_trip_members
  for select to authenticated
  using (user_id = (select auth.uid()) or public.nyc_is_owner(trip_id) or public.nyc_is_member(trip_id));

drop policy if exists "Members: leave or remove" on public.nyc_trip_members;
create policy "Members: leave or remove" on public.nyc_trip_members
  for delete to authenticated using (user_id = (select auth.uid()) or public.nyc_is_owner(trip_id));

grant select, insert, update, delete on public.nyc_trips to authenticated;
grant select, delete on public.nyc_trip_members to authenticated;

-- Who invited you and to what (shown on the sign-in screen before the invitee has an account).
create or replace function public.nyc_trip_preview(code text) returns json
  language sql stable security definer set search_path = '' as $$
  select json_build_object('name', t.name, 'owner_name', t.owner_name, 'share_list', t.share_list, 'share_map', t.share_map)
  from public.nyc_trips t where t.invite_code = code;
$$;

-- Join a list with its invite code. Returns the list's id, or null if the code is wrong or was replaced.
create or replace function public.nyc_join_trip(code text, p_name text) returns uuid
  language plpgsql security definer set search_path = '' as $$
declare t public.nyc_trips;
begin
  if auth.uid() is null then raise exception 'Sign in first'; end if;
  select * into t from public.nyc_trips where invite_code = code;
  if not found then return null; end if;
  if t.owner = auth.uid() then return t.id; end if;
  insert into public.nyc_trip_members (trip_id, user_id, name, email)
  values (t.id, auth.uid(), coalesce(nullif(p_name, ''), split_part(coalesce(auth.jwt() ->> 'email', ''), '@', 1)), coalesce(auth.jwt() ->> 'email', ''))
  on conflict (trip_id, user_id) do update set name = excluded.name;
  return t.id;
end $$;

-- The owner's whole map, view-only, for people on a list that shares it (no home location).
create or replace function public.nyc_shared_map(t uuid) returns jsonb
  language sql stable security definer set search_path = '' as $$
  select jsonb_build_object('places', coalesce(l.data -> 'places', '[]'::jsonb), 'cats', coalesce(l.data -> 'cats', '[]'::jsonb))
  from public.nyc_trips x join public.nyc_list l on l.user_id = x.owner
  where x.id = t and x.share_map and (x.owner = auth.uid() or public.nyc_is_member(t));
$$;

revoke execute on function public.nyc_join_trip(text, text) from public, anon;
revoke execute on function public.nyc_shared_map(uuid) from public, anon;
grant execute on function public.nyc_join_trip(text, text) to authenticated;
grant execute on function public.nyc_shared_map(uuid) to authenticated;
grant execute on function public.nyc_trip_preview(text) to anon, authenticated;
