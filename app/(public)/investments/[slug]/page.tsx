import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getInvestment } from "@/features/public/data";
import { pageMetadata } from "@/features/public/metadata";
import { RichText } from "@/features/public/components/rich-text";
import { Container, Documents, Facts, Gallery, MoreLink, PageHeading, PublicImage, Section } from "@/features/public/components/bits";
import { INVESTMENT_STATUS_LABEL, NATURE_LABEL, type InvestmentStatus, type Nature } from "@/features/investments/labels";
import { formatDate } from "@/lib/cms/status";

export async function generateMetadata({ params }: PageProps<"/investments/[slug]">): Promise<Metadata> {
  const i = await getInvestment((await params).slug);
  if (!i) notFound();
  return pageMetadata({ title: i.investee.name, seoTitle: i.seo_title, description: i.seo_description ?? i.summary, image: i.logo, path: `/investments/${i.slug}` });
}

export default function InvestmentPage({ params }: PageProps<"/investments/[slug]">) {
  return (
    <Suspense fallback={<div className="h-96" />}>
      <Investment params={params} />
    </Suspense>
  );
}

async function Investment({ params }: { params: PageProps<"/investments/[slug]">["params"] }) {
  const i = await getInvestment((await params).slug);
  if (!i) notFound();
  const link = (c: { name: string; href: string | null }) => (c.href ? <Link href={c.href} className="text-indigo underline">{c.name}</Link> : c.name);
  const website = i.investee.website && /^https?:\/\//i.test(i.investee.website) ? i.investee.website : null;
  return (
    <>
      <PageHeading eyebrow="Investment" title={i.investee.name} intro={i.summary} />
      <Container className={`grid gap-12 py-14 sm:py-16 ${i.description ? "lg:grid-cols-[minmax(0,1fr)_20rem]" : "max-w-3xl"}`}>
        {i.description ? <RichText doc={i.description} /> : null}
        <aside className="space-y-6">
          {i.logo ? (
            <div className="flex h-40 items-center justify-center border border-border bg-white p-6">
              <PublicImage img={{ ...i.logo, alt: i.logo.alt || i.investee.name }} className="max-h-full max-w-full object-contain" />
            </div>
          ) : null}
          <Facts
            items={[
              { label: "Investor", value: link(i.investor) },
              { label: "Invested in", value: link(i.investee) },
              { label: "Nature", value: i.nature_note ?? NATURE_LABEL[i.nature as Nature] },
              { label: "Status", value: INVESTMENT_STATUS_LABEL[i.investment_status as InvestmentStatus] },
              { label: "Date", value: i.investment_date ? formatDate(i.investment_date) : null },
              { label: "Website", value: website ? <a href={website} target="_blank" rel="noopener noreferrer" className="text-indigo underline">{website.replace(/^https?:\/\//, "")}</a> : null },
            ]}
          />
        </aside>
      </Container>
      {i.gallery.length ? (
        <Section title="Gallery" tone="white">
          <Gallery images={i.gallery} />
        </Section>
      ) : null}
      {i.documents.length ? (
        <Section title="Documents">
          <Documents docs={i.documents} />
        </Section>
      ) : null}
      <Section>
        <MoreLink href="/investment-philosophy#investments">All investments</MoreLink>
      </Section>
    </>
  );
}
