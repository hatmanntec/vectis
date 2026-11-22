-- =====================================================================
-- 0007 · Projects and project timelines
-- =====================================================================

create table public.projects (
  id               uuid primary key default gen_random_uuid(),
  -- The business that owns the project. A company with projects cannot be
  -- deleted until the projects are moved or removed.
  company_id       uuid not null references public.companies (id) on delete restrict,
  sector_id        uuid references public.sectors (id) on delete set null,
  title            text not null check (char_length(title) between 1 and 200),
  slug             public.slug not null unique,
  summary          text check (char_length(summary) <= 400),
  description      jsonb,
  project_status   public.project_status not null default 'planned',
  location_name    text check (char_length(location_name) <= 200),
  state            text check (char_length(state) <= 100),
  country          text not null default 'Nigeria' check (char_length(country) <= 100),
  latitude         numeric(9, 6) check (latitude between -90 and 90),
  longitude        numeric(9, 6) check (longitude between -180 and 180),
  start_date       date,
  end_date         date,
  cover_media_id   uuid references public.media (id) on delete restrict,
  sort_order       integer not null default 0,
  seo_title        text check (char_length(seo_title) <= 70),
  seo_description  text check (char_length(seo_description) <= 160),
  status           public.content_status not null default 'draft',
  published_at     timestamptz,
  archived_at      timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  created_by       uuid references public.admin_profiles (id) on delete set null,
  updated_by       uuid references public.admin_profiles (id) on delete set null,
  check (end_date is null or start_date is null or end_date >= start_date),
  check (status <> 'published' or published_at is not null)
);

create index projects_company_idx on public.projects (company_id);
create index projects_sector_idx  on public.projects (sector_id);
create index projects_public_idx  on public.projects (status, published_at);
create index projects_cover_idx   on public.projects (cover_media_id);

create trigger touch_row before insert or update on public.projects
  for each row execute function public.touch_row();
create trigger manage_publication before insert or update on public.projects
  for each row execute function public.manage_publication();
create trigger require_archived before delete on public.projects
  for each row execute function public.require_archived_before_delete();


-- ---------------------------------------------------------------------
-- project_milestones: the timeline shown on a project page.
-- Milestones are visible whenever their project is.
-- ---------------------------------------------------------------------
create table public.project_milestones (
  id              uuid primary key default gen_random_uuid(),
  project_id      uuid not null references public.projects (id) on delete cascade,
  title           text not null check (char_length(title) between 1 and 200),
  description     text check (char_length(description) <= 2000),
  milestone_date  date,
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  created_by      uuid references public.admin_profiles (id) on delete set null,
  updated_by      uuid references public.admin_profiles (id) on delete set null
);

create index project_milestones_project_idx on public.project_milestones (project_id, sort_order);

create trigger touch_row before insert or update on public.project_milestones
  for each row execute function public.touch_row();
