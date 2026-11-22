-- =====================================================================
-- 0010 · Website pages and contact enquiries
-- =====================================================================


-- ---------------------------------------------------------------------
-- pages: one row per editable website page (Home, About VECTIS, ...).
--   page_key  fixed identifier the website code looks up, e.g. 'home'
--   template  which set of fields the CMS shows for this page
--   content   the page's fields as JSON, checked by the CMS against the
--             template before saving
-- Core ("system") pages are created in migration 0015 and cannot be
-- deleted. Future extra pages are added as non-system rows with a slug.
-- ---------------------------------------------------------------------
create table public.pages (
  id                 uuid primary key default gen_random_uuid(),
  page_key           text not null unique check (page_key ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  template           text not null default 'standard' check (template ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title              text not null check (char_length(title) between 1 and 200),
  slug               public.slug unique,
  content            jsonb not null default '{}'::jsonb check (jsonb_typeof(content) = 'object'),
  is_system          boolean not null default false,
  og_image_media_id  uuid references public.media (id) on delete restrict,
  seo_title          text check (char_length(seo_title) <= 70),
  seo_description    text check (char_length(seo_description) <= 160),
  status             public.content_status not null default 'draft',
  published_at       timestamptz,
  archived_at        timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  created_by         uuid references public.admin_profiles (id) on delete set null,
  updated_by         uuid references public.admin_profiles (id) on delete set null,
  check (is_system or slug is not null),
  check (status <> 'published' or published_at is not null)
);

create index pages_public_idx on public.pages (status, published_at);

create trigger touch_row before insert or update on public.pages
  for each row execute function public.touch_row();
create trigger manage_publication before insert or update on public.pages
  for each row execute function public.manage_publication();


create function public.protect_pages()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.is_system then
    raise exception 'Core website pages cannot be deleted. Unpublish it instead.'
      using hint = 'system_page';
  end if;
  if old.status is distinct from 'archived' then
    raise exception 'Archive this record before deleting it permanently.'
      using hint = 'archive_first';
  end if;
  return old;
end;
$$;

create trigger protect_pages before delete on public.pages
  for each row execute function public.protect_pages();


-- ---------------------------------------------------------------------
-- enquiries: messages sent from the public Contact page.
-- The public can only ADD an enquiry, and only through submit_enquiry()
-- below. Only administrators can read, mark or delete them.
-- ---------------------------------------------------------------------
create table public.enquiries (
  id            uuid primary key default gen_random_uuid(),
  name          text not null check (char_length(name) between 1 and 120),
  email         text not null check (char_length(email) <= 254),
  phone         text check (char_length(phone) <= 40),
  organisation  text check (char_length(organisation) <= 200),
  subject       text check (char_length(subject) <= 200),
  message       text not null check (char_length(message) between 1 and 5000),
  is_read       boolean not null default false,
  -- A one-way fingerprint of the sender's internet address, used only to
  -- limit repeated submissions. The address itself is never stored.
  ip_hash       text,
  created_at    timestamptz not null default now()
);

create index enquiries_created_at_idx on public.enquiries (created_at desc);
create index enquiries_ip_recent_idx  on public.enquiries (ip_hash, created_at);


create function public.submit_enquiry(
  p_name          text,
  p_email         text,
  p_message       text,
  p_phone         text default null,
  p_organisation  text default null,
  p_subject       text default null,
  p_client_ip     text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name     text := nullif(btrim(p_name), '');
  v_email    text := lower(nullif(btrim(p_email), ''));
  v_message  text := nullif(btrim(p_message), '');
  v_ip_hash  text := encode(sha256(convert_to(coalesce(p_client_ip, 'unknown') || '|vectis', 'UTF8')), 'hex');
  v_id       uuid;
begin
  if v_name is null or char_length(v_name) > 120 then
    raise exception 'Please enter your name (up to 120 characters).' using hint = 'invalid_name';
  end if;
  if v_email is null or v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' or char_length(v_email) > 254 then
    raise exception 'Please enter a valid email address.' using hint = 'invalid_email';
  end if;
  if v_message is null or char_length(v_message) > 5000 then
    raise exception 'Please enter a message (up to 5,000 characters).' using hint = 'invalid_message';
  end if;

  -- At most 5 messages per sender per hour, and 200 in total per hour.
  if (select count(*) from public.enquiries e
      where e.ip_hash = v_ip_hash and e.created_at > now() - interval '1 hour') >= 5
     or (select count(*) from public.enquiries e
         where e.created_at > now() - interval '1 hour') >= 200 then
    raise exception 'Too many messages have been sent. Please try again later.' using hint = 'rate_limited';
  end if;

  insert into public.enquiries (name, email, phone, organisation, subject, message, ip_hash)
  values (
    v_name,
    v_email,
    left(nullif(btrim(p_phone), ''), 40),
    left(nullif(btrim(p_organisation), ''), 200),
    left(nullif(btrim(p_subject), ''), 200),
    v_message,
    v_ip_hash
  )
  returning id into v_id;

  return v_id;
end;
$$;

revoke execute on function public.submit_enquiry(text, text, text, text, text, text, text) from public;
grant execute on function public.submit_enquiry(text, text, text, text, text, text, text) to anon, authenticated;
