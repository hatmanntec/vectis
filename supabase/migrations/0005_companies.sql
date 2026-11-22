-- =====================================================================
-- 0005 · Companies
-- ---------------------------------------------------------------------
-- EVERY organisation is a row here: VECTIS itself, its businesses, any
-- subsidiaries, and outside companies such as investees and partners.
--
--   classification     says WHAT the company is (group / business /
--                      subsidiary / external)
--   parent_company_id  builds the group tree (VECTIS → its businesses)
--
-- Investments and partnerships are NOT stored here: they are separate
-- records (migration 0006), so an investment never implies ownership.
-- =====================================================================

create table public.companies (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null check (char_length(name) between 1 and 200),
  slug               public.slug not null unique,
  classification     public.company_classification not null,
  parent_company_id  uuid references public.companies (id) on delete restrict,
  short_description  text check (char_length(short_description) <= 300),
  -- Rich text from the CMS editor, stored as structured JSON (never raw HTML).
  full_description   jsonb,
  established_year   smallint check (established_year between 1800 and 2100),
  website            text check (char_length(website) <= 300),
  email              text check (char_length(email) <= 254),
  phone              text check (char_length(phone) <= 40),
  address            text check (char_length(address) <= 500),
  logo_media_id      uuid references public.media (id) on delete restrict,
  cover_media_id     uuid references public.media (id) on delete restrict,
  sort_order         integer not null default 0,
  seo_title          text check (char_length(seo_title) <= 70),
  seo_description    text check (char_length(seo_description) <= 160),
  status             public.content_status not null default 'draft',
  published_at       timestamptz,
  archived_at        timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  created_by         uuid references public.admin_profiles (id) on delete set null,
  updated_by         uuid references public.admin_profiles (id) on delete set null,
  check (parent_company_id is distinct from id),
  check (status <> 'published' or published_at is not null)
);

create index companies_parent_idx         on public.companies (parent_company_id);
create index companies_classification_idx on public.companies (classification);
create index companies_public_idx         on public.companies (status, published_at);
create index companies_logo_idx           on public.companies (logo_media_id);
create index companies_cover_idx          on public.companies (cover_media_id);

create trigger touch_row before insert or update on public.companies
  for each row execute function public.touch_row();
create trigger manage_publication before insert or update on public.companies
  for each row execute function public.manage_publication();
create trigger require_archived before delete on public.companies
  for each row execute function public.require_archived_before_delete();


-- ---------------------------------------------------------------------
-- Stop loops in the group tree (A → B → A would break every page that
-- walks up the tree).
-- ---------------------------------------------------------------------
create function public.prevent_company_cycle()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.parent_company_id is not null and exists (
    with recursive ancestors (id) as (
      select new.parent_company_id
      union
      select c.parent_company_id
      from public.companies c
      join ancestors a on c.id = a.id
      where c.parent_company_id is not null
    )
    select 1 from ancestors where id = new.id
  ) then
    raise exception 'A company cannot sit under itself, directly or through another company.'
      using hint = 'parent_cycle';
  end if;
  return new;
end;
$$;

create trigger prevent_company_cycle
  before insert or update of parent_company_id on public.companies
  for each row execute function public.prevent_company_cycle();


-- ---------------------------------------------------------------------
-- company_sectors: a company can work in several sectors; one may be
-- marked as its primary sector.
-- ---------------------------------------------------------------------
create table public.company_sectors (
  company_id  uuid not null references public.companies (id) on delete cascade,
  sector_id   uuid not null references public.sectors (id) on delete restrict,
  is_primary  boolean not null default false,
  created_at  timestamptz not null default now(),
  primary key (company_id, sector_id)
);

create index company_sectors_sector_idx on public.company_sectors (sector_id);
create unique index company_sectors_one_primary
  on public.company_sectors (company_id) where is_primary;
