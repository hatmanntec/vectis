-- =====================================================================
-- 0016 · Password-only administrator access
-- ---------------------------------------------------------------------
-- Client decision (22 Nov 2026): the CMS does not use two-step
-- verification. An administrator is now simply a signed-in person with an
-- active row in admin_profiles. Everything else (Row Level Security,
-- audit trail, no public sign-up) is unchanged.
--
-- Replaces the is_admin() function from migration 0002. Every policy that
-- calls is_admin() follows automatically.
-- =====================================================================

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_profiles ap
    where ap.id = auth.uid()
      and ap.is_active
  );
$$;
