import Link from "next/link";
import { cacheLife } from "next/cache";
import { Logo } from "@/components/brand/logo";
import { getSettings, getSiteMap, listBusinesses } from "../data";
import { groupLinks, isGroup, mainNav, type NavLink } from "./nav";
import { Container, PublicImage } from "./bits";

const SOCIAL_LABEL: Record<string, string> = {
  linkedin: "LinkedIn",
  x: "X (Twitter)",
  facebook: "Facebook",
  instagram: "Instagram",
  youtube: "YouTube",
};

async function currentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

/**
 * The footer sits on Mineral Ivory, so the master logo (a JPEG on white) is
 * shown on its own white panel, never on a dark background.
 */
export async function SiteFooter() {
  const [settings, site, businesses, year] = await Promise.all([getSettings(), getSiteMap(), listBusinesses(), currentYear()]);
  const nav = mainNav(site, businesses);

  // Sitemap columns: one per menu group, then everything else under "Explore".
  const columns: { title: string; links: NavLink[] }[] = [];
  const explore: NavLink[] = [];
  for (const item of nav) {
    if (isGroup(item)) columns.push({ title: item.label, links: groupLinks(item) });
    else explore.push(item);
  }
  if (explore.length) columns.push({ title: "Explore", links: explore });

  const hasContact = Boolean(settings.email || settings.phone || settings.address || settings.social.length);

  return (
    <footer className="mt-auto border-t border-steel bg-ivory text-graphite">
      <Container className="grid gap-12 py-16 lg:grid-cols-12 lg:gap-6 lg:py-20">
        <div className="lg:col-span-4">
          <Link href="/" aria-label={`${settings.siteName}: home`} className="inline-block bg-white p-4 shadow-[0_0_0_1px_var(--vectis-steel)]">
            {settings.logo ? (
              <PublicImage img={{ ...settings.logo, alt: settings.siteName }} className="h-20 w-auto" />
            ) : (
              <Logo width={112} />
            )}
          </Link>
          {settings.tagline ? <p className="mt-6 max-w-sm text-[0.9375rem] leading-relaxed text-[var(--ink-muted)]">{settings.tagline}</p> : null}
          {hasContact ? (
            <div className="mt-8">
              <h2 className="t-label text-indigo">Contact</h2>
              <address className="mt-3 space-y-1.5 text-[0.9375rem] not-italic">
                {settings.address ? <p className="whitespace-pre-line">{settings.address}</p> : null}
                {settings.phone ? (
                  <p>
                    <a href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`} className="hover:text-indigo hover:underline hover:underline-offset-4">
                      {settings.phone}
                    </a>
                  </p>
                ) : null}
                {settings.email ? (
                  <p>
                    <a href={`mailto:${settings.email}`} className="hover:text-indigo hover:underline hover:underline-offset-4">
                      {settings.email}
                    </a>
                  </p>
                ) : null}
              </address>
              {settings.social.length ? (
                <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1">
                  {settings.social.map((s) => (
                    <li key={s.key}>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center text-[0.9375rem] text-indigo underline-offset-4 hover:underline"
                      >
                        {SOCIAL_LABEL[s.key] ?? s.key}
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </div>

        {columns.length ? (
          <nav aria-label="Footer" className="grid gap-10 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-3 lg:gap-6">
            {columns.map((col) => (
              <div key={col.title}>
                <h2 className="t-label border-b border-steel pb-3 text-indigo">
                  {col.title}
                </h2>
                <ul className="mt-3">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="inline-flex min-h-10 items-center text-[0.9375rem] underline-offset-4 hover:text-indigo hover:underline">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        ) : null}
      </Container>
      <div className="border-t border-steel">
        <Container className="flex flex-col gap-2 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[var(--ink-muted)]">
            © {year} {settings.siteName}. All rights reserved.
          </p>
          <p className="t-label text-[var(--ink-muted)]">Est. 1956 · Nigeria</p>
        </Container>
      </div>
    </footer>
  );
}
