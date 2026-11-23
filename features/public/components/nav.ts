import type { getSiteMap } from "../data";

export type NavItem = { href: string; label: string };

/**
 * The main menu. Each item appears only once there is something published
 * behind it, so the website never shows links to empty pages.
 */
export function mainNav(site: Awaited<ReturnType<typeof getSiteMap>>): NavItem[] {
  const items: (NavItem | false)[] = [
    site.core.has("about") && { href: "/about", label: "About" },
    site.core.has("businesses") && { href: "/businesses", label: "Businesses" },
    site.core.has("investment-philosophy") && { href: "/investment-philosophy", label: "Investments" },
    site.counts.projects > 0 && { href: "/projects", label: "Projects" },
    site.core.has("leadership") && { href: "/leadership", label: "Leadership" },
    site.counts.news > 0 && { href: "/news", label: "News" },
    site.core.has("contact") && { href: "/contact", label: "Contact" },
  ];
  return items.filter((i): i is NavItem => Boolean(i));
}

/** Extra links for the footer. */
export function footerNav(site: Awaited<ReturnType<typeof getSiteMap>>): NavItem[] {
  const items: (NavItem | false)[] = [
    site.core.has("history") && { href: "/history", label: "Corporate History" },
    site.core.has("governance") && { href: "/governance", label: "Governance" },
    ...site.extra.map((p) => ({ href: `/${p.slug}`, label: p.title })),
  ];
  return items.filter((i): i is NavItem => Boolean(i));
}
