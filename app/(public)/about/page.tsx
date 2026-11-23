import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCorePage, getSiteMap } from "@/features/public/data";
import { pageMetadata } from "@/features/public/metadata";
import { ItemGrid, StandardPage, items } from "@/features/public/components/page-blocks";
import { MoreLink, Section } from "@/features/public/components/bits";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCorePage("about");
  return page ? pageMetadata({ title: page.title, seoTitle: page.seoTitle, description: page.seoDescription, image: page.ogImage, path: "/about" }) : {};
}

export default async function AboutPage() {
  const [page, site] = await Promise.all([getCorePage("about"), getSiteMap()]);
  if (!page) notFound();
  const values = items(page, "values");
  const more = [
    site.core.has("history") && { href: "/history", label: "Corporate History" },
    site.core.has("governance") && { href: "/governance", label: "Governance" },
    site.core.has("leadership") && { href: "/leadership", label: "Leadership" },
  ].filter((x): x is { href: string; label: string } => Boolean(x));
  return (
    <StandardPage page={page} eyebrow="About">
      {values.length ? (
        <Section title="Our values" tone="white">
          <ItemGrid list={values} />
        </Section>
      ) : null}
      {more.length ? (
        <Section>
          <ul className="flex flex-wrap gap-x-10 gap-y-4">
            {more.map((m) => (
              <li key={m.href}>
                <MoreLink href={m.href}>{m.label}</MoreLink>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
    </StandardPage>
  );
}
