import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/brand/logo";
import { getSettings, getSiteMap } from "../data";
import { mainNav } from "./nav";
import { NavLinks, PlainNavLinks } from "./nav-links";
import { MobileMenu } from "./mobile-menu";
import { Container, PublicImage } from "./bits";

export async function SiteHeader() {
  const [settings, site] = await Promise.all([getSettings(), getSiteMap()]);
  const items = mainNav(site);
  return (
    <header className="relative z-30 border-b border-border bg-white">
      <div className="h-1 bg-indigo" aria-hidden />
      <Container className="flex h-20 items-center justify-between gap-6">
        <Link href="/" className="shrink-0" aria-label={`${settings.siteName}: home`}>
          {settings.logo ? (
            <PublicImage img={{ ...settings.logo, alt: settings.siteName }} eager className="h-14 w-auto" />
          ) : (
            <Logo width={84} priority />
          )}
        </Link>
        {items.length ? (
          <nav aria-label="Main" className="hidden lg:block">
            <Suspense fallback={<PlainNavLinks items={items} variant="desktop" />}>
              <NavLinks items={items} variant="desktop" />
            </Suspense>
          </nav>
        ) : null}
        <Suspense fallback={null}>
          <MobileMenu items={items} />
        </Suspense>
      </Container>
    </header>
  );
}
