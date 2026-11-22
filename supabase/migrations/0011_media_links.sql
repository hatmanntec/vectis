-- =====================================================================
-- 0011 · Galleries and supporting documents
-- ---------------------------------------------------------------------
-- media_links attaches library files to a record, either as a gallery
-- image or as a supporting document. Each link points at exactly ONE
-- record (a company, investment, project, news item or leader).
--
-- Deleting the record removes its links. A file that is linked anywhere
-- cannot be deleted from the media library.
-- =====================================================================

create table public.media_links (
  id             uuid primary key default gen_random_uuid(),
  media_id       uuid not null references public.media (id) on delete restrict,
  role           text not null check (role in ('gallery', 'document')),
  company_id     uuid references public.companies (id) on delete cascade,
  investment_id  uuid references public.investments (id) on delete cascade,
  project_id     uuid references public.projects (id) on delete cascade,
  news_id        uuid references public.news (id) on delete cascade,
  leadership_id  uuid references public.leadership (id) on delete cascade,
  caption        text check (char_length(caption) <= 500),
  sort_order     integer not null default 0,
  created_at     timestamptz not null default now(),
  check (num_nonnulls(company_id, investment_id, project_id, news_id, leadership_id) = 1)
);

create index media_links_media_idx      on public.media_links (media_id);
create index media_links_company_idx    on public.media_links (company_id, role, sort_order)    where company_id is not null;
create index media_links_investment_idx on public.media_links (investment_id, role, sort_order) where investment_id is not null;
create index media_links_project_idx    on public.media_links (project_id, role, sort_order)    where project_id is not null;
create index media_links_news_idx       on public.media_links (news_id, role, sort_order)       where news_id is not null;
create index media_links_leadership_idx on public.media_links (leadership_id, role, sort_order) where leadership_id is not null;
