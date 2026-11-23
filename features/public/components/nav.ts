import type { CompanyCard, getSiteMap } from "../data";
import { groupByCluster } from "../clusters";

export type NavLink = { href: string; label: string };
/** A menu entry that opens a panel of links, arranged in titled columns. */
export type NavGroup = {
  label: string;
  /** Short line shown in the panel beside the links. */
  blurb: string;
  /** Optional "see everything" link shown under the blurb. */
  overview?: NavLink;
  columns: { title?: string; index?: string; links: NavLink[] }[];
};
export type NavItem = NavLink | NavGroup;

export const isGroup = (i: NavItem): i is NavGroup => "columns" in i;
export const groupLinks = (g: NavGroup) => [...(g.overview ? [g.overview] : []), ...g.columns.flatMap((c) => c.links)];

type SiteMap = Awaited<ReturnType<typeof getSiteMap>>;
const present = <T,>(xs: (T | false)[]) => xs.filter(Boolean) as T[];

/**
 * The main menu. Each link appears only once there is something published
 * behind it, so the website never shows links to empty pages. A group with
 * a single link becomes a plain link; a group with none disappears.
 */
export function mainNav(site: SiteMap, businesses: CompanyCard[]): NavItem[] {
  const about = present<NavLink>([
    site.core.has("about") && { href: "/about", label: "Overview" },
    site.core.has("history") && { href: "/history", label: "Corporate History" },
    site.core.has("governance") && { href: "/governance", label: "Governance" },
    site.core.has("leadership") && { href: "/leadership", label: "Leadership" },
    ...site.extra.map((p) => ({ href: `/${p.slug}`, label: p.title })),
  ]);

  const businessColumns = groupByCluster(businesses).map(({ cluster, items }) => ({
    title: cluster.name,
    index: cluster.key === "other" ? undefined : cluster.index,
    links: items.map((b) => ({ href: `/businesses/${b.slug}`, label: b.name })),
  }));

  const items: (NavItem | false)[] = [
    collapse({
      label: "About",
      blurb: "Who VECTIS is, how it began in 1956, and how it is governed.",
      columns: [{ links: about }],
    }),
    site.core.has("businesses") &&
      collapse(
        {
          label: "Businesses",
          blurb: "The VECTIS businesses, grouped by cluster.",
          overview: { href: "/businesses", label: "All businesses" },
          columns: businessColumns,
        },
      ),
    site.core.has("investment-philosophy") && { href: "/investment-philosophy", label: "Investments" },
    site.counts.projects > 0 && { href: "/projects", label: "Projects" },
    site.counts.news > 0 && { href: "/news", label: "News" },
    site.core.has("contact") && { href: "/contact", label: "Contact" },
  ];
  return items.filter((i): i is NavItem => Boolean(i));
}

function collapse(group: NavGroup): NavItem | false {
  const columns = group.columns.filter((c) => c.links.length);
  const links = groupLinks({ ...group, columns });
  if (!links.length) return false;
  if (links.length === 1) return { href: links[0].href, label: group.label };
  return { ...group, columns };
}

/** Is this link (or anything under it) the page being shown? */
export function isActive(href: string, pathname: string) {
  if (!pathname) return false;
  if (href === "/investment-philosophy" && pathname.startsWith("/investments")) return true;
  return pathname === href || pathname.startsWith(`${href}/`);
}
