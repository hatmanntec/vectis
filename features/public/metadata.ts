import type { Metadata } from "next";
import type { Img } from "./data";
import { getSettings } from "./data";

/**
 * Page titles, descriptions and sharing images. Each page's own SEO fields
 * win; otherwise the defaults from Settings are used.
 */
export async function pageMetadata({
  title,
  seoTitle,
  description,
  image,
  path,
  type = "website",
}: {
  title: string;
  seoTitle?: string | null;
  description?: string | null;
  image?: Img;
  path: string;
  type?: "website" | "article";
}): Promise<Metadata> {
  const s = await getSettings();
  const desc = description ?? s.seoDescription ?? s.tagline ?? undefined;
  const og = image ?? s.ogImage;
  const fullTitle = seoTitle ?? title;
  return {
    title: path === "/" ? { absolute: seoTitle ?? s.seoTitle ?? s.siteName } : fullTitle,
    description: desc,
    alternates: { canonical: path },
    openGraph: {
      type,
      siteName: s.siteName,
      title: fullTitle,
      description: desc,
      url: path,
      ...(og ? { images: [{ url: og.url, alt: og.alt || s.siteName }] } : {}),
    },
    twitter: { card: og ? "summary_large_image" : "summary" },
  };
}
