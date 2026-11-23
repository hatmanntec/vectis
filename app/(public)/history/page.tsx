import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCorePage } from "@/features/public/data";
import { pageMetadata } from "@/features/public/metadata";
import { StandardPage, Timeline, items } from "@/features/public/components/page-blocks";
import { Section } from "@/features/public/components/bits";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCorePage("history");
  return page ? pageMetadata({ title: page.title, seoTitle: page.seoTitle, description: page.seoDescription, image: page.ogImage, path: "/history" }) : {};
}

export default async function HistoryPage() {
  const page = await getCorePage("history");
  if (!page) notFound();
  const dates = items(page, "timeline");
  return (
    <StandardPage page={page} eyebrow="Since 1956">
      {dates.length ? (
        <Section title="Key dates" tone="white">
          <Timeline list={dates.map((d) => ({ date: d.heading, text: d.text }))} />
        </Section>
      ) : null}
    </StandardPage>
  );
}
