import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getInvestment } from "@/features/public/data";
import { PageSkeleton } from "@/features/public/components/bits";
import { pageMetadata } from "@/features/public/metadata";
import { RichText } from "@/features/public/components/rich-text";
import { Container, Documents, Facts, Gallery, PublicImage } from "@/features/public/components/bits";
import { ArrowLink, Block, PageHero } from "@/features/public/components/editorial";
import { INVESTMENT_STATUS_LABEL, NATURE_LABEL, type InvestmentStatus, type Nature } from "@/features/investments/labels";
import { formatDate } from "@/lib/cms/status";

export async function generateMetadata({ params }: PageProps<"/investments/[slug]">): Promise<Metadata> {
  const i = await getInvestment((await params).slug);
  if (!i) notFound();
  return pageMetadata({ title: i.investee.name, seoTitle: i.seo_title, description: i.seo_description ?? i.summary, image: i.logo, path: `/investments/${i.slug}` });
}

export default function InvestmentPage({ params }: PageProps<"/investments/[slug]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Investment params={params} />
    </Suspense>
  );
}

type Party = { name: string; href: string | null };

/**
 * One investment: who invests in whom, and the nature of it in VECTIS's
 * words. The company invested in is shown with a dashed outline and never
 * as a VECTIS business.
 */
async function Investment({ params }: { params: PageProps<"/investments/[slug]">["params"] }) {
  const i = await getInvestment((await params).slug);
  if (!i) notFound();
  const nature = i.nature_note ?? NATURE_LABEL[i.nature as Nature];
  const linkCls = "text-indigo underline underline-offset-4 hover:no-underline";
  const link = (c: Party) => (c.href ? <Link href={c.href} className={linkCls}>{c.name}</Link> : c.name);
  const website = i.investee.website && /^https?:\/\//i.test(i.investee.website) ? i.investee.website : null;

  return (
    <>
      <PageHero
        tone="indigo"
        crumbs={[{ label: "VECTIS", href: "/" }, { label: "Investments", href: "/investment-philosophy" }, { label: i.investee.name }]}
        title={i.investee.name}
        lead={i.summary}
      >
        <Relationship investor={i.investor} investee={i.investee} nature={nature} />
      </PageHero>

      <Container className="grid gap-12 py-14 lg:grid-cols-12 lg:gap-6 lg:py-20">
        {i.description ? (
          <div className="reveal lg:col-span-7">
            <RichText doc={i.description} className="t-body" />
          </div>
        ) : null}
        <aside aria-label="Key facts" className={i.description ? "lg:col-span-4 lg:col-start-9" : "lg:col-span-5"}>
          <div className="space-y-8 lg:sticky lg:top-32">
            {i.logo ? (
              <div className="flex h-32 items-center justify-center border border-steel bg-white p-6">
                <PublicImage img={{ ...i.logo, alt: i.logo.alt || i.investee.name }} className="max-h-full max-w-full object-contain" />
              </div>
            ) : null}
            <Facts
              items={[
                { label: "Investor", value: link(i.investor) },
                { label: "Invested in", value: link(i.investee) },
                { label: "Nature", value: nature },
                { label: "Status", value: INVESTMENT_STATUS_LABEL[i.investment_status as InvestmentStatus] },
                { label: "Date", value: i.investment_date ? formatDate(i.investment_date) : null },
                {
                  label: "Website",
                  value: website ? (
                    <a href={website} target="_blank" rel="noopener noreferrer" className={linkCls}>
                      {website.replace(/^https?:\/\//, "")}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  ) : null,
                },
              ]}
            />
            <ArrowLink href="/investment-philosophy#investments">All investments</ArrowLink>
          </div>
        </aside>
      </Container>

      {i.gallery.length ? (
        <Block label="Gallery" title="Images" tone="ivory">
          <Gallery images={i.gallery} />
        </Block>
      ) : null}
      {i.documents.length ? (
        <Block label="Downloads" title="Documents">
          <Documents docs={i.documents} />
        </Block>
      ) : null}
    </>
  );
}

/** Investor (solid box) → company invested in (dashed box), with the nature on the line. */
function Relationship({ investor, investee, nature }: { investor: Party; investee: Party; nature: string }) {
  const box = "flex min-h-16 items-center border px-5 py-3 font-serif text-xl text-white";
  return (
    <div className="mt-12 grid items-center gap-3 md:grid-cols-[minmax(0,1fr)_minmax(10rem,auto)_minmax(0,1fr)] md:gap-0 lg:mt-16">
      <div>
        <p className="t-label mb-2 text-ivory/80">Investor · VECTIS business</p>
        <div className={`${box} border-white`}>
          {investor.href ? (
            <Link href={investor.href} className="underline-offset-4 hover:underline">
              {investor.name}
            </Link>
          ) : (
            investor.name
          )}
        </div>
      </div>
      <div className="relative flex items-center justify-center py-2 md:mt-7 md:px-4">
        <span aria-hidden className="absolute inset-x-0 top-1/2 hidden h-px bg-ivory/40 md:block" />
        <span className="t-label relative border border-ivory/40 bg-indigo px-3 py-1.5 text-center text-ivory">
          <span className="sr-only">Nature of the investment: </span>
          {nature}
        </span>
      </div>
      <div>
        <p className="t-label mb-2 text-ivory/80">Company invested in</p>
        <div className={`${box} border-dashed border-white`}>{investee.name}</div>
      </div>
    </div>
  );
}
