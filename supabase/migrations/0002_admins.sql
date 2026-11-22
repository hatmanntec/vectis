-- =====================================================================
-- 0002 · Administrators
-- ---------------------------------------------------------------------
-- admin_profiles lists who may use the CMS. A person needs BOTH:
--   1. a login in Supabase Auth (created in the Supabase dashboard), and
--   2. an active row here (added with one SQL line; see docs/SETUP.md).
-- There is no way to add a row here from the website or the public API.
-- =====================================================================

create table public.admin_profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text not null check (char_length(full_name) between 1 and 120),
  role        public.admin_role not null default 'master_admin',
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.admin_profiles is
  'CMS administrators. Rows are added only through the Supabase SQL Editor.';

create trigger touch_row before update on public.admin_profiles
  for each row execute function public.touch_row();


-- ---------------------------------------------------------------------
-- is_admin(): the single question every security rule asks.
-- True only when the signed-in person
--   * has an active admin_profiles row, AND
--   * completed two-step login (MFA) in this session ("aal2").
-- "security definer" lets it read admin_profiles without being blocked by
-- that table's own rules; it reveals nothing except true/false.
-- ---------------------------------------------------------------------
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    exists (
      select 1
      from public.admin_profiles ap
      where ap.id = auth.uid()
        and ap.is_active
    )
    and coalesce(auth.jwt() ->> 'aal', 'aal1') = 'aal2';
$$;

revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;
