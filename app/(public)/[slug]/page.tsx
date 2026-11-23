import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getExtraPage, getSiteMap, withPlaceholder } from "@/features/public/data";
import { PageSkeleton } from "@/features/public/components/bits";
import { aboutCrumbs } from "@/features/public/components/editorial";
import { pageMetadata } from "@/features/public/metadata";
import { StandardPage } from "@/features/public/components/page-blocks";

/** Extra pages created in the CMS (e.g. /privacy-policy). */
export async function generateMetadata({ params }: PageProps<"/[slug]">): Promise<Metadata> {
  const page = await getExtraPage((await params).slug);
  if (!page) notFound();
  return pageMetadata({ title: page.title, seoTitle: page.seoTitle, description: page.seoDescription, image: page.ogImage, path: `/${page.slug}` });
}

/** Published extra pages are built ahead of time; new ones are built on their first visit. */
export async function generateStaticParams() {
  const site = await getSiteMap();
  return withPlaceholder(site.extra.map((p) => ({ slug: p.slug })));
}

export default function ExtraPage({ params }: PageProps<"/[slug]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Extra params={params} />
    </Suspense>
  );
}

async function Extra({ params }: { params: PageProps<"/[slug]">["params"] }) {
  const [page, site] = await Promise.all([getExtraPage((await params).slug), getSiteMap()]);
  if (!page) notFound();
  // Extra pages sit under About in the menu.
  return <StandardPage page={page} crumbs={aboutCrumbs(site.core.has("about"), page.title)} />;
}
