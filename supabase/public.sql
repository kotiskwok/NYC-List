-- Public Profile Map: a read-only map of the spots you choose, at https://nyc-lovat.vercel.app/m/<slug>.
-- Anyone with the link can open it, no account needed. Run once in Supabase → SQL Editor → New query → Run (safe to re-run).
--
-- One row per person. The app rewrites `data` a few seconds after your spots change, while the map is live.
-- data = { spots: [{name, cat, area, lat, lng, city, price, order, ev, photo, gid, been, url}], cats: [{id, name, color, emoji}] }
-- Never your home, notes, plans or lists.

create table if not exists public.nyc_public_maps (
  owner      uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  slug       text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{2,39}$'),
  name       text not null default '' check (char_length(name) <= 60),
  live       boolean not null default true,
  mode       text not null default 'all' check (mode in ('all', 'been', 'picked')),
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.nyc_public_maps enable row level security;

drop policy if exists "Public maps: anyone reads live ones" on public.nyc_public_maps;
create policy "Public maps: anyone reads live ones" on public.nyc_public_maps
  for select to anon, authenticated using (live or owner = auth.uid());
drop policy if exists "Public maps: make your own" on public.nyc_public_maps;
create policy "Public maps: make your own" on public.nyc_public_maps
  for insert to authenticated with check (owner = auth.uid());
drop policy if exists "Public maps: edit your own" on public.nyc_public_maps;
create policy "Public maps: edit your own" on public.nyc_public_maps
  for update to authenticated using (owner = auth.uid()) with check (owner = auth.uid());
drop policy if exists "Public maps: delete your own" on public.nyc_public_maps;
create policy "Public maps: delete your own" on public.nyc_public_maps
  for delete to authenticated using (owner = auth.uid());

grant select on public.nyc_public_maps to anon;
grant select, insert, update, delete on public.nyc_public_maps to authenticated;
