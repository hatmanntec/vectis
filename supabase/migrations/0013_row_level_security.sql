-- =====================================================================
-- 0013 · Row Level Security (who may see and change what)
-- ---------------------------------------------------------------------
-- Once RLS is switched on for a table, NOTHING is allowed unless a policy
-- below allows it. Two kinds of visitor reach the database:
--   anon           anyone on the public website
--   authenticated  someone signed in (still needs is_admin() for the CMS)
--
-- Rules in plain words:
--   * The public sees only content that is published AND whose
--     publication time has passed, plus the companies it refers to.
--   * Administrators (is_admin(): active admin + two-step login) can
--     read and change everything, except where noted.
--   * Confidential investment figures, enquiries and the audit trail are
--     never visible to the public.
-- =====================================================================


-- 0. Basic table access for the two API roles --------------------------
-- Some Supabase projects grant this automatically, some don't; granting it
-- here makes the result the same everywhere. The policies below still
-- decide which rows each role can actually see or change.
grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon, authenticated;
grant insert, update, delete on all tables in schema public to authenticated;


-- 1. Switch RLS on for every table ------------------------------------
alter table public.admin_profiles             enable row level security;
alter table public.media                      enable row level security;
alter table public.website_settings           enable row level security;
alter table public.sectors                    enable row level security;
alter table public.companies                  enable row level security;
alter table public.company_sectors            enable row level security;
alter table public.investments                enable row level security;
alter table public.investment_private_details enable row level security;
alter table public.company_relationships      enable row level security;
alter table public.projects                   enable row level security;
alter table public.project_milestones         enable row level security;
alter table public.news                       enable row level security;
alter table public.news_companies             enable row level security;
alter table public.leadership                 enable row level security;
alter table public.leadership_affiliations    enable row level security;
alter table public.pages                      enable row level security;
alter table public.enquiries                  enable row level security;
alter table public.media_links                enable row level security;
alter table public.audit_logs                 enable row level security;


-- 2. Administrators: full read/write on content tables ---------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'media', 'sectors', 'companies', 'company_sectors',
    'investments', 'investment_private_details', 'company_relationships',
    'projects', 'project_milestones', 'news', 'news_companies',
    'leadership', 'leadership_affiliations', 'pages', 'media_links'
  ]
  loop
    execute format(
      'create policy "Administrators manage %1$s" on public.%1$I
         for all to authenticated
         using ((select public.is_admin()))
         with check ((select public.is_admin()))', t);
  end loop;
end;
$$;


-- 3. Public reads: published content ----------------------------------
-- Note: inside these rules, a look-up of another table (e.g. "exists ...
-- companies") is itself filtered by that table's rules, so a published
-- investment stays hidden while either company is unpublished.

create policy "Public reads published sectors" on public.sectors
  for select to anon, authenticated
  using (status = 'published' and published_at <= now());

create policy "Public reads published companies" on public.companies
  for select to anon, authenticated
  using (status = 'published' and published_at <= now());

create policy "Public reads published investments" on public.investments
  for select to anon, authenticated
  using (
    status = 'published' and published_at <= now()
    and exists (select 1 from public.companies c where c.id = investor_company_id)
    and exists (select 1 from public.companies c where c.id = investee_company_id)
  );

create policy "Public reads published relationships" on public.company_relationships
  for select to anon, authenticated
  using (
    status = 'published' and published_at <= now()
    and exists (select 1 from public.companies c where c.id = from_company_id)
    and exists (select 1 from public.companies c where c.id = to_company_id)
  );

create policy "Public reads published projects" on public.projects
  for select to anon, authenticated
  using (
    status = 'published' and published_at <= now()
    and exists (select 1 from public.companies c where c.id = company_id)
  );

create policy "Public reads published news" on public.news
  for select to anon, authenticated
  using (status = 'published' and published_at <= now());

create policy "Public reads published leadership" on public.leadership
  for select to anon, authenticated
  using (status = 'published' and published_at <= now());

create policy "Public reads published pages" on public.pages
  for select to anon, authenticated
  using (status = 'published' and published_at <= now());


-- 4. Public reads: links between visible records ----------------------
create policy "Public reads visible company sectors" on public.company_sectors
  for select to anon, authenticated
  using (
    exists (select 1 from public.companies c where c.id = company_id)
    and exists (select 1 from public.sectors s where s.id = sector_id)
  );

create policy "Public reads milestones of visible projects" on public.project_milestones
  for select to anon, authenticated
  using (exists (select 1 from public.projects p where p.id = project_id));

create policy "Public reads visible news tags" on public.news_companies
  for select to anon, authenticated
  using (
    exists (select 1 from public.news n where n.id = news_id)
    and exists (select 1 from public.companies c where c.id = company_id)
  );

create policy "Public reads visible affiliations" on public.leadership_affiliations
  for select to anon, authenticated
  using (
    exists (select 1 from public.leadership l where l.id = leadership_id)
    and exists (select 1 from public.companies c where c.id = company_id)
  );


-- 5. Media -------------------------------------------------------------
-- Files in the public-media bucket can be viewed by anyone (that is what
-- the bucket is for), so their details are readable too. Files in
-- private-files are invisible to the public.
create policy "Public reads public media" on public.media
  for select to anon, authenticated
  using (bucket = 'public-media');

create policy "Public reads visible media links" on public.media_links
  for select to anon, authenticated
  using (
    exists (select 1 from public.media m where m.id = media_id)
    and (
         exists (select 1 from public.companies   x where x.id = company_id)
      or exists (select 1 from public.investments x where x.id = investment_id)
      or exists (select 1 from public.projects    x where x.id = project_id)
      or exists (select 1 from public.news        x where x.id = news_id)
      or exists (select 1 from public.leadership  x where x.id = leadership_id)
    )
  );


-- 6. Website settings: public details, editable by administrators -----
-- (The single row cannot be added or removed through the API.)
create policy "Public reads website settings" on public.website_settings
  for select to anon, authenticated
  using (true);

create policy "Administrators update website settings" on public.website_settings
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));


-- 7. Administrator profiles -------------------------------------------
-- A signed-in person can read only their own profile (so the CMS can tell
-- them whether they are an administrator). Profiles are created and
-- changed only through the Supabase SQL Editor.
create policy "Users read their own admin profile" on public.admin_profiles
  for select to authenticated
  using (id = (select auth.uid()));


-- 8. Enquiries: administrators read, mark as read, delete --------------
-- (Adding happens only through submit_enquiry().)
create policy "Administrators read enquiries" on public.enquiries
  for select to authenticated
  using ((select public.is_admin()));

create policy "Administrators update enquiries" on public.enquiries
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Administrators delete enquiries" on public.enquiries
  for delete to authenticated
  using ((select public.is_admin()));


-- 9. Audit trail: administrators read only ----------------------------
create policy "Administrators read the audit trail" on public.audit_logs
  for select to authenticated
  using ((select public.is_admin()));

-- Belt and braces: nobody using the API may write to the audit trail.
revoke insert, update, delete, truncate on public.audit_logs from anon, authenticated;
