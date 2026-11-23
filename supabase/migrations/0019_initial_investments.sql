-- =====================================================================
-- VECTIS: the two investment relationships named in the client's brief
--   Vectis Global Investment -> Pillar Oil
--   Vectis Oil and Gas       -> Akata Energy
-- Names only: no descriptions, stakes, amounts or dates. The nature is
-- recorded as "Investment relationship" (never ownership); refine it in
-- the CMS once confirmed. Safe to run again: skips anything that exists.
-- All text uses $v$ quoting, so copying can't break it.
-- =====================================================================

-- The two companies invested in (outside companies: they never get a
-- /businesses page on the website).
insert into public.companies (name, slug, classification, status)
values ($v$Pillar Oil$v$, $v$pillar-oil$v$, $v$external$v$, $v$published$v$),
       ($v$Akata Energy$v$, $v$akata-energy$v$, $v$external$v$, $v$published$v$)
on conflict (slug) do nothing;

-- The investments themselves, only if both companies exist.
insert into public.investments (investor_company_id, investee_company_id, nature, nature_note, slug, sort_order, status)
select i.id, e.id, $v$other$v$, $v$Investment relationship$v$, $v$pillar-oil$v$, 1, $v$published$v$
from public.companies i, public.companies e
where i.slug = $v$vectis-global-investment$v$ and e.slug = $v$pillar-oil$v$
on conflict (slug) do nothing;

insert into public.investments (investor_company_id, investee_company_id, nature, nature_note, slug, sort_order, status)
select i.id, e.id, $v$other$v$, $v$Investment relationship$v$, $v$akata-energy$v$, 2, $v$published$v$
from public.companies i, public.companies e
where i.slug = $v$vectis-oil-and-gas$v$ and e.slug = $v$akata-energy$v$
on conflict (slug) do nothing;
