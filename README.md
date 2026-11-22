# VECTIS: Corporate Platform & CMS

The VECTIS corporate website and its content management system.

- Next.js 16 (App Router) + TypeScript
- Supabase: database, login, file storage
- Tailwind CSS v4 + shadcn/ui
- Hosted on Vercel

## Documents

- `docs/CMS-GUIDE.md`: how to use the CMS (for the administrator)
- `docs/SETUP.md`: accounts, environment variables, deploying, database updates
- `docs/ARCHITECTURE.md`: how the system is put together
- `docs/PROGRESS.md`: what has been built, milestone by milestone

CMS modules follow one pattern: see "How a new module is built" in `docs/PROGRESS.md`.

Brand rules: the name is always **VECTIS**. The logo in `public/brand/vectis-logo.jpg`
is never edited, recoloured, cropped or redrawn. Colours are defined once, in `app/globals.css`.
