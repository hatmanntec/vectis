-- =====================================================================
-- 0006 · Investments and company relationships
-- ---------------------------------------------------------------------
-- investments            one investment by a VECTIS business (investor)
--                        in any company (investee), with its stated nature.
-- investment_private_details
--                        confidential figures, visible to administrators only.
-- company_relationships  other links: strategic partner, joint venture, etc.
--
-- None of these imply ownership. Ownership is expressed only through a
-- company's classification and parent (migration 0005).
-- =====================================================================

create table public.investments (
  id                   uuid primary key default gen_random_uuid(),
  investor_company_id  uuid not null references public.companies (id) on delete restrict,
  investee_company_id  uuid not null references public.companies (id) on delete restrict,
  nature               public.investment_nature not null,
  -- Free text to describe the relationship precisely, in the client's words.
  nature_note          text check (char_length(nature_note) <= 300),
  investment_status    public.investment_status not null default 'active',
  -- Optional: record only when known.
  investment_date      date,
  slug                 public.slug not null unique,
  summary              text check (char_length(summary) <= 400),
  description          jsonb,
  logo_media_id        uuid references public.media (id) on delete restrict,
  sort_order           integer not null default 0,
  seo_title            text check (char_length(seo_title) <= 70),
  seo_description      text check (char_length(seo_description) <= 160),
  status               public.content_status not null default 'draft',
  published_at         timestamptz,
  archived_at          timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  created_by           uuid references public.admin_profiles (id) on delete set null,
  updated_by           uuid references public.admin_profiles (id) on delete set null,
  check (investor_company_id <> investee_company_id),
  check (status <> 'published' or published_at is not null)
);

create index investments_investor_idx on public.investments (investor_company_id);
create index investments_investee_idx on public.investments (investee_company_id);
create index investments_public_idx   on public.investments (status, published_at);
create index investments_logo_idx     on public.investments (logo_media_id);

create trigger touch_row before insert or update on public.investments
  for each row execute function public.touch_row();
create trigger manage_publication before insert or update on public.investments
  for each row execute function public.manage_publication();
create trigger require_archived before delete on public.investments
  for each row execute function public.require_archived_before_delete();


-- ---------------------------------------------------------------------
-- Confidential figures: kept in their own table because anything stored on
-- a published row can be read by any website visitor. This table is never
-- readable outside the CMS.
-- ---------------------------------------------------------------------
create table public.investment_private_details (
  investment_id     uuid primary key references public.investments (id) on delete cascade,
  stake_percentage  numeric(5, 2) check (stake_percentage between 0 and 100),
  amount            numeric(18, 2) check (amount >= 0),
  currency          char(3) check (currency ~ '^[A-Z]{3}$'),
  notes             text check (char_length(notes) <= 5000),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  created_by        uuid references public.admin_profiles (id) on delete set null,
  updated_by        uuid references public.admin_profiles (id) on delete set null
);

create trigger touch_row before insert or update on public.investment_private_details
  for each row execute function public.touch_row();


-- ---------------------------------------------------------------------
-- company_relationships: links that are not investments.
-- These are links only: deleting either company removes the link,
-- never the other company.
-- ---------------------------------------------------------------------
create table public.company_relationships (
  id                 uuid primary key default gen_random_uuid(),
  from_company_id    uuid not null references public.companies (id) on delete cascade,
  to_company_id      uuid not null references public.companies (id) on delete cascade,
  relationship_type  public.relationship_type not null,
  description        text check (char_length(description) <= 1000),
  start_date         date,
  end_date           date,
  sort_order         integer not null default 0,
  status             public.content_status not null default 'draft',
  published_at       timestamptz,
  archived_at        timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  created_by         uuid references public.admin_profiles (id) on delete set null,
  updated_by         uuid references public.admin_profiles (id) on delete set null,
  check (from_company_id <> to_company_id),
  check (end_date is null or start_date is null or end_date >= start_date),
  check (status <> 'published' or published_at is not null),
  unique (from_company_id, to_company_id, relationship_type)
);

create index company_relationships_to_idx on public.company_relationships (to_company_id);

create trigger touch_row before insert or update on public.company_relationships
  for each row execute function public.touch_row();
create trigger manage_publication before insert or update on public.company_relationships
  for each row execute function public.manage_publication();
