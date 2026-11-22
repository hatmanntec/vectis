-- =====================================================================
-- 0008 · News and media
-- ---------------------------------------------------------------------
-- Articles, press releases, announcements, industry updates and company
-- news. A published_at date in the future makes an item "scheduled":
-- it appears on the website automatically when that time arrives.
-- =====================================================================

create table public.news (
  id               uuid primary key default gen_random_uuid(),
  news_type        public.news_type not null default 'article',
  title            text not null check (char_length(title) between 1 and 200),
  slug             public.slug not null unique,
  excerpt          text check (char_length(excerpt) <= 400),
  body             jsonb,
  cover_media_id   uuid references public.media (id) on delete restrict,
  author_name      text check (char_length(author_name) <= 120),
  is_featured      boolean not null default false,
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

create index news_public_idx on public.news (status, published_at desc);
create index news_type_idx   on public.news (news_type);
create index news_cover_idx  on public.news (cover_media_id);

create trigger touch_row before insert or update on public.news
  for each row execute function public.touch_row();
create trigger manage_publication before insert or update on public.news
  for each row execute function public.manage_publication();
create trigger require_archived before delete on public.news
  for each row execute function public.require_archived_before_delete();


-- ---------------------------------------------------------------------
-- news_companies: which companies an item is about (any number).
-- Tags only: deleting either side removes just the tag.
-- ---------------------------------------------------------------------
create table public.news_companies (
  news_id     uuid not null references public.news (id) on delete cascade,
  company_id  uuid not null references public.companies (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (news_id, company_id)
);

create index news_companies_company_idx on public.news_companies (company_id);
