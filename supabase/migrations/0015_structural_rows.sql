-- =====================================================================
-- 0015 · Structural rows
-- ---------------------------------------------------------------------
-- The minimum the platform needs in order to work. NO organisational
-- content is created here: every page starts as an empty draft, and
-- there are no companies, investments, projects, news or people.
-- =====================================================================

-- The single website settings row.
insert into public.website_settings (id, site_name)
values (1, 'VECTIS')
on conflict (id) do nothing;

-- The core website pages, as empty drafts. Their text is written in the
-- CMS. These pages cannot be deleted, only unpublished.
insert into public.pages (page_key, template, title, is_system)
values
  ('home',                  'home',                  'Home',                  true),
  ('about',                 'about',                 'About VECTIS',          true),
  ('history',               'history',               'Corporate History',     true),
  ('businesses',            'businesses',            'Our Businesses',        true),
  ('investment-philosophy', 'investment-philosophy', 'Investment Philosophy', true),
  ('governance',            'governance',            'Governance',            true),
  ('leadership',            'leadership',            'Leadership',            true),
  ('contact',               'contact',               'Contact',               true)
on conflict (page_key) do nothing;
