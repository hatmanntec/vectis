import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCorePage, getSiteMap } from "@/features/public/data";
import { pageMetadata } from "@/features/public/metadata";
import { StandardPage } from "@/features/public/components/page-blocks";
import { MoreLink, Section } from "@/features/public/components/bits";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCorePage("governance");
  return page ? pageMetadata({ title: page.title, seoTitle: page.seoTitle, description: page.seoDescription, image: page.ogImage, path: "/governance" }) : {};
}

export default async function GovernancePage() {
  const [page, site] = await Promise.all([getCorePage("governance"), getSiteMap()]);
  if (!page) notFound();
  return (
    <StandardPage page={page} eyebrow="Governance">
      {site.core.has("leadership") ? (
        <Section>
          <MoreLink href="/leadership">Board and leadership</MoreLink>
        </Section>
      ) : null}
    </StandardPage>
  );
}
