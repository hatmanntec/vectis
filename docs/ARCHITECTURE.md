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
