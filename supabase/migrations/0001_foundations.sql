-- =====================================================================
-- 0001 · Foundations
-- ---------------------------------------------------------------------
-- Shared building blocks used by every later migration:
--   * fixed lists of allowed values (enums)
--   * the "slug" type used in web addresses
--   * three helper functions that run automatically on save/delete
-- Nothing in this file stores any data.
-- =====================================================================


-- ---------------------------------------------------------------------
-- Fixed lists of allowed values
-- ---------------------------------------------------------------------

-- Publication state shared by all public content.
--   draft      → visible only in the CMS
--   published  → visible on the website once published_at has passed
--                (published_at in the future = "scheduled")
--   archived   → hidden everywhere; can be restored or permanently deleted
create type public.content_status as enum ('draft', 'published', 'archived');

-- What kind of organisation a company record is.
--   group       → the parent organisation (VECTIS itself)
--   business    → one of the VECTIS businesses ("business branch")
--   subsidiary  → a company owned by another company in the tree
--   external    → an outside company, e.g. an investee or a partner
create type public.company_classification as enum ('group', 'business', 'subsidiary', 'external');

-- The nature of an investment. Never implies ownership on its own.
create type public.investment_nature as enum (
  'portfolio_investment', 'equity_stake', 'joint_venture', 'strategic_investment', 'other'
);

create type public.investment_status as enum ('active', 'pending', 'exited');

-- Links between companies that are not investments.
create type public.relationship_type as enum ('strategic_partner', 'joint_venture', 'affiliate', 'other');

create type public.project_status as enum ('planned', 'in_progress', 'completed', 'on_hold');

create type public.news_type as enum (
  'article', 'press_release', 'announcement', 'industry_update', 'company_news'
);

create type public.leadership_category as enum ('director', 'executive', 'management');

create type public.media_category as enum ('logo', 'photo', 'document', 'other');

-- Only one role exists in version 1. More can be added later with
-- "alter type public.admin_role add value '...'" without rebuilding anything.
create type public.admin_role as enum ('master_admin');

create type public.audit_action as enum ('insert', 'update', 'delete');


-- ---------------------------------------------------------------------
-- Slug: the readable part of a web address, e.g. /businesses/vectis-sports
-- Lower-case letters, digits and single hyphens only; at most 120 characters.
-- ---------------------------------------------------------------------
create domain public.slug as text
  check (value ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(value) <= 120);


-- ---------------------------------------------------------------------
-- touch_row(): runs before every insert/update.
-- Stamps updated_at, and records which administrator created or last
-- changed the row (created_by / updated_by), on tables that have them.
-- ---------------------------------------------------------------------
create function public.touch_row()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  stamp jsonb := jsonb_build_object('updated_at', now());
begin
  if auth.uid() is not null then
    stamp := stamp || jsonb_build_object('updated_by', auth.uid());
    if tg_op = 'INSERT' then
      stamp := stamp || jsonb_build_object('created_by', auth.uid());
    end if;
  end if;
  -- Columns a table does not have are simply ignored.
  new := jsonb_populate_record(new, stamp);
  return new;
end;
$$;


-- ---------------------------------------------------------------------
-- manage_publication(): runs before every insert/update of public content.
--   * publishing with no date fills in "now"
--   * archiving records when it happened; restoring clears that date
-- ---------------------------------------------------------------------
create function public.manage_publication()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;

  if new.status = 'archived' then
    if tg_op = 'INSERT' then
      new.archived_at := now();
    elsif old.status is distinct from 'archived' then
      new.archived_at := now();
    end if;
  else
    new.archived_at := null;
  end if;

  return new;
end;
$$;


-- ---------------------------------------------------------------------
-- require_archived_before_delete(): two-step deletion.
-- A record must be archived before it can be permanently deleted,
-- so nothing live can disappear from the website by one mistaken click.
-- ---------------------------------------------------------------------
create function public.require_archived_before_delete()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.status is distinct from 'archived' then
    raise exception 'Archive this record before deleting it permanently.'
      using hint = 'archive_first';
  end if;
  return old;
end;
$$;
