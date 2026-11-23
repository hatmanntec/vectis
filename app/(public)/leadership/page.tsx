import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCorePage, getSiteMap, listLeadership } from "@/features/public/data";
import { aboutCrumbs } from "@/features/public/components/editorial";
import { pageMetadata } from "@/features/public/metadata";
import { PageHeading, Section, Nothing } from "@/features/public/components/bits";
import { PersonCard } from "@/features/public/components/cards";
import { text } from "@/features/public/components/page-blocks";
import { CATEGORIES, CATEGORY_LABEL } from "@/features/leadership/labels";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCorePage("leadership");
  return page ? pageMetadata({ title: page.title, seoTitle: page.seoTitle, description: page.seoDescription, image: page.ogImage, path: "/leadership" }) : {};
}

export default async function LeadershipPage() {
  const [page, people, site] = await Promise.all([getCorePage("leadership"), listLeadership(), getSiteMap()]);
  if (!page) notFound();
  const groups = CATEGORIES.map((c) => ({ key: c, label: CATEGORY_LABEL[c], people: people.filter((p) => p.category === c) })).filter((g) => g.people.length);
  return (
    <>
      <PageHeading crumbs={aboutCrumbs(site.core.has("about"), page.title)} title={page.title} intro={text(page, "intro")} />
      {groups.length ? (
        groups.map((g, n) => (
          <Section key={g.key} title={g.label} tone={n % 2 ? "white" : "plain"}>
            <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
              {g.people.map((p) => (
                <li key={p.id} className="reveal">
                  <PersonCard p={p} />
                </li>
              ))}
            </ul>
          </Section>
        ))
      ) : (
        <Section>
          <Nothing>Leadership profiles will appear here soon.</Nothing>
        </Section>
      )}
    </>
  );
}
