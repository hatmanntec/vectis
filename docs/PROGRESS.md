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
| M6: Companies | Done (22 Nov 2026), includes database update 0017 |
| M7: Investments | Done (22 Nov 2026), no database update |
| M8: Projects | Done (22 Nov 2026), no database update |
| M9: News & Media | Done (22 Nov 2026), no database update |
| M10: Leadership, Website Pages, Enquiries | Done (22 Nov 2026), no database update |
| M11: Final CMS review and test pass | **Done** (22 Nov 2026), no database update. **The CMS is complete.** |
| Phases 4–7: Public website, SEO, accessibility, launch readiness | **Done** (23 Nov 2026), no database update |
| Initial website content | **Ready** (23 Nov 2026): database update 0018, applied with `db push` |
| Initial investments | **Ready** (23 Nov 2026): database update 0019 (Pillar Oil, Akata Energy; names only) |
| Redesign, Stage 1: Foundations | **Done** (23 Nov 2026): fonts, design tokens, header with menus, footer with logo |
| Redesign, Stage 2: Home page | **Done** (23 Nov 2026), no database update |
| Redesign, Stage 3: Businesses | **Done** (23 Nov 2026), no database update |
| Redesign, Stage 4: Investments and Industries | **Done** (23 Nov 2026), no database update |
| Redesign, Stage 5: Inner pages | **Done** (23 Nov 2026), database update 0020 (governance loop) |
| Redesign, Stage 6: Quality pass | **Done** (23 Nov 2026) |
| Scroll-reveal motion system | **Done** (23 Nov 2026) |
| Still to enter in the CMS | Leadership, projects, news, contact details, licensed stock photos |

## Fix: content stayed hidden after moving between pages (23 Nov 2026)

**The fault.** Moving to another page from the menu left most of the new page invisible, however far you scrolled.
Only a full refresh brought it back.

**The cause.** The scroll reveals marked each element as "already being watched". Moving between pages without a
refresh lets the browser reuse the same elements for the new page's content, and those reused elements still
carried the mark, so the watcher skipped them and they were never revealed.

**The fix.** The mark is gone. On every pass the watcher simply watches everything still waiting to be revealed
(watching the same element twice does nothing), so reused elements are always picked up. Changes that arrive
together are now handled in a single pass per frame rather than one at a time.

Tested: from the home page, scrolling down and then moving to Our Businesses, About, Projects and News in turn,
nothing visible is left hidden, on both a desktop and a phone screen. Added to the test suite as check 13g.

## "On this page" index beside the text (23 Nov 2026)

Inner pages left a wide empty column beside the main text, which made short pages look unfinished. Now:

- A page whose text has **two or more headings** shows an index of them in that column ("On this page"), numbered
  and linked, which follows the reader down the page. It is built from the headings typed in the CMS, so adding or
  renaming a heading changes it automatically.
- A page with **fewer headings** has no index, and its text starts at the left instead of leaving the space empty.
- Applies to About, Governance, the Foundation, Corporate History, extra pages, Our Businesses and Investments.

## Menu items link to their own pages (23 Nov 2026)

**About** and **Businesses** in the main menu used to open a list only. Each is now a link straight to its page
(`/about`, `/businesses`), with a separate arrow beside it that shows and hides the list of pages under it. The
same on phones: tapping the name goes to the page, tapping the arrow opens the list. The arrow is 44 px, a
comfortable tap size. If the group's own page is ever unpublished, the item goes back to opening the list only,
so the menu still never links to an empty page. Keyboard use is unchanged: the arrow or the down key opens the
list, the arrow keys move through it, Esc closes it.

## Speed and search follow-up (23 Nov 2026)

- **Detail pages built ahead of time:** every published business, investment, project, news item, leadership
  profile and extra page is now prerendered at deploy (`generateStaticParams`). Their description tag sits in the
  page head for every visitor, and they appear without a loading step. New items published later are built on
  their first visit, and CMS edits still refresh them at once.
- **Heading font preloaded:** Fraunces is served from `public/fonts` (with its SIL Open Font License) and preloaded
  on public pages, so headings appear in Fraunces sooner.
- **Tab icon:** the master logo file, unaltered, replaces the missing `favicon.ico`.
- **Reveals start after the web fonts load**, so "already on screen" is judged on the final layout.
- **Lighthouse (mobile)** after these changes: business profile, Investments and the investment profile 100 in all
  four; Governance 99/100/100/100; Businesses 96/100/100/100; Home 94–100 between runs. The Foundation page scored
  84 for performance in Lighthouse's simulation, but its largest element actually appears in 0.26–0.59 s on a
  phone-sized screen with a 4× slower processor.

## Redesign Stages 5 and 6, and the motion system (23 Nov 2026)

**Stage 5, inner pages.** About (values as a numbered list, links to the rest of About), Corporate History (a
vertical timeline with large dates), Governance (with the accountability loop drawn as a circle of arrows), the
Foundation and other extra pages, Contact (details beside the form; same fields and behaviour), News and articles,
Projects and project pages, Leadership and profiles, and the not-found page. All use the new page band with a
breadcrumb; cards for projects, news and people are restyled (hairline, Fraunces title, copper rule on hover).

**One CMS addition and one database update:** the Governance page gains an "Accountability loop" list (stages in
order). `0020_governance_loop.sql` fills it with the four stages from the profile (Board and Executive, Investment
and Risk, Finance and Treasury, Compliance and Audit), only if the list is empty. Safe to run again.

**Motion system** (see ARCHITECTURE.md): text rises and fades, pictures open with a soft mask, cards and rows unfold
in sequence, section rules draw in, and the home hero and every page band have an entrance on load. Once per item,
off under reduced motion, and invisible to search engines and visitors without JavaScript.

**Stage 6, quality pass** (real content, production build):
- 15 routes at 375, 768, 1024 and 1440 px: no sideways scrolling, no browser errors, axe (WCAG 2.1 AA) clean after
  animations settle, layout shift under 0.1 everywhere, visible focus on every element reached by Tab.
- Lighthouse (mobile): Home 99/100/100/100 (performance, accessibility, best practices, SEO), Businesses 100s,
  Investments 100s, About 98/100/100/100, a business profile 92/100/100/92 (see Remaining issues in the report).
- Suites: public site 96 checks (6 new for motion), CMS suites, both accessibility scans, database rules 60,
  0017 9, 0018 12; 0020 tested fresh, repeated and with an edited list.

## Redesign Stage 4: Investments and Industries (23 Nov 2026)

**No CMS or database change.**

- **Investments** (`/investment-philosophy`): page band, the philosophy text, the principles as four numbered
  columns, the full relationship map on indigo (with its text version), then one entry per investment: investor,
  company invested in, nature and status in VECTIS's words, summary and logo when entered.
- **Investment profile** (`/investments/<name>`): an indigo band with the lineage and a drawing of the relationship:
  the VECTIS business in a solid box, the company invested in in a dashed box, the nature on the line between. Then
  the description (when entered) and a facts rail. The company invested in is never linked as a VECTIS business.
- **Industries** (new, `/industries`): every published sector with its description, picture (when uploaded) and the
  VECTIS businesses in it, plus a "jump to" index. Each sector has its own anchor (`/industries#oil-and-gas`), used
  by the home page. Added to the menu (between Businesses and Investments) and the sitemap, shown only when at
  least one sector is published. Its title and one-line lead are fixed in the code, since no CMS page exists for it.
- **Contrast fix:** small index numbers (01, 02 …) are now indigo instead of copper, which falls below the 4.5:1
  minimum on ivory. Copper stays for rules, lines and marks.

**Tested:** public site 90 checks (4 new: map text version, solid/dashed investment drawing, Industries content,
Industries in the sitemap; the accessibility scan now covers /industries), all CMS suites and both accessibility
scans pass, plus an axe scan of six redesigned pages with the real content (no issues). Pages at 375, 768, 1024
and 1440 px: no sideways scrolling, no browser errors.

## Redesign Stage 3: Businesses (23 Nov 2026)

The business directory and the business profile pages. **No CMS or database change.**

- **Directory** (`/businesses`): a new page band (breadcrumb, title, lead) and the businesses grouped by cluster,
  each cluster's name beside its list. Each business is a row: Fraunces name, one line, its sectors in mono, and a
  copper rule that draws in on hover or keyboard focus. A logo shows only when one is uploaded (no more doubled
  names). The industry filter is still a set of plain links, so it works without JavaScript and each filtered view
  has its own address; screen readers hear how many businesses are shown.
- **Profile** (`/businesses/<name>`): a header band in the cluster's colour (indigo for investment, teal for
  energy, graphite otherwise), with the lineage VECTIS › Businesses › cluster › business. The description sits in a
  reading column beside a facts rail (mono labels, hairlines, sticky on desktop). Then group companies,
  investments, partnerships, projects, leadership, gallery, documents and news when published, and **related
  businesses** from the same cluster.
- **Shared pieces** (`editorial.tsx`): `PageHero`, `Crumbs` and `Block`, used by later stages. `Facts` and `Tag`
  in `bits.tsx` now use the mono label style everywhere.

**Tested:** public site 86 checks (2 new: lineage, grouping by cluster), all CMS suites and both accessibility
scans pass; directory, a filtered view and four profiles at 375, 768, 1024 and 1440 px with the real content, with no
sideways scrolling and no browser errors.

## Redesign Stage 2: Home page (23 Nov 2026)

The home page rebuilt as one story in sections of different shapes. **No CMS or database change**: every word
still comes from the CMS, and a section with nothing published behind it is left out (section numbers close up).

1. **Hero** (indigo, full screen height): the Home page's main heading and supporting line, and the VECTIS value
   chain (Capital → Assets → Operations → Markets → Impact) drawn as a copper line. If a banner image is uploaded
   (CMS > Website Pages > Home > Banner image), it appears behind the text in indigo duotone.
2. **Heritage** (ivory): an outsized "1956" beside the Introduction heading and text, linking to Corporate History.
3. **Five clusters** (white): the Home page's Highlights as an index, 01–05. A cluster whose name matches one of
   the five clusters opens (hover, tap or keyboard) to list its businesses.
4. **Businesses** (ivory): a directory grouped by cluster. On large screens a detail panel follows the pointer or
   keyboard focus; on phones and tablets it is an accordion.
5. **Investments** (indigo): the relationship map, drawn from published investments (`relationship-map.tsx`,
   reused in Stage 4). VECTIS businesses are solid boxes, companies invested in are dashed, so nothing suggests
   ownership. A text list underneath is the version for screen readers, keyboards and phones. The four principles
   from the Investment Philosophy page sit beside it.
6. **Industries** (white): the sectors as a compact numbered index, each with the businesses in it.
7. **Projects and news** (ivory, only when published): one featured item large, the rest as a short list.
8. **Partnership** (graphite): the Home page's Closing invitation and a Contact button.

Not built: the "ring of counterparties" from the proposal. The seven kinds of partner live inside the Closing
invitation's sentence, and drawing them as a ring would mean copying that text into the code, where the CMS couldn't
edit it.

**Tested:** public site 84 checks (4 new: relationship map, value chain, section names, reduced motion), all CMS
suites and both accessibility scans pass; home page at 375, 768, 1024 and 1440 px with the real content, no
sideways scrolling and no browser errors. The test database stand-in had a fault that stalled builds when many
pages loaded at once (now fixed; it was in the test tools, not the website).

## Redesign Stage 1: Foundations (23 Nov 2026)

The public website's design system, header and footer. **The CMS and its look are unchanged.** One database update
ships with this stage: `0019_initial_investments.sql` (Pillar Oil and Akata Energy, names only).

- **Fonts:** Fraunces (headings, upright, wonky letters off), IBM Plex Sans (text), IBM Plex Mono (labels, index
  numbers, dates). All self-hosted from npm. The CMS keeps Source Serif 4: the public layout adds the `site` class,
  which switches the serif to Fraunces only there.
- **Design tokens** (`app/globals.css`, under `.site`): square corners, Steel Mist hairlines, a copper focus ring on
  every link and button, the type scale (`t-hero`, `t-h1`, `t-h2`, `t-h3`, `t-lead`, `t-body`, `t-label`), a
  12-column grid (`grid-12`, 1200 px, 24 px gutters) and section spacing (`section-y`, 64/96/128 px).
- **Scroll reveal:** add `className="reveal"` to fade a block up 12 px as it scrolls into view
  (`features/public/components/reveal.tsx`). Nothing is hidden without JavaScript, and nothing moves when the
  device is set to reduce motion.
- **Business clusters** (`features/public/clusters.ts`): the profile's five clusters, each defined by its sectors.
  A business joins the cluster of its **main sector** (set in the CMS). Vectis Sports' main sector (Sports and
  recreation) isn't placed in a cluster by the profile, so it shows under "Other businesses" until you decide.
- **Header:** a thin "Since 1956 · Nigeria" line with a Contact link, then the logo and the menu. It stays at the
  top and slims down on scroll. **About** (Overview, Corporate History, Governance, Leadership, extra pages such
  as the Foundation) and **Businesses** (every published business, by cluster) open full-width panels: on hover,
  click or tap, and by keyboard (Enter, arrows, Home/End, Esc). Links still appear only for published content.
- **Phone and tablet menu:** full screen, groups as accordions, 48 px+ targets, focus kept inside, Esc to close.
- **Footer:** on Mineral Ivory, with the real logo on a white panel, contact details, a sitemap in columns and
  "Est. 1956 · Nigeria".

**Tested:** public site 80 checks (menus by mouse, keyboard and phone; footer logo; axe accessibility scan),
CMS suites (auth 23, M4 45, M5 38, M6 34, M7 43, M8 37, M9 45, M10 52) and the CMS accessibility scan (30 screens)
all pass. Screenshots at 375, 768, 1024 and 1440 px with the real content: no sideways scrolling on 11 pages.

## Initial website content (23 Nov 2026)

Database update `0018_initial_content.sql` loads VECTIS's first content, written from the VECTIS Group corporate
profile (Oct 2026) and the master brief, with "Vectis Group" written as "VECTIS" throughout. It is applied with
`supabase db push`, like other database updates. Everything it loads is **published**. (A first version meant for
pasting into the SQL Editor failed there: copying had turned straight quotes into curly ones. All text in the file
now uses $v$…$v$ quoting, so even a pasted copy can't break.)

- **Settings:** tagline ("Diversified investments. Integrated industries. Sustainable growth.") and SEO defaults.
- **Industries:** the profile's fifteen sectors, each with a one-line description.
- **Companies:** VECTIS (parent organisation, est. 1956) and ten businesses under it. That is the brief's eight,
  plus VECTIS Capital and VECTIS Holdings, which the profile lists among the investment platforms. Each has a short
  and a full description drawn from what the profile says about its platform or cluster, plus its sectors.
- **Pages:** Home, About VECTIS, Corporate History, Our Businesses, Investment Philosophy, Governance and Contact,
  plus an extra page for the VECTIS Foundation (/foundation).
- **Written to fill gaps (please review):** the About page's five values, the Home page's linking sentences, and
  the Contact page's thank-you message. These are drawn from themes in the profile, not quoted from it.
- **Not included:** companies invested in (Pillar Oil, Akata Energy), leadership profiles and the Leadership page,
  projects, news, contact details (the profile has placeholders) and photos.
- **Safe to run again:** it never overwrites anything already entered (pages are filled only while still empty)
  and never creates duplicates.
- **Tested:**
  - 12 checks in `test_0018`, plus the original 69 structure checks;
  - applying it twice;
  - a copy with every quote turned curly;
  - a rehearsal of `supabase db push` itself;
  - opening and saving every loaded record in the CMS.

Code change in the same release: the business lists (home page and /businesses) now show VECTIS's businesses only.
VECTIS itself keeps its own page at /businesses/vectis.

## Phases 4–7: Public website (23 Nov 2026)

The public website is built and reads everything from the CMS. Nothing on it is invented: each page shows
only what has been entered and published, and menu items appear by themselves once there is something to show.

**Pages**

- **Home:** opening banner (heading, supporting line, banner photo), introduction, highlights, industries
  (published sectors), businesses, projects, latest news (featured first), closing invitation. Until Home is
  published, the original holding page is shown.
- **About**, **Corporate History** (key dates as a timeline), **Governance**, **Investment Philosophy**
  (principles and published investments), **Leadership** (grouped Board / Executive / Management),
  **Contact**, and **extra pages** (e.g. /privacy-policy).
- **Businesses** (`/businesses`, filter by industry) and a page per VECTIS business (`/businesses/<address>`):
  description, facts, sectors, group companies, investments made or received, partnerships shown in the CMS,
  projects, people and their roles, gallery, public documents and related news.
- **Investments** (`/investments/<address>`): investor, company invested in, the nature in VECTIS's words,
  status, date if confirmed. Confidential figures are never available to the website (database rule).
- **Projects** (`/projects`, grouped by stage) and project pages with the timeline and a map link.
- **News** (`/news`, filter by kind, pages of 12) and articles. Scheduled items appear by themselves at their time.
- **Leadership profiles** (`/leadership/<address>`) with biography and roles.
- A clear **not-found** page.

**Rules built in**

- **No implied ownership:** outside companies never get a page under /businesses. They appear only as the
  company invested in, with VECTIS's own description of the relationship.
- **Only published content**, read as an anonymous visitor, so the database itself refuses drafts, archived
  records, private files, confidential figures and enquiries.
- **Logo:** the master logo is shown exactly as supplied, on the white header. If an approved alternative logo is
  chosen in Settings, it is used instead, with no code change needed.

**Contact form:** name, email, telephone, organisation, subject, message. Checked on the server and again by the
database (`submit_enquiry`). Each sender is limited to 5 messages an hour; a hidden field quietly ignores spam
bots. Messages arrive in the CMS under Enquiries. The thank-you message can be set on the Contact page in the CMS.

**Speed and freshness:** pages are built in advance and kept up to date in the background. Every change made in
the CMS refreshes the website straight away (`lib/cms/site-cache.ts`), and everything is refreshed at least
every minute, so scheduled news appears on time.

**Search engines and sharing:** a title, description and sharing image on every page (each page's SEO fields,
falling back to Settings); canonical addresses; `/sitemap.xml` listing every published page; `/robots.txt`
keeping search engines out of /admin; organisation details (JSON-LD) on the home page.

**Accessibility:** a skip-to-content link, a keyboard-friendly phone menu, alt text from the media library,
and every public page scanned clean against WCAG 2.1 AA.

**Tested:** 70 public-site browser checks, including:
- privacy: no drafts, confidential figures or outside-company business pages;
- CMS changes appearing straight away, and scheduled news appearing by itself;
- the contact form, spam trap and rate limit;
- the sitemap and robots.txt;
- the layout on a phone screen;
- the accessibility scan.

All CMS suites re-run and passing.

**Still to supply** (no code change needed): the corporate profile content (entered in the CMS) and, when
approved, a transparent logo (upload it and choose it under Settings → Approved alternative logo).

## M11: Final CMS review and test pass (22 Nov 2026)

**Reviewed**

- **Security:** every action that changes data checks the administrator first. The only exceptions are sign-in,
  password reset and sign-out, which must work while signed out. No secret (service-role) key is used anywhere in
  the app. Every database table has its access rules switched on, and every content table is recorded in the
  audit trail.
- **Consistency:** the audit log, dashboard and media library know about every module.

**Improved**

- **Audit log** entries now link to the record they describe (except deleted ones).
- **Accessibility:** every CMS screen (30 in total, including sign-in) was scanned with axe-core against WCAG 2.1
  A/AA, and now has no issues. Fixes: the side menu's group headings had slightly too little contrast, and the
  inactive Previous/Next page buttons were too faint to read.
- **New guide:** `docs/CMS-GUIDE.md`, a plain-English guide to using the CMS, including the order for entering content.

**Tested:** all suites on the final build. Browser: 317 of 317 (sign-in 23, M4 45, M5 38, M6 34, M7 43, M8 37,
M9 45, M10 52). Database rules: 69 of 69. Accessibility: 30 of 30 screens clean.

## M10: Leadership, Website Pages, Enquiries (22 Nov 2026)

Every CMS module is now built; nothing in the menu is greyed out.

**Built**

- **Leadership** (`/admin/leadership`, `features/leadership/`)
  - Full name (with titles), web address, position, group (Board of Directors / Executive leadership /
    Management), display order within the group, biography, portrait and search-engine fields.
  - **Roles in companies:** add a company with the person's role there, rename the role in place, reorder, remove.
    A company can only be added once. Visitors see roles only for published companies.
  - List: board first by default; filter by group and status; search by name or position.
  - Company pages now list the people with a role in the company.
- **Website Pages** (`/admin/pages`, `features/pages/`)
  - The 8 core pages, each with its own fields (`features/pages/templates.ts`): e.g. Home has an opening banner,
    introduction, highlights and a closing invitation; History has key dates; Investment Philosophy has principles.
    Every field starts empty. Repeatable lists can be added to, reordered and trimmed.
  - Only the fields a page defines are saved, each checked on the server (lengths, formatted text, images).
  - Core pages can be unpublished but never archived or deleted (also enforced by the database).
  - **Extra pages** (e.g. a privacy policy): title, address, introduction, main text, image. Addresses the website
    already uses (about, news, contact…) are refused. They can be archived and deleted.
  - Sharing image and search-engine fields on every page.
  - Images used in page fields are shown in the media library's "Where it's used" and can't be deleted there.
- **Enquiries** (`/admin/enquiries`)
  - Inbox of Contact-page messages; unread ones are highlighted with a dot and counted on the dashboard.
  - Opening a message marks it read; "Mark as unread", "Reply by email" (opens your email program with the
    subject filled in) and "Delete" (after confirming).
  - Search across name, email, organisation, subject and message; filter read/unread.
  - Only administrators can read enquiries; the public can only send them (database rules from M2).
- **Shared parts:** the Publishing box takes `allowArchive={false}` for records that can only be unpublished.

**Fixed during testing:** "Mark as unread" was immediately undone by the page marking the message read again.

**Tested:** 52 new browser checks; all earlier suites re-run and passing (database 60 + 9, sign-in 23, M4 45,
M5 38, M6 34, M7 43, M8 37, M9 45).

## M9: News & Media (22 Nov 2026)

**Built**

- **News & Media module** (`/admin/news`, `features/news/`)
  - **Kinds:** article, press release, announcement, industry update, company news.
  - Headline and web address (follows the headline until changed), author or source, excerpt, full text in the
    formatted-text editor, cover image, gallery, supporting documents (e.g. the press release PDF) and search-engine fields.
  - **Featured** switch, marked in the list and filterable.
  - **Companies mentioned:** tick any number of companies (with a filter box when there are many). Archived companies
    aren't offered, except ones already tagged. Visitors only see tags for published companies.
  - **Scheduling and back-dating** (in the Publishing box, "Schedule or back-date…"): choose a date and time in
    Nigeria time. A future time schedules the item: it shows as "Scheduled" and appears on the website by itself at
    that moment, with nothing to run. A past time publishes it now with that date (for older press releases).
    Scheduled items offer "Publish now" and "Cancel schedule"; published items offer "Change publication date…".
  - **List:** filters for kind, status (draft / scheduled / published / archived) and featured; search by headline,
    text or author; sort by publication date.
- **Company pages** now list news tagged with the company (latest 20), with a "New item" button that pre-ticks it.
- **Media library:** "Where it's used" now links to news items.
- **Shared parts:** `components/cms/schedule-form.tsx`; the Publishing box takes an optional `schedule` setting.
  Notices for partly failed saves now show as warnings.

**Tested:** 45 new browser checks, including exact times (09:00 Nigeria time is saved as 08:00 UTC), an item appearing
by itself when its time passes, and back-dating. All earlier suites re-run and passing.

## M8: Projects (22 Nov 2026)

**Built**

- **Projects module** (`/admin/projects`, `features/projects/`)
  - **Each project belongs to a business** under Companies, with an optional sector. Archived businesses and sectors
    aren't offered, except one already chosen.
  - **Stage** (planned / in progress / completed / on hold), optional start and end dates (the end can't be before
    the start), summary and full description.
  - **Location:** place name, state (all 36 Nigerian states and the FCT suggested; any text allowed), country
    (Nigeria by default), and an optional map position (latitude and longitude, both or neither) for the future
    project map.
  - **Cover image, gallery and supporting documents**, display order and search-engine fields.
  - **Timeline:** key stages with an optional date and details. Add, edit in place, move up and down, put in date
    order with one click, and remove (after confirming). The timeline shows on the website only when the project does.
  - **Publishing:** a project shows on the website only when it and its business are published; the panel says so
    when the business is still a draft. Archive → delete permanently (the timeline goes with it).
  - **List:** cover thumbnails; search by name, place, state or business name; filters (stage, website status); sorting.
- **Company pages** now list the company's projects, with a "New project" button that presets the business.
- **Media library:** "Where it's used" now links to projects.
- `NameAndSlugFields` can now send the name under another field name (projects use `title`).

**Tested:** 37 new browser checks; all earlier suites re-run and passing (database 60 + 9, sign-in 23, M4 45, M5 38,
M6 34, M7 43).

## M7: Investments (22 Nov 2026)

**Built**

- **Investments module** (`/admin/investments`, `features/investments/`)
  - **Investor:** only VECTIS and its own businesses and subsidiaries (checked again on the server, so a tampered
    page can't choose an outside company). **Invested in:** any company. A company can't invest in itself.
  - **Nature:** portfolio investment, equity stake, joint venture, strategic investment or other, plus an optional
    line in VECTIS's own words (e.g. "Investment relationship"). Nothing in the module implies ownership.
  - **Investment status** (active / pending / exited), optional date (only if confirmed), summary, full description,
    optional logo (falls back to the logo of the company invested in), display order and search-engine fields.
  - **Web address** filled in from the company invested in until you change it; duplicates are refused.
  - **Confidential details** (stake %, amount and currency, internal notes) in a clearly marked panel. They live in a
    separate table the website can never read, even for published investments. An amount needs a currency;
    clearing every field removes the row.
  - **Publishing:** an investment shows on the website only when it and **both** companies are published; the panel
    says which company still needs publishing. Archive → delete permanently (confidential details go with it).
  - **Gallery and supporting documents**, as on companies.
  - **List:** search by either company's name, filters (nature, investment status, website status), sorting, pages.
- **Company pages** now list investments made and received, with a "New investment" button that presets the investor.
- **Dashboard** shows investments as "Investor → Invested in" instead of the web address.
- **Media library:** "Where it's used" now links to investments.
- **New shared part:** `components/cms/select-field.tsx` (labelled drop-down with hint and error).

**Tested:** 43 new browser checks (including that visitors and signed-in non-admins can never read confidential
figures); all earlier suites re-run and passing (database 60 + 9, sign-in 23, M4 45, M5 38, M6 34).

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

## Logo presentation and page-load recovery

**Public website.**

- The logo no longer sits on a white panel. `public/brand/vectis-logo.png`
  is the supplied artwork with its white background made transparent, so the
  mark sits directly on Mineral Ivory or white. The master
  `public/brand/vectis-logo.jpg` is untouched, byte for byte, and the artwork
  itself is not redrawn or recoloured: it is the brand's own Midnight Indigo.
- `public/brand/vectis-emblem.png` is the diamond-and-globe mark on its own,
  used for the browser tab icon, as the brand guide shows.
- `components/brand/logo.tsx` is still the only file that refers to the logo
  files. Sizing is by width only, so the proportions cannot be distorted.
- The white box and hairline behind the footer logo have been removed.

**Page-load recovery.** `app/(public)/error.tsx` now catches the rare case
where a visitor's browser holds a copy of a page from before an administrator
published or changed it, and the two no longer match. Previously the visitor
saw "This page couldn't load" and had to reload by hand. The page now fetches
itself again automatically, and only shows a message if that also fails.

A note for testing: a build made while the database is unreachable bakes
"page not found" into every page, and the website then appears to break on
every menu click. `run_e2e.sh` seeds the database before building for this
reason. This is not a condition that occurs on Vercel, where the database is
always reachable at build time.
