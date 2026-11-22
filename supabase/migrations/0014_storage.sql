-- =====================================================================
-- 0014 · File storage
-- ---------------------------------------------------------------------
-- Two buckets (folders in Supabase Storage):
--   public-media   viewable by anyone who has a file's address; holds
--                  website images and public PDF downloads
--   private-files  administrators only; opened through short-lived links
--
-- Each bucket only accepts the listed file types, up to 25 MB per file
-- (the CMS applies a lower 10 MB limit to images). SVG files are not
-- accepted, because they can contain scripts.
-- =====================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'public-media', 'public-media', true, 26214400,
    array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  ),
  (
    'private-files', 'private-files', false, 26214400,
    array[
      'image/jpeg', 'image/png', 'image/webp', 'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
  )
on conflict (id) do nothing;


-- Only administrators may add, replace or remove files in either bucket.
create policy "Administrators upload VECTIS files" on storage.objects
  for insert to authenticated
  with check (
    bucket_id in ('public-media', 'private-files')
    and (select public.is_admin())
  );

create policy "Administrators replace VECTIS files" on storage.objects
  for update to authenticated
  using (
    bucket_id in ('public-media', 'private-files')
    and (select public.is_admin())
  )
  with check (
    bucket_id in ('public-media', 'private-files')
    and (select public.is_admin())
  );

create policy "Administrators delete VECTIS files" on storage.objects
  for delete to authenticated
  using (
    bucket_id in ('public-media', 'private-files')
    and (select public.is_admin())
  );

-- Listing files and opening private ones is for administrators only.
-- (Public images are served through their public address and need no
-- policy; leaving this out stops anyone from listing the whole bucket.)
create policy "Administrators read VECTIS files" on storage.objects
  for select to authenticated
  using (
    bucket_id in ('public-media', 'private-files')
    and (select public.is_admin())
  );
