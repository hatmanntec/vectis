# VECTIS: Progress log

The running record of what has been built. Newest milestone first.

## Status

| Milestone | Status |
| --- | --- |
| Phase 1: Architecture | Approved (22 Nov 2026) |
| M1: Project skeleton | Done and live on Vercel (22 Nov 2026) |
| M2: Database | Done and live (22 Nov 2026) |
| M3: Authentication | Done (password-only since M3.1) |
| M4: CMS shell, shared parts, Sectors, Audit log | Done (22 Nov 2026) |
| M5: Media Library and Settings | Done (22 Nov 2026) |
| M6: Companies | **Done** (22 Nov 2026), includes database update 0017 |
| M7: Investments | Next |
| M8–M11: remaining CMS modules | — |

## M6: Companies (22 Nov 2026)

**Built**

- **Companies module** (`/admin/companies`, `features/companies/`)
  - **Kind of company:** Parent organisation / VECTIS business / Subsidiary / Outside company, each with a plain explanation.
  - **"Sits under":** builds the group tree (VECTIS → its businesses). The parent field is switched off for the parent organisation.
    Loops (A under B under A) are refused with a clear message. A currently archived parent stays selected, so saving never drops it.
  - **Content:** year established, short description, a full description in the new formatted-text editor, sectors (tick
    several, choose the main one), logo, cover image, contact details, search-engine fields and display order.
  - **Links with other companies:** strategic partner, joint venture, affiliate or other, with description and dates, and a
    Show/Hide switch for the website. A link appears publicly only when both companies are published.
    Links never imply ownership.
  - **Gallery** (public images, in order) and **Supporting documents** (public or private), added from the library
    or uploaded on the spot, re-ordered with arrows, and removed (the file stays in the library).
  - **Publishing** panel: publish, unpublish, archive, restore, delete permanently. Delete is refused while companies,
    investments or projects depend on the company, and the dialog says exactly what blocks it.
  - **List:** logo thumbnails, kind, "sits under", status; search; filters by kind and status; sorting; pages.
- **Database update 0017** `set_company_sectors()`: saves a company's sectors and main sector in one step.
  It runs with the administrator's own permissions and checks `is_admin()`.
- **New shared parts** for the remaining modules:
  - `components/cms/rich-text-editor.tsx`: headings, bold, italic, lists, quotes and links (Tiptap). It saves structured
    JSON; `lib/cms/rich-text.ts` rebuilds it on the server, keeping only allowed formatting and safe link addresses.
  - `components/cms/publishing-panel.tsx`: the Publishing box, now also used by Sectors.
  - `components/cms/attachments-panel.tsx` + `features/media/link-actions.ts`: galleries and documents for any record.
  - `components/cms/action-form.tsx`: see the fixes below.
  - The media picker can now choose documents (PDF, Word, Excel; public or private) as well as images.

**Problems found by testing and fixed**

- **Forms were emptied after a validation error** (React 19 behaviour), which affected every form, including login.
  All 8 forms now use `ActionForm`, which keeps what was typed.
- **The editor lost the first letter typed after clicking a toolbar button.** Fixed.
- **Signed-in pages logged warnings while Next.js pre-loaded them in the background** (the Supabase login check reads the
  current time). Signed-in pages are now always prepared per visit (`connection()` in `lib/supabase/server.ts`), and the server log is clean.
- **The editor's link button had the same name as "Add link"** in the links panel, which is confusing for screen readers. Renamed.
- **An archived parent company disappeared from the "Sits under" list**, so saving would have removed it. Fixed.

**Checked before delivery**

- Database: 60 earlier checks plus 9 new ones for `set_company_sectors()`: replacing the list, moving the main sector,
  a refused call changing nothing, non-admins and the public refused, and changes audited. The CLI push was rehearsed.
- **34 browser checks for Companies**, plus the earlier suites re-run: sign-in 23, M4 45, M5 38. All pass.

## M5: Media Library and Settings (22 Nov 2026)

**Built**

- **Media Library** (`/admin/media`, `features/media/`)
  - Upload by drag-and-drop or by choosing files, several at once. Each file is marked **Public (website)** or
    **Private (administrators only)**.
  - Files go straight from the browser to Supabase Storage, so large files don't pass through Vercel. The server
    then checks and records each one. If recording fails, the stored file is removed again.
  - Accepted: JPG, PNG and WebP images up to 10 MB, and PDFs up to 25 MB. Word and Excel files (up to 25 MB) are
    private only. SVG is not accepted. Each file is stored as `category/year/random-id.ext`, so uploads never
    overwrite each other and addresses can't be guessed.
  - The library is a grid of thumbnails with search (file name, alt text, caption) and filters by type and visibility.
  - Each file's page has a preview, details (alt text, caption, type), a public address with a Copy button
    (public files only), and an "Open file" link that expires after 1 hour for private files.
  - **"Where it's used"** lists the companies, sectors, settings, galleries and so on that use the file.
    A file in use can't be deleted: the button is replaced by an explanation, and the database refuses as well.
    Deleting an unused file removes both the library entry and the stored file.
- **Choose-image picker** (`components/cms/media-picker.tsx`): a reusable form field that opens a dialog of
  public images with search and pages, plus "upload a new image" on the spot (the new image is selected
  automatically). It's used for the sector cover image and the two settings images, and will be used for all
  later modules.
- **Settings** (`/admin/settings`, `features/settings/`): website name, tagline, an approved alternative logo
  (optional; the official master logo is used otherwise), contact email, telephone and address, social media
  links (LinkedIn, X, Facebook, Instagram, YouTube; full https addresses only, empty ones aren't stored),
  default search title and description, and the default sharing image.
- **Sectors:** a cover image field.
- `next.config.ts`: the Next.js image optimiser may load public files from Supabase Storage (ready for the public website).

**Checked before delivery**

- Type-check, lint and production build pass.
- **38 automated browser checks, passed on repeated runs**, against the real VECTIS schema, with storage
  rules enforced by the database through a test stand-in for Supabase Storage:
  - multi-file upload; the recorded image size; the random stored name; thumbnails; the public address working
  - wrong file types and oversized files refused with reasons, and nothing stored for them
  - private Word file: no public address, opened through an expiring link
  - an anonymous upload straight to storage refused
  - editing alt text, search and filters
  - settings validation (email, https links), saving, the picker showing only public images
  - a file in use: shown in "Where it's used", delete not offered, and refused by the database too
  - uploading inside the picker for a sector cover
  - deleting an unused file removes the stored file too; audit entries recorded; phone layouts
- Earlier suites re-run and passing: sign-in (23) and M4 (45).
- One test run logged a single secure-connection error from the browser, which did not reappear in
  three further runs. It came from the test browser itself, not from VECTIS code.

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
