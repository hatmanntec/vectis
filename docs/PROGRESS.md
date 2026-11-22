# VECTIS: Progress log

The running record of what has been built. Newest milestone first.

## Status

| Milestone | Status |
| --- | --- |
| Phase 1: Architecture | Approved (22 Nov 2026) |
| M1: Project skeleton | Done and live on Vercel (22 Nov 2026) |
| M2: Database | Done and live (22 Nov 2026) |
| M3: Authentication | **Done**, waiting for the Supabase login settings and the first administrator (SETUP Part 5) |
| M4: CMS shell and shared parts | Next |
| M5–M11: CMS modules | — |

## M3: Authentication (22 Nov 2026)

**Built**

- `proxy.ts`: runs before every `/admin` request. It renews the login session, sends signed-out visitors to the login page, and marks CMS pages "never index, never cache".
- `lib/auth/admin.ts`: `getAdminAccess()` / `requireAdmin()`, the server-side check used by every CMS page and action (signed out / not an admin / needs two-step / full access). Also `safeNextPath()`, which stops crafted links from redirecting elsewhere after login.
- `lib/auth/actions.ts`: sign in, two-step setup and verification, forgotten password, new password and sign out. All run on the server with Zod validation and deliberately general error messages.
- Screens under `/admin`:
  - `login`: email and password
  - `setup-two-step`: first-time authenticator setup with a QR code or a typed key
  - `verify`: the 6-digit code at every sign-in
  - `forgot-password` and `reset-password`: a reset link, which still needs the code when two-step is set up
  - `no-access`: for signed-in accounts that aren't administrators
- `/admin/auth/confirm`: where reset-email links land. Both Supabase link formats are handled.
- A CMS frame (header with logo, administrator name and Sign out) and a temporary dashboard page. The full dashboard and navigation come in M4.
- A Content-Security-Policy header site-wide. The strictest "nonce" form isn't compatible with this site's caching mode (Next.js documents this), so inline scripts from Next.js are allowed.
- shadcn/ui `button`, `input`, `label`. Libraries: `zod`, `radix-ui`, `class-variance-authority`, `lucide-react`.

**Security rules enforced**

- Public sign-up is off (Supabase setting), and an account becomes an administrator only through the SQL Editor.
- The CMS needs **password + authenticator code**. With a password alone, the CMS stays closed, and adding a second authenticator is refused.
- Non-admin accounts are signed straight back out.
- Password changes need the authenticator code too; new passwords need at least 12 characters.
- The database applies the same checks again (`is_admin()` requires two-step), so even a coding mistake couldn't open the data.

**Checked before delivery**

- Type-check, lint and production build pass.
- **32 automated browser checks passed (twice in a row)** in a real Chrome browser, against a stand-in that answers like Supabase's login service, with real 6-digit authenticator codes:
  - signed-out redirects, a wrong password, and a non-admin refused
  - first-time setup with QR and code, wrong codes refused, the dashboard opening
  - password alone not opening the CMS or adding an authenticator
  - sign out, and later sign-ins asking for the code
  - crafted redirect links ignored
  - forgotten password: the same reply for any email, the link needing the code, password rules, the new password working, links single-use
  - the phone-width layout, and no browser errors
- **Not tested here:** the real Supabase login service. This environment didn't allow running it. The stand-in follows Supabase's documented behaviour, and the first real test is your first sign-in (SETUP Part 5.6). Testing found one real-world issue that is now fixed: Supabase's QR code format can show as a broken image in Chrome, so it's converted to a format every browser displays.

## M2: Database (22 Nov 2026)

**Built**

- 15 migration files in `supabase/migrations/`, applied in order:
  1. `0001_foundations`: allowed-value lists, the `slug` type, automatic timestamps, publication handling, archive-before-delete rule
  2. `0002_admins`: `admin_profiles` and `is_admin()` (active admin **and** two-step login)
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
  - signed-in non-admins, and admins without two-step login, cannot change anything
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
