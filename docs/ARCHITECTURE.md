# VECTIS — Architecture summary

The full, reviewed architecture (with diagrams and the complete table list) is the
"VECTIS CMS — Phase 1 Architecture" document shared in Claude. This file is the short
version kept with the code.

## Shape

- One Next.js app on Vercel: the CMS under `/admin`, and the public site at `/`.
- One Supabase project: Auth (login), PostgreSQL (all content), Storage (files).
- The public site reads only published rows. The CMS writes through server actions.

## Security: three independent layers

1. `proxy.ts` redirects anyone not signed in away from `/admin`. This is a convenience.
2. `requireAdmin()` runs on the server in the CMS layout and at the start of every server action.
3. Row Level Security in PostgreSQL refuses admin reads and writes unless `is_admin()` is true.

The Supabase service-role key is never used by the application.

## Data model rules

- Every organisation (VECTIS, its businesses, subsidiaries, outside companies) is a row in `companies`, with a `classification` and an optional `parent_company_id`.
- Investments (`investments`) and other links (`company_relationships`) are separate records. A link never implies ownership.
- Confidential investment figures live in the admin-only `investment_private_details`.
- Content tables share `status` (draft / published / archived), `published_at`, `slug`, SEO fields and timestamps.
- Deleting a company is refused while investments or projects reference it. Archive instead.
- Every change is recorded by database triggers in the append-only `audit_logs`.

## Publishing

Draft → Published (Scheduled if `published_at` is in the future) → Unpublish returns to Draft.
Archive hides a record everywhere, Restore returns it as a Draft, and Delete is offered only for archived records.

## Sign-in

Password-only (client decision, 22 Nov 2026). `is_admin()` = signed in + active row in `admin_profiles`.
Public sign-up is disabled in Supabase; administrators are added only through the SQL Editor.

## Public site design and motion

- **Design system:** `app/globals.css` (under `.site`) and `features/public/components/editorial.tsx`: Fraunces,
  IBM Plex Sans and IBM Plex Mono; the type scale (`t-hero` … `t-label`); square corners; hairlines; the page band
  (`PageHero`), breadcrumb (`Crumbs`), section header (`SectionHead`) and block (`Block`). The CMS doesn't use `.site`.
- **Clusters:** `features/public/clusters.ts` maps sectors to the profile's five clusters; a business follows its
  main sector.
- **Motion** is CSS plus one small client component (`reveal.tsx`, an IntersectionObserver), not a motion library:
  - `reveal` (text and blocks: fade and rise 20 px, 700 ms), `reveal-image` (pictures: a mask opening upwards and a
    104% → 100% settle, 800 ms), `draw-x` (rules that draw from the left after their block).
  - Items entering together are staggered in reading order, 90 ms apart, capped at 450 ms. Each item animates once.
  - Page entrances (`enter`, `enter-draw`, `enter-step`, `enter-settle`) are CSS keyframes that play on load.
  - Content is hidden only after JavaScript starts (`html.reveal-ready`) and anything already on screen is shown at
    once, so the server HTML is complete for search engines and nothing goes missing without JavaScript.
  - `prefers-reduced-motion: reduce` switches every reveal and entrance off.
  - Why not Motion for React: the public pages are server components; Motion would turn many of them into client
    components, add a library to every page, and write hidden starting styles into the server HTML.
