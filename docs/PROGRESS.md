# VECTIS: Progress log

The running record of what has been built. Newest milestone first.

## Status

| Milestone | Status |
| --- | --- |
| Phase 1: Architecture | Approved (22 Nov 2026) |
| M1: Project skeleton | Done and live on Vercel (22 Nov 2026) |
| M2: Database | Done and live (22 Nov 2026) |
| M3: Authentication | Done (password-only since M3.1) |
| M4: CMS shell, shared parts, Sectors, Audit log | **Done** (22 Nov 2026) |
| M5: Settings and Media Library | Next |
| M6–M11: remaining CMS modules | — |

## M4: CMS shell, shared building blocks, Sectors, Audit log (22 Nov 2026)

**Built**

- **CMS frame:** an indigo sidebar with the logo on a white panel, and a slide-out menu on phones.
  Modules not built yet are shown greyed out with their milestone (no dead buttons); switch one on in `lib/cms/nav.ts`.
- **Dashboard:** real counts (companies, investments, projects, published news, drafts, unread enquiries),
  recently changed records and recent activity from the audit trail. There are no invented figures, and empty states show where there's nothing yet.
- **Shared building blocks**, used by every future module:
  - `lib/cms/list.ts`: search, filter, sort and page number kept in the page address (bookmarkable), checked against allow-lists.
  - `lib/cms/results.ts`: plain-English messages for database errors (duplicate web address, record still in use, etc.).
  - `lib/cms/status.ts`: Draft / Published / Scheduled / Archived, Nigerian-time dates, slug generation.
  - `components/cms/`: page header, data table parts (sortable headings, pages), search and filter bar, status badge,
    empty states, loading placeholders, confirmation dialogs, notifications, and form fields with character counters and the auto web address.
  - shadcn/ui: table, badge, alert-dialog, textarea, sheet, dropdown-menu, skeleton, separator; `sonner` for notifications.
- **Sectors module** (`features/sectors/`, `/admin/sectors`): the reference implementation for all later modules.
  List with search, status filter, sorting and pages. Create and edit with validation. Publish, unpublish,
  archive, restore, and permanent delete (archived only, and refused while still in use).
  Sectors was moved into M4 from M5.
- **Audit log viewer** (`/admin/audit-log`): every change, newest first, filter by type and action, search, and
  "old → new" details for each changed field. Read-only.

**Checked before delivery**

- Type-check, lint and production build pass.
- **45 automated browser checks, passed three times in a row**, run against the real VECTIS database schema
  (real security rules, triggers and audit trail) through a test stand-in for Supabase's API:
  - dashboard figures, the sidebar and empty states
  - validation errors, the auto web address, create, a duplicate address refused, edit and save
  - publish and unpublish (confirmed at database level as visible or invisible to the public)
  - archive, the archived filter, restore, delete refused while in use and allowed once unused
  - 25 records across 2 pages, search-as-you-type, sorting both ways
  - audit entries with the administrator's email and old → new values
  - the phone layout and menu, and signed-out and non-admin visitors blocked
- The sign-in tests (23 checks) were re-run on the new layout and still pass.

**How a new module is built** (pattern from Sectors): `features/<module>/schema.ts` (Zod rules),
`queries.ts` (reads, starting with `requireAdmin()`), `actions.ts` (writes, starting with `requireAdmin()`),
`components/<module>-form.tsx`; pages in `app/admin/(cms)/<module>/` (list, `new`, `[id]`), and a sidebar
entry switched on in `lib/cms/nav.ts`.

## M3.1: Password-only sign-in (22 Nov 2026)

Client decision: two-step verification (authenticator app) removed entirely.

- New migration `0016_remove_two_step_requirement.sql`: `is_admin()` now means "signed in with an
  active admin profile". All Row Level Security rules follow automatically.
- Removed the `/admin/setup-two-step` and `/admin/verify` screens, and all authenticator code.
- Login goes straight to the dashboard. Password reset no longer asks for a code.
- **Checked:** 60/60 database checks, including password-only admin access and deactivated admins being
  locked out. The CLI push was rehearsed on a database already at migration 15 (only 0016 applied).
  23/23 browser checks passed twice. Type-check, lint and build pass.

## M3: Authentication (22 Nov 2026)

- `proxy.ts`: runs before every `/admin` request. It renews the login session, sends signed-out visitors to the
  login page, and marks CMS pages "never index, never cache".
- `lib/auth/admin.ts`: `getAdminAccess()` / `requireAdmin()`, the server-side check used by every CMS
  page and action. Also `safeNextPath()`, which stops crafted links from redirecting elsewhere after login.
- `lib/auth/actions.ts`: sign in, forgotten password, new password and sign out. All run on the server with
  Zod validation and deliberately general error messages.
- Screens: `/admin/login`, `/admin/forgot-password`, `/admin/reset-password`, `/admin/no-access`, and
  `/admin/auth/confirm` for reset-email links (both Supabase link formats).
- A CMS frame (header, administrator name, Sign out) and a temporary dashboard page.
- A Content-Security-Policy header site-wide. The strictest "nonce" form isn't compatible with this site's
  caching mode, so inline scripts from Next.js are allowed.
- Not tested here: the real Supabase login service, which this environment didn't allow running. Tests
  used a stand-in that answers like Supabase. The first real test is your first sign-in.

## M2: Database (22 Nov 2026)

**Built**

- 15 migration files in `supabase/migrations/`, applied in order:
  1. `0001_foundations`: allowed-value lists, the `slug` type, automatic timestamps, publication handling, archive-before-delete rule
  2. `0002_admins`: `admin_profiles` and `is_admin()` (two-step requirement later removed by 0016)
  3. `0003_media`: media library records
  4. `0004_settings_and_sectors`: single-row `website_settings`, `sectors`
  5. `0005_companies`: `companies` (classification + parent tree, loop prevention), `company_sectors`
  6. `0006_investments_and_relationships`: `investments`, admin-only `investment_private_details`, `company_relationships`
  7. `0007_projects`: `projects`, `project_milestones`
  8. `0008_news`: `news` (scheduled publishing), `news_companies`
  9. `0009_leadership`: `leadership`, `leadership_affiliations`
  10. `0010_pages_and_enquiries`: `pages` (core pages protected), `enquiries` + `submit_enquiry()` with spam limits
  11. `0011_media_links`: galleries and supporting documents
  12. `0012_audit`: append-only `audit_logs`, written automatically by database triggers
  13. `0013_row_level_security`: who may see and change what
  14. `0014_storage`: `public-media` and `private-files` buckets and their rules
  15. `0015_structural_rows`: the settings row and 8 empty draft core pages (no organisational content)
- `types/database.ts`: TypeScript description of the database, generated by the Supabase CLI.
- `lib/supabase/`: three connection helpers: `server.ts` (signed-in requests), `browser.ts` (interactive CMS screens) and `public.ts` (public website, always anonymous).
- `app/api/health`: reports whether the website can reach the database (`ok` / `error`), nothing more.
- `supabase/config.toml`: settings for the Supabase command-line tool.

**Checked before delivery**

- All 15 migrations were applied to a fresh PostgreSQL database set up to behave like Supabase. This was done twice: with and without Supabase's automatic table permissions.
- The exact `supabase db push` command was rehearsed with CLI 3.2.0, and a second run correctly reports "up to date".
- **59 automated checks passed**, including:
  - visitors see only published content; scheduled news stays hidden until its time
  - an investment stays hidden while either company is unpublished
  - confidential investment figures, private files, enquiries and the audit trail are never public
  - signed-in non-admins cannot change anything
  - group-tree loops and self-links are refused
  - deleting needs archiving first; companies with investments or projects can't be deleted; files in use can't be deleted; core pages can't be deleted
  - every change is logged with who, what and the changed fields; nobody can edit or delete the log
  - the contact form accepts valid messages, refuses bad emails and limits repeat sending; raw IP addresses are never stored
  - only admins can upload files, and the public can't list stored files
- `/api/health` was tested without settings (`not configured`) and with an unreachable database (`error`).
- Type-check, lint and production build all pass.

**How to test:** follow `docs/SETUP.md` Parts 3 and 4. The final check is `/api/health` showing `{"database":"ok"}`.

## M1: Project skeleton (22 Nov 2026)

- Next.js 16 (App Router, TypeScript) and Tailwind CSS v4, with colour roles ready for shadcn/ui (its components are added at M3–M4, when first used).
- The VECTIS palette as design tokens in `app/globals.css` (`bg-indigo`, `text-copper`, …).
- Self-hosted fonts: Source Serif 4 (headings) and IBM Plex Sans (text and interface).
- `components/brand/logo.tsx`: the only component that displays the unmodified master logo.
- A temporary holding page, and baseline security headers on every page.

## Open items

- Corporate profile PDF: needed before Phase 4.
- Approved transparent logo (SVG or PNG) and a white version for dark backgrounds.
