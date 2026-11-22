-- =====================================================================
-- 0009 · Leadership
-- ---------------------------------------------------------------------
-- Directors, executives and management. A person can hold roles in
-- several companies (leadership_affiliations).
-- =====================================================================

create table public.leadership (
  id               uuid primary key default gen_random_uuid(),
  full_name        text not null check (char_length(full_name) between 1 and 160),
  slug             public.slug not null unique,
  job_title        text check (char_length(job_title) <= 160),
  category         public.leadership_category not null,
  biography        jsonb,
  photo_media_id   uuid references public.media (id) on delete restrict,
  display_order    integer not null default 0,
  seo_title        text check (char_length(seo_title) <= 70),
  seo_description  text check (char_length(seo_description) <= 160),
  status           public.content_status not null default 'draft',
  published_at     timestamptz,
  archived_at      timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  created_by       uuid references public.admin_profiles (id) on delete set null,
  updated_by       uuid references public.admin_profiles (id) on delete set null,
  check (status <> 'published' or published_at is not null)
);

create index leadership_order_idx  on public.leadership (category, display_order);
create index leadership_public_idx on public.leadership (status, published_at);
create index leadership_photo_idx  on public.leadership (photo_media_id);

create trigger touch_row before insert or update on public.leadership
  for each row execute function public.touch_row();
create trigger manage_publication before insert or update on public.leadership
  for each row execute function public.manage_publication();
create trigger require_archived before delete on public.leadership
  for each row execute function public.require_archived_before_delete();


create table public.leadership_affiliations (
  leadership_id  uuid not null references public.leadership (id) on delete cascade,
  company_id     uuid not null references public.companies (id) on delete cascade,
  role_title     text check (char_length(role_title) <= 160),
  sort_order     integer not null default 0,
  created_at     timestamptz not null default now(),
  primary key (leadership_id, company_id)
);

create index leadership_affiliations_company_idx on public.leadership_affiliations (company_id);
