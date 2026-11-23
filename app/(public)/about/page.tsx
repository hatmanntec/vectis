import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCorePage, getSiteMap } from "@/features/public/data";
import { pageMetadata } from "@/features/public/metadata";
import { ItemGrid, StandardPage, items } from "@/features/public/components/page-blocks";
import { Section } from "@/features/public/components/bits";
import { ArrowLink } from "@/features/public/components/editorial";

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
    ...site.extra.map((p) => ({ href: `/${p.slug}`, label: p.title })),
  ].filter((x): x is { href: string; label: string } => Boolean(x));
  return (
    <StandardPage page={page} crumbs={[{ label: "VECTIS", href: "/" }, { label: page.title }]}>
      {values.length ? (
        <Section title="Our values" tone="white">
          <ItemGrid list={values} />
        </Section>
      ) : null}
      {more.length ? (
        <Section title="More about VECTIS">
          <ul className="grid border-t border-steel sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4">
            {more.map((m) => (
              <li key={m.href} className="reveal border-b border-steel py-3">
                <ArrowLink href={m.href}>{m.label}</ArrowLink>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
    </StandardPage>
  );
}
