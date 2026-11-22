# VECTIS — Progress log

The running record of what has been built. Newest milestone first.

## Status

| Milestone | Status |
| --- | --- |
| Phase 1: Architecture | Approved for development (22 Nov 2026) |
| M1: Project skeleton | **Done**, waiting for the GitHub repository and the first Vercel deploy |
| M2: Database | Next |
| M3: Authentication | — |
| M4–M11: CMS modules | — |

## M1: Project skeleton (22 Nov 2026)

**Built**

- Next.js 16 (App Router, TypeScript) and Tailwind CSS v4, with colour roles ready for shadcn/ui (its components are added at M3–M4, when first used).
- The VECTIS palette as design tokens in `app/globals.css`. All six colours are available as Tailwind classes (`bg-indigo`, `text-copper`, `border-steel`, …) and mapped to shadcn roles (primary = Midnight Indigo, background = Mineral Ivory, focus ring = Oxidised Copper).
- Self-hosted fonts: Source Serif 4 for headings and IBM Plex Sans for text and interface. There are no calls to Google Fonts.
- `components/brand/logo.tsx`, the single component that displays the master logo. It sizes by width only, so proportions can't be distorted, and it always sits on a white panel until a transparent version is approved.
- A temporary public holding page (logo, one line of text, footer). It contains no organisational content.
- Baseline security headers on every page (no framing, no MIME sniffing, strict referrer, HTTPS-only).
- `.env.example`, `README.md`, `docs/SETUP.md`.

**Checked before delivery:** type-check, lint and production build all pass. The holding page was rendered and inspected at desktop (1280 px) and phone (390 px) widths, and the security headers were confirmed in the response.

**How to test (after Vercel deploys):** open the `.vercel.app` link. You should see the logo, the heading in indigo serif type, a thin copper rule and the footer "© 2026 VECTIS · Est. 1956 · Nigeria".

**Notes**

- Dependency versions are pinned and `package-lock.json` is included, so Vercel installs exactly what was tested.
- If `npm run dev` creates an `AGENTS.md` file, that is Next.js itself; it can be committed.

## Open items

- Corporate profile PDF: needed before Phase 4.
- Approved transparent logo (SVG or PNG) and a white version for dark backgrounds.
