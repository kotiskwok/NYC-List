-- Share → Spotted In, read straight away ("Spotted Lucali On The Map!!"). Run once in Supabase → SQL Editor → New query → Run (safe to re-run).
--
-- The iPhone's share sheet can't sign in, so each signed-in phone gets a random share key (kept in the app group,
-- only its hash stored here). The share sheet sends the link and the key to /api/extract, which reads the post,
-- notifies the phone, and leaves the result here for the app to add the next time it opens.

create table if not exists public.nyc_share_keys (
  key_hash   text primary key,
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.nyc_share_keys enable row level security;
drop policy if exists "Share keys: your own" on public.nyc_share_keys;
create policy "Share keys: your own" on public.nyc_share_keys
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create table if not exists public.nyc_share_jobs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  link       text not null check (char_length(link) <= 2000),
  status     text not null default 'reading' check (status in ('reading', 'done', 'failed')),
  result     jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists nyc_share_jobs_user on public.nyc_share_jobs (user_id, created_at desc);
alter table public.nyc_share_jobs enable row level security;
drop policy if exists "Share jobs: read your own" on public.nyc_share_jobs;
create policy "Share jobs: read your own" on public.nyc_share_jobs for select to authenticated using (user_id = auth.uid());
drop policy if exists "Share jobs: clear your own" on public.nyc_share_jobs;
create policy "Share jobs: clear your own" on public.nyc_share_jobs for delete to authenticated using (user_id = auth.uid());

-- The signed-in app registers this phone's key (a phone keeps one; signing in again replaces it).
create or replace function public.nyc_set_share_key(k text) returns void
  language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  if char_length(k) < 48 then raise exception 'Key too short'; end if;
  insert into public.nyc_share_keys (key_hash, user_id) values (encode(extensions.digest(k, 'sha256'), 'hex'), auth.uid())
    on conflict (key_hash) do update set user_id = excluded.user_id;
end;
$$;

-- /api/extract, holding only the key: start a job and get what it needs (homes, categories, the map, this person's phones).
create or replace function public.nyc_share_start(k text, link text)
  returns table (job uuid, city text, home jsonb, cities jsonb, cats jsonb, tokens text[])
  language plpgsql security definer set search_path = '' as $$
declare u uuid; j uuid;
begin
  select s.user_id into u from public.nyc_share_keys s where s.key_hash = encode(extensions.digest(k, 'sha256'), 'hex');
  if u is null then raise exception 'Unknown key'; end if;
  -- At most 30 shares an hour per person.
  if (select count(*) from public.nyc_share_jobs x where x.user_id = u and x.created_at > now() - interval '1 hour') >= 30 then raise exception 'Too many'; end if;
  insert into public.nyc_share_jobs (user_id, link) values (u, left(link, 2000)) returning id into j;
  return query
    select j, coalesce(l.data->>'city', 'nyc'), l.data->'home', coalesce(l.data->'cities', '{}'::jsonb), coalesce(l.data->'cats', '[]'::jsonb),
      coalesce((select array_agg(p.token) from public.nyc_push_tokens p where p.user_id = u), '{}')
    from (select 1) one left join public.nyc_list l on l.user_id = u;
end;
$$;

-- /api/extract: save what it found (only with the same key).
create or replace function public.nyc_share_finish(k text, job uuid, st text, res jsonb) returns void
  language sql security definer set search_path = '' as $$
  update public.nyc_share_jobs x set status = st, result = coalesce(res, '{}'::jsonb)
  where x.id = job and st in ('done', 'failed')
    and x.user_id = (select s.user_id from public.nyc_share_keys s where s.key_hash = encode(extensions.digest(k, 'sha256'), 'hex'));
$$;

revoke all on function public.nyc_set_share_key(text) from public, anon;
revoke all on function public.nyc_share_start(text, text) from public;
revoke all on function public.nyc_share_finish(text, uuid, text, jsonb) from public;
grant execute on function public.nyc_set_share_key(text) to authenticated;
grant execute on function public.nyc_share_start(text, text) to anon, authenticated;
grant execute on function public.nyc_share_finish(text, uuid, text, jsonb) to anon, authenticated;
