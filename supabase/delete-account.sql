-- Delete My Account (Apple requires it in apps with sign-up). Run once in Supabase → SQL Editor → New query → Run (safe to re-run).
-- Lets a signed-in person delete their own account, and only their own. Every app table points at auth.users with
-- "on delete cascade", so this also removes their map (nyc_list), the lists they own (nyc_trips), their list
-- memberships, reviews, reports, blocks and public map. Their photos are removed first by /api/delete-account.
create or replace function public.nyc_delete_me() returns void
  language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  delete from auth.users where id = auth.uid();
end;
$$;
revoke all on function public.nyc_delete_me() from public, anon;
grant execute on function public.nyc_delete_me() to authenticated;
