-- Friends: add and remove friends, see what they're adding and where they've been, open their profile.
-- Run once in Supabase → SQL Editor → New query → Run (safe to re-run).
--
-- nyc_friend_profiles  one row per person: their friend link code, first name, what friends see
--                      (mode all | been | none, and which lists), and a snapshot of what they share.
--                      The app rewrites `data` a few seconds after your spots change.
--                      data = { spots: [{id, name, cat, area, lat, lng, city, photo, gid, been, at, vat, order}],
--                               cats: [{id, name, color, emoji}], lists: [{id, name, stops: [{name, cat, area, lat, lng, city, photo}]}] }
--                      Never your home, notes, plans or spots you keep private. Only friends can read it.
-- nyc_friends          two rows per friendship (you → them, them → you).
-- nyc_friend_requests  a request waiting for a yes.
--
-- Adding works by link (/?friend=<code>) or by username (@kotis). Either sends a request; the other person taps Accept.
-- Usernames are optional, lowercase, 3–20 letters, numbers, _ or . and unique. Only people with one can be found by search.

create table if not exists public.nyc_friend_profiles (
  owner      uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  code       text not null unique default substr(replace(gen_random_uuid()::text, '-', ''), 1, 14) check (code ~ '^[a-z0-9]{10,40}$'),
  name       text not null default '' check (char_length(name) <= 60),
  mode       text not null default 'none' check (mode in ('all', 'been', 'none')),
  lists      text[] not null default '{}',
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.nyc_friend_profiles add column if not exists username text;
create unique index if not exists nyc_friend_profiles_username on public.nyc_friend_profiles (username);
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'nyc_friend_profiles_username_ok') then
    alter table public.nyc_friend_profiles add constraint nyc_friend_profiles_username_ok check (username ~ '^[a-z0-9_.]{3,20}$');
  end if;
end $$;

create table if not exists public.nyc_friends (
  user_id   uuid not null references auth.users (id) on delete cascade,
  friend_id uuid not null references auth.users (id) on delete cascade,
  since     timestamptz not null default now(),
  primary key (user_id, friend_id),
  check (user_id <> friend_id)
);

create table if not exists public.nyc_friend_requests (
  from_id uuid not null references auth.users (id) on delete cascade,
  to_id   uuid not null references auth.users (id) on delete cascade,
  at      timestamptz not null default now(),
  primary key (from_id, to_id),
  check (from_id <> to_id)
);
create index if not exists nyc_friend_requests_to on public.nyc_friend_requests (to_id);

create or replace function public.nyc_is_friend(o uuid) returns boolean
  language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.nyc_friends f where f.user_id = auth.uid() and f.friend_id = o);
$$;

alter table public.nyc_friend_profiles enable row level security;
alter table public.nyc_friends enable row level security;
alter table public.nyc_friend_requests enable row level security;

drop policy if exists "Friend profiles: you and your friends read" on public.nyc_friend_profiles;
create policy "Friend profiles: you and your friends read" on public.nyc_friend_profiles
  for select to authenticated using (owner = (select auth.uid()) or public.nyc_is_friend(owner));
drop policy if exists "Friend profiles: make your own" on public.nyc_friend_profiles;
create policy "Friend profiles: make your own" on public.nyc_friend_profiles
  for insert to authenticated with check (owner = (select auth.uid()));
drop policy if exists "Friend profiles: edit your own" on public.nyc_friend_profiles;
create policy "Friend profiles: edit your own" on public.nyc_friend_profiles
  for update to authenticated using (owner = (select auth.uid())) with check (owner = (select auth.uid()));

drop policy if exists "Friends: see your own" on public.nyc_friends;
create policy "Friends: see your own" on public.nyc_friends
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists "Requests: see yours" on public.nyc_friend_requests;
create policy "Requests: see yours" on public.nyc_friend_requests
  for select to authenticated using (from_id = (select auth.uid()) or to_id = (select auth.uid()));
drop policy if exists "Requests: decline or cancel" on public.nyc_friend_requests;
create policy "Requests: decline or cancel" on public.nyc_friend_requests
  for delete to authenticated using (from_id = (select auth.uid()) or to_id = (select auth.uid()));

grant select, insert, update on public.nyc_friend_profiles to authenticated;
grant select on public.nyc_friends to authenticated;
grant select, delete on public.nyc_friend_requests to authenticated;

-- Your friend link code (made the first time), keeping your first name current.
create or replace function public.nyc_friend_me(p_name text) returns json
  language plpgsql security definer set search_path = '' as $$
declare r public.nyc_friend_profiles;
begin
  if auth.uid() is null then raise exception 'Sign in first'; end if;
  insert into public.nyc_friend_profiles (owner, name) values (auth.uid(), left(coalesce(p_name, ''), 60))
  on conflict (owner) do update set name = case when excluded.name <> '' then excluded.name else public.nyc_friend_profiles.name end
  returning * into r;
  return json_build_object('code', r.code, 'mode', r.mode, 'lists', r.lists, 'username', r.username);
end $$;

-- Whose link this is (shown before you send the request, even before you have an account).
create or replace function public.nyc_friend_preview(code text) returns json
  language sql stable security definer set search_path = '' as $$
  select json_build_object('name', p.name) from public.nyc_friend_profiles p where p.code = nyc_friend_preview.code;
$$;

-- Open someone's link: sends a request, or makes you friends straight away if they already asked you.
-- Answers 'sent', 'friends', 'self' or 'bad'.
create or replace function public.nyc_friend_add(code text) returns json
  language plpgsql security definer set search_path = '' as $$
declare o uuid; n text;
begin
  if auth.uid() is null then raise exception 'Sign in first'; end if;
  select p.owner, p.name into o, n from public.nyc_friend_profiles p where p.code = nyc_friend_add.code;
  if o is null then return json_build_object('status', 'bad'); end if;
  if o = auth.uid() then return json_build_object('status', 'self'); end if;
  if exists (select 1 from public.nyc_friends f where f.user_id = auth.uid() and f.friend_id = o) then
    return json_build_object('status', 'friends', 'name', n, 'id', o);
  end if;
  if exists (select 1 from public.nyc_friend_requests r where r.from_id = o and r.to_id = auth.uid()) then
    insert into public.nyc_friends (user_id, friend_id) values (auth.uid(), o), (o, auth.uid()) on conflict do nothing;
    delete from public.nyc_friend_requests r where (r.from_id = o and r.to_id = auth.uid()) or (r.from_id = auth.uid() and r.to_id = o);
    return json_build_object('status', 'friends', 'name', n, 'id', o);
  end if;
  if (select count(*) from public.nyc_friend_requests r where r.from_id = auth.uid() and r.at > now() - interval '1 hour') >= 40 then
    raise exception 'Too many friend requests. Try again later.';
  end if;
  insert into public.nyc_friend_requests (from_id, to_id) values (auth.uid(), o) on conflict do nothing;
  return json_build_object('status', 'sent', 'name', n, 'id', o);
end $$;

-- Say yes to a request.
create or replace function public.nyc_friend_accept(other uuid) returns boolean
  language plpgsql security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.nyc_friend_requests r where r.from_id = other and r.to_id = auth.uid()) then return false; end if;
  insert into public.nyc_friends (user_id, friend_id) values (auth.uid(), other), (other, auth.uid()) on conflict do nothing;
  delete from public.nyc_friend_requests r where (r.from_id = other and r.to_id = auth.uid()) or (r.from_id = auth.uid() and r.to_id = other);
  return true;
end $$;

-- Remove a friend (both sides). They aren't told.
create or replace function public.nyc_friend_remove(other uuid) returns void
  language sql security definer set search_path = '' as $$
  delete from public.nyc_friends f where (f.user_id = auth.uid() and f.friend_id = other) or (f.user_id = other and f.friend_id = auth.uid());
  delete from public.nyc_friend_requests r where (r.from_id = auth.uid() and r.to_id = other) or (r.from_id = other and r.to_id = auth.uid());
$$;

-- Your friends, requests waiting for you, and requests you've sent, with first names.
create or replace function public.nyc_friends_state() returns json
  language sql stable security definer set search_path = '' as $$
  select json_build_object(
    'friends', coalesce((select json_agg(json_build_object('id', f.friend_id, 'name', coalesce(p.name, ''), 'username', p.username, 'since', f.since) order by f.since desc)
      from public.nyc_friends f left join public.nyc_friend_profiles p on p.owner = f.friend_id where f.user_id = auth.uid()), '[]'::json),
    'incoming', coalesce((select json_agg(json_build_object('id', r.from_id, 'name', coalesce(p.name, ''), 'username', p.username, 'at', r.at) order by r.at desc)
      from public.nyc_friend_requests r left join public.nyc_friend_profiles p on p.owner = r.from_id where r.to_id = auth.uid()), '[]'::json),
    'outgoing', coalesce((select json_agg(json_build_object('id', r.to_id, 'name', coalesce(p.name, ''), 'username', p.username, 'at', r.at) order by r.at desc)
      from public.nyc_friend_requests r left join public.nyc_friend_profiles p on p.owner = r.to_id where r.from_id = auth.uid()), '[]'::json));
$$;

-- Pick (or clear, with '') your username. Answers 'ok', 'taken' or 'bad'.
create or replace function public.nyc_friend_set_username(p_username text) returns text
  language plpgsql security definer set search_path = '' as $$
declare u text := lower(btrim(ltrim(btrim(coalesce(p_username, '')), '@')));
begin
  if auth.uid() is null then raise exception 'Sign in first'; end if;
  insert into public.nyc_friend_profiles (owner) values (auth.uid()) on conflict (owner) do nothing;
  if u = '' then update public.nyc_friend_profiles set username = null where owner = auth.uid(); return 'ok'; end if;
  if u !~ '^[a-z0-9_.]{3,20}$' then return 'bad'; end if;
  if exists (select 1 from public.nyc_friend_profiles p where p.username = u and p.owner <> auth.uid()) then return 'taken'; end if;
  update public.nyc_friend_profiles set username = u where owner = auth.uid();
  return 'ok';
exception when unique_violation then return 'taken';
end $$;

-- Find people by username (starts with what you typed, at least 2 characters, up to 8 people).
-- status: 'friends', 'sent' (you asked them), 'incoming' (they asked you) or 'none'.
create or replace function public.nyc_friend_find(q text) returns json
  language sql stable security definer set search_path = '' as $$
  with w as (select lower(btrim(ltrim(btrim(coalesce(q, '')), '@'))) as u)
  select coalesce(json_agg(x order by x.exact desc, x.username), '[]'::json) from (
    select p.owner as id, p.name, p.username, (p.username = w.u) as exact,
      case when exists (select 1 from public.nyc_friends f where f.user_id = auth.uid() and f.friend_id = p.owner) then 'friends'
           when exists (select 1 from public.nyc_friend_requests r where r.from_id = auth.uid() and r.to_id = p.owner) then 'sent'
           when exists (select 1 from public.nyc_friend_requests r where r.from_id = p.owner and r.to_id = auth.uid()) then 'incoming'
           else 'none' end as status
    from public.nyc_friend_profiles p, w
    where auth.uid() is not null and char_length(w.u) >= 2 and w.u ~ '^[a-z0-9_.]+$'
      and left(p.username, char_length(w.u)) = w.u and p.owner <> auth.uid()
    order by (p.username = w.u) desc, p.username limit 8) x;
$$;

-- Send a request by username. Same answers as nyc_friend_add.
create or replace function public.nyc_friend_add_user(p_username text) returns json
  language plpgsql security definer set search_path = '' as $$
declare c text;
begin
  select p.code into c from public.nyc_friend_profiles p where p.username = lower(btrim(ltrim(btrim(coalesce(p_username, '')), '@')));
  if c is null then return json_build_object('status', 'bad'); end if;
  return public.nyc_friend_add(c);
end $$;

revoke execute on function public.nyc_friend_set_username(text) from public, anon;
revoke execute on function public.nyc_friend_find(text) from public, anon;
revoke execute on function public.nyc_friend_add_user(text) from public, anon;
grant execute on function public.nyc_friend_set_username(text) to authenticated;
grant execute on function public.nyc_friend_find(text) to authenticated;
grant execute on function public.nyc_friend_add_user(text) to authenticated;
revoke execute on function public.nyc_friend_me(text) from public, anon;
revoke execute on function public.nyc_friend_add(text) from public, anon;
revoke execute on function public.nyc_friend_accept(uuid) from public, anon;
revoke execute on function public.nyc_friend_remove(uuid) from public, anon;
revoke execute on function public.nyc_friends_state() from public, anon;
grant execute on function public.nyc_friend_me(text) to authenticated;
grant execute on function public.nyc_friend_add(text) to authenticated;
grant execute on function public.nyc_friend_accept(uuid) to authenticated;
grant execute on function public.nyc_friend_remove(uuid) to authenticated;
grant execute on function public.nyc_friends_state() to authenticated;
grant execute on function public.nyc_friend_preview(text) to anon, authenticated;
