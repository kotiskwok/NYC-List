-- Profile photos. Run once in Supabase → SQL Editor (safe to re-run).
-- A public bucket "avatars" where each person can only write their own folder: <user id>/avatar.jpg.
-- Photos are public so friends on a shared list can see them; the app keeps them small (320×320 JPEG).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 1048576, array['image/jpeg'])
on conflict (id) do update set public = true, file_size_limit = 1048576, allowed_mime_types = array['image/jpeg'];

drop policy if exists "Avatars are readable" on storage.objects;
create policy "Avatars are readable" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "People add their own avatar" on storage.objects;
create policy "People add their own avatar" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "People change their own avatar" on storage.objects;
create policy "People change their own avatar" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "People remove their own avatar" on storage.objects;
create policy "People remove their own avatar" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
