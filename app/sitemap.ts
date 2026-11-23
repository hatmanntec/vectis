import type { MetadataRoute } from "next";
import { getSiteMap, sitemapEntries } from "@/features/public/data";

/** Every published page, for search engines. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const [site, e] = await Promise.all([getSiteMap(), sitemapEntries()]);
  const core: Record<string, string> = {
    home: "/",
    about: "/about",
    history: "/history",
    businesses: "/businesses",
    "investment-philosophy": "/investment-philosophy",
    governance: "/governance",
    leadership: "/leadership",
    contact: "/contact",
  };
  const out: MetadataRoute.Sitemap = [];
  for (const [key, path] of Object.entries(core)) if (site.core.has(key)) out.push({ url: `${base}${path}` });
  if (site.counts.sectors) out.push({ url: `${base}/industries` });
  if (site.counts.projects) out.push({ url: `${base}/projects` });
  if (site.counts.news) out.push({ url: `${base}/news` });
  for (const p of site.extra) out.push({ url: `${base}/${p.slug}` });
  const add = (prefix: string, rows: { slug: string; updated_at: string }[]) =>
    rows.forEach((r) => out.push({ url: `${base}${prefix}/${r.slug}`, lastModified: r.updated_at }));
  add("/businesses", e.businesses);
  add("/investments", e.investments);
  add("/projects", e.projects);
  add("/news", e.news);
  add("/leadership", e.leadership);
  return out;
}
