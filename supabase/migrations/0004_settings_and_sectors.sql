-- =====================================================================
-- 0004 · Website settings and sectors
-- =====================================================================


-- ---------------------------------------------------------------------
-- website_settings: exactly ONE row (id is always 1) holding site-wide
-- details. The row itself is created in migration 0015.
-- ---------------------------------------------------------------------
create table public.website_settings (
  id                      smallint primary key default 1 check (id = 1),
  site_name               text not null default 'VECTIS' check (char_length(site_name) between 1 and 80),
  tagline                 text check (char_length(tagline) <= 200),
  -- Leave empty to use the master logo shipped with the website.
  logo_media_id           uuid references public.media (id) on delete restrict,
  contact_email           text check (char_length(contact_email) <= 254),
  contact_phone           text check (char_length(contact_phone) <= 40),
  contact_address         text check (char_length(contact_address) <= 500),
  -- e.g. {"linkedin": "https://...", "x": "https://..."}
  social_links            jsonb not null default '{}'::jsonb check (jsonb_typeof(social_links) = 'object'),
  seo_default_title       text check (char_length(seo_default_title) <= 70),
  seo_default_description text check (char_length(seo_default_description) <= 160),
  og_image_media_id       uuid references public.media (id) on delete restrict,
  updated_at              timestamptz not null default now(),
  updated_by              uuid references public.admin_profiles (id) on delete set null
);

create trigger touch_row before update on public.website_settings
  for each row execute function public.touch_row();


-- ---------------------------------------------------------------------
-- sectors: industries defined by the administrator (e.g. "Oil and Gas").
-- They drive the website's "Industries" section. None are pre-filled.
-- ---------------------------------------------------------------------
create table public.sectors (
  id               uuid primary key default gen_random_uuid(),
  name             text not null unique check (char_length(name) between 1 and 120),
  slug             public.slug not null unique,
  description      text check (char_length(description) <= 2000),
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
  check (status <> 'published' or published_at is not null)
);

create index sectors_public_idx on public.sectors (status, published_at);

create trigger touch_row before insert or update on public.sectors
  for each row execute function public.touch_row();
create trigger manage_publication before insert or update on public.sectors
  for each row execute function public.manage_publication();
create trigger require_archived before delete on public.sectors
  for each row execute function public.require_archived_before_delete();
