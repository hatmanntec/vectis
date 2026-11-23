import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getExtraPage } from "@/features/public/data";
import { pageMetadata } from "@/features/public/metadata";
import { StandardPage } from "@/features/public/components/page-blocks";

/** Extra pages created in the CMS (e.g. /privacy-policy). */
export async function generateMetadata({ params }: PageProps<"/[slug]">): Promise<Metadata> {
  const page = await getExtraPage((await params).slug);
  if (!page) notFound();
  return pageMetadata({ title: page.title, seoTitle: page.seoTitle, description: page.seoDescription, image: page.ogImage, path: `/${page.slug}` });
}

export default function ExtraPage({ params }: PageProps<"/[slug]">) {
  return (
    <Suspense fallback={<div className="h-96" />}>
      <Extra params={params} />
    </Suspense>
  );
}

async function Extra({ params }: { params: PageProps<"/[slug]">["params"] }) {
  const page = await getExtraPage((await params).slug);
  if (!page) notFound();
  return <StandardPage page={page} />;
}
