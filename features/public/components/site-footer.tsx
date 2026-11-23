import Link from "next/link";
import { cacheLife } from "next/cache";
import { getSettings, getSiteMap } from "../data";
import { footerNav, mainNav } from "./nav";
import { Container } from "./bits";

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

export async function SiteFooter() {
  const [settings, site, year] = await Promise.all([getSettings(), getSiteMap(), currentYear()]);
  const links = [...mainNav(site), ...footerNav(site)];
  return (
    <footer className="mt-auto bg-indigo text-ivory">
      <Container className="grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-serif text-2xl tracking-[0.12em]">{settings.siteName}</p>
          {settings.tagline ? <p className="mt-3 max-w-sm text-sm leading-relaxed text-ivory/80">{settings.tagline}</p> : null}
          <div className="mt-5 h-px w-12 bg-copper" aria-hidden />
        </div>
        {links.length ? (
          <nav aria-label="Footer">
            <h2 className="mb-4 font-sans text-xs font-medium tracking-[0.2em] text-ivory/75 uppercase">Explore</h2>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm md:grid-cols-1">
              {links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-ivory/90 hover:text-white hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : (
          <div />
        )}
        {settings.email || settings.phone || settings.address || settings.social.length ? (
          <div>
            <h2 className="mb-4 font-sans text-xs font-medium tracking-[0.2em] text-ivory/75 uppercase">Contact</h2>
            <address className="space-y-2 text-sm text-ivory/90 not-italic">
              {settings.address ? <p className="whitespace-pre-line">{settings.address}</p> : null}
              {settings.phone ? (
                <p>
                  <a href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`} className="hover:text-white hover:underline">
                    {settings.phone}
                  </a>
                </p>
              ) : null}
              {settings.email ? (
                <p>
                  <a href={`mailto:${settings.email}`} className="hover:text-white hover:underline">
                    {settings.email}
                  </a>
                </p>
              ) : null}
            </address>
            {settings.social.length ? (
              <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                {settings.social.map((s) => (
                  <li key={s.key}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-ivory/90 hover:text-white hover:underline">
                      {SOCIAL_LABEL[s.key] ?? s.key}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </Container>
      <div className="border-t border-white/10">
        <Container className="flex flex-col gap-2 py-5 text-xs text-ivory/75 sm:flex-row sm:justify-between">
          <p>
            © {year} {settings.siteName}. All rights reserved.
          </p>
          <p>Est. 1956</p>
        </Container>
      </div>
    </footer>
  );
}
