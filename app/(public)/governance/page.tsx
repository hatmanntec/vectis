import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCorePage, getSiteMap } from "@/features/public/data";
import { pageMetadata } from "@/features/public/metadata";
import { StandardPage, items } from "@/features/public/components/page-blocks";
import { Section } from "@/features/public/components/bits";
import { ArrowLink, aboutCrumbs } from "@/features/public/components/editorial";
import { GovernanceLoop } from "@/features/public/components/governance-loop";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCorePage("governance");
  return page ? pageMetadata({ title: page.title, seoTitle: page.seoTitle, description: page.seoDescription, image: page.ogImage, path: "/governance" }) : {};
}

export default async function GovernancePage() {
  const [page, site] = await Promise.all([getCorePage("governance"), getSiteMap()]);
  if (!page) notFound();
  const loop = items(page, "loop");
  return (
    <StandardPage page={page} crumbs={aboutCrumbs(site.core.has("about"), page.title)}>
      {loop.length > 1 ? (
        <Section title="The accountability loop" tone="white">
          <GovernanceLoop stages={loop} />
        </Section>
      ) : null}
      {site.core.has("leadership") ? (
        <Section>
          <ArrowLink href="/leadership">Board and leadership</ArrowLink>
        </Section>
      ) : null}
    </StandardPage>
  );
}
