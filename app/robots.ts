import type { MetadataRoute } from "next";

/** Search engines may index the public site, never the CMS. */
export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL;
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api"] }],
    ...(base ? { sitemap: `${base}/sitemap.xml` } : {}),
  };
}
