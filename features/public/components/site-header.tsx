import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/brand/logo";
import { getSettings, getSiteMap, listBusinesses } from "../data";
import { mainNav } from "./nav";
import { NavLinks, PlainNavLinks } from "./nav-links";
import { MobileMenu } from "./mobile-menu";
import { HeaderShell } from "./header-shell";
import { Container, PublicImage } from "./bits";

/** Shown in the utility line above the menu, and at the foot of the phone menu. */
export const SINCE_LINE = "Since 1956 · Nigeria";

export async function SiteHeader() {
  const [settings, site, businesses] = await Promise.all([getSettings(), getSiteMap(), listBusinesses()]);
  const items = mainNav(site, businesses);
  const hasContact = site.core.has("contact");

  const logo = (
    <Link href="/" className="shrink-0" aria-label={`${settings.siteName}: home`}>
      {settings.logo ? (
        <PublicImage img={{ ...settings.logo, alt: settings.siteName }} eager className="h-14 w-auto" />
      ) : (
        <Logo width={84} priority />
      )}
    </Link>
  );

  const utility = (
    <div className="border-b border-steel/60 bg-ivory">
      <Container className="flex h-9 items-center justify-between gap-4">
        <p className="t-label text-[var(--ink-muted)]">{SINCE_LINE}</p>
        {hasContact ? (
          <Link href="/contact" className="t-label text-indigo hover:underline hover:underline-offset-4">
            Contact
          </Link>
        ) : null}
      </Container>
    </div>
  );

  return (
    <HeaderShell utility={utility}>
      <Container className="flex h-20 items-center justify-between gap-6">
        {logo}
        {items.length ? (
          <nav aria-label="Main" className="hidden lg:block">
            <Suspense fallback={<PlainNavLinks items={items} />}>
              <NavLinks items={items} />
            </Suspense>
          </nav>
        ) : null}
        <Suspense fallback={null}>
          <MobileMenu items={items} logo={logo} utility={SINCE_LINE} />
        </Suspense>
      </Container>
    </HeaderShell>
  );
}
