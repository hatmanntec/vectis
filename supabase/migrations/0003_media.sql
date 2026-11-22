-- =====================================================================
-- 0003 · Media library
-- ---------------------------------------------------------------------
-- One row per uploaded file. The file itself lives in Supabase Storage;
-- this row holds its details (type, size, alt text, category).
--
-- Privacy is decided by the bucket:
--   public-media   → anyone can view (images and downloads for the website)
--   private-files  → administrators only (internal documents)
--
-- Other tables point at media rows "on delete restrict", so a file that is
-- still in use cannot be deleted from the library.
-- =====================================================================

create table public.media (
  id           uuid primary key default gen_random_uuid(),
  bucket       text not null check (bucket in ('public-media', 'private-files')),
  path         text not null check (char_length(path) between 1 and 500),
  file_name    text not null check (char_length(file_name) between 1 and 255),
  mime_type    text not null check (char_length(mime_type) between 3 and 100),
  size_bytes   bigint not null check (size_bytes > 0),
  width        integer check (width > 0),
  height       integer check (height > 0),
  alt_text     text check (char_length(alt_text) <= 300),
  caption      text check (char_length(caption) <= 500),
  category     public.media_category not null default 'other',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  created_by   uuid references public.admin_profiles (id) on delete set null,
  updated_by   uuid references public.admin_profiles (id) on delete set null,
  unique (bucket, path)
);

create index media_category_idx   on public.media (category);
create index media_created_at_idx on public.media (created_at desc);

create trigger touch_row before insert or update on public.media
  for each row execute function public.touch_row();
