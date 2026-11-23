import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCorePage, listInvestments } from "@/features/public/data";
import { pageMetadata } from "@/features/public/metadata";
import { ItemGrid, StandardPage, items } from "@/features/public/components/page-blocks";
import { Section } from "@/features/public/components/bits";
import { InvestmentCard } from "@/features/public/components/cards";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCorePage("investment-philosophy");
  return page
    ? pageMetadata({ title: page.title, seoTitle: page.seoTitle, description: page.seoDescription, image: page.ogImage, path: "/investment-philosophy" })
    : {};
}

export default async function InvestmentPhilosophyPage() {
  const [page, investments] = await Promise.all([getCorePage("investment-philosophy"), listInvestments()]);
  if (!page) notFound();
  const principles = items(page, "principles");
  return (
    <StandardPage page={page} eyebrow="Investments">
      {principles.length ? (
        <Section title="Our principles" tone="white">
          <ItemGrid list={principles} numbered />
        </Section>
      ) : null}
      {investments.length ? (
        <Section title="Investments" id="investments">
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {investments.map((i) => (
              <li key={i.id}>
                <InvestmentCard i={i} />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
    </StandardPage>
  );
}
