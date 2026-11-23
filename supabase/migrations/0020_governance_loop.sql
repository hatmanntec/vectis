-- =====================================================================
-- VECTIS: the four stages of the governance accountability loop
-- Source: the VECTIS corporate profile ("Accountability loop":
-- Board & Executive, Investment & Risk, Finance & Treasury,
-- Compliance & Audit), as already described on the Governance page.
-- Fills the Governance page's new "Accountability loop" list, which the
-- website draws as a diagram. Only adds it if the list isn't there yet,
-- so it never overwrites anything entered in the CMS. Safe to run again.
-- =====================================================================
update public.pages
set content = content || jsonb_build_object(
  $v$loop$v$,
  jsonb_build_array(
    jsonb_build_object($v$heading$v$, $v$Board and Executive$v$, $v$text$v$, $v$$v$),
    jsonb_build_object($v$heading$v$, $v$Investment and Risk$v$, $v$text$v$, $v$$v$),
    jsonb_build_object($v$heading$v$, $v$Finance and Treasury$v$, $v$text$v$, $v$$v$),
    jsonb_build_object($v$heading$v$, $v$Compliance and Audit$v$, $v$text$v$, $v$$v$)
  )
)
where page_key = $v$governance$v$
  and not (content ? $v$loop$v$);
