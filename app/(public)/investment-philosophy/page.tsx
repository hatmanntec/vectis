import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { getCorePage, listInvestments } from "@/features/public/data";
import { pageMetadata } from "@/features/public/metadata";
import { items, text } from "@/features/public/components/page-blocks";
import { RichText } from "@/features/public/components/rich-text";
import { Container, PublicImage } from "@/features/public/components/bits";
import { PageHero, SectionHead } from "@/features/public/components/editorial";
import { RelationshipMap } from "@/features/public/components/relationship-map";
import { INVESTMENT_STATUS_LABEL, NATURE_LABEL, type InvestmentStatus, type Nature } from "@/features/investments/labels";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCorePage("investment-philosophy");
  return page
    ? pageMetadata({ title: page.title, seoTitle: page.seoTitle, description: page.seoDescription, image: page.ogImage, path: "/investment-philosophy" })
    : {};
}

/**
 * Investments: the philosophy and principles (CMS > Website Pages >
 * Investment Philosophy), the relationship map, then one entry per published
 * investment. Every description of an investment is VECTIS's own wording.
 */
export default async function InvestmentPhilosophyPage() {
  const [page, investments] = await Promise.all([getCorePage("investment-philosophy"), listInvestments()]);
  if (!page) notFound();
  const principles = items(page, "principles");
  const nature = (i: (typeof investments)[number]) => i.nature_note ?? NATURE_LABEL[i.nature as Nature];
  let n = 0;
  const next = () => String(++n).padStart(2, "0");

  return (
    <>
      <PageHero crumbs={[{ label: "VECTIS", href: "/" }, { label: "Investments" }]} title={page.title} lead={text(page, "intro")} />
      {page.images.image ? (
        <Container className="pt-10">
          <div className="reveal-image">
            <PublicImage img={page.images.image} eager className="aspect-[21/9] w-full object-cover" />
          </div>
        </Container>
      ) : null}
      {page.content.body ? (
        <Container className="pt-14 lg:pt-20">
          <div className="reveal max-w-[42rem] lg:ml-[calc(5/12*100%)]">
            <RichText doc={page.content.body} className="t-body" />
          </div>
        </Container>
      ) : null}

      {principles.length ? (
        <section aria-labelledby="principles" className="section-y">
          <Container>
            <SectionHead headingId="principles" index={next()} label="Principles" title="Our principles" />
            <ol className="mt-12 grid border-t border-indigo sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
              {principles.map((p, i) => (
                <li key={`${p.heading}-${i}`} className="reveal border-b border-steel py-8 sm:pr-6 lg:border-b-0 lg:border-l lg:px-6 lg:first:border-l-0 lg:first:pl-0">
                  <p className="t-label t-index">{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="t-h3 mt-3 text-indigo">{p.heading}</h3>
                  {p.text ? <p className="mt-3 text-[0.9375rem] leading-relaxed whitespace-pre-line text-[var(--ink-muted)]">{p.text}</p> : null}
                </li>
              ))}
            </ol>
          </Container>
        </section>
      ) : null}

      {investments.length ? (
        <>
          <section aria-labelledby="map" className="on-dark section-y bg-indigo text-ivory">
            <Container>
              <SectionHead
                headingId="map"
                tone="dark"
                index={next()}
                label="Relationships"
                title="Who invests in whom"
                lead="VECTIS businesses on the left; the companies they invest in on the right. Each line carries the nature of the investment."
              />
              <div className="reveal mt-12 lg:mt-16">
                <RelationshipMap links={investments.map((i) => ({ slug: i.slug, investor: i.investor, investee: i.investee, nature: nature(i) }))} tone="dark" />
              </div>
            </Container>
          </section>

          <section id="investments" aria-labelledby="profiles" className="section-y scroll-mt-28 bg-white">
            <Container>
              <SectionHead headingId="profiles" index={next()} label="Profiles" title="Investments" />
              <ul className="mt-12 border-t border-indigo lg:mt-16">
                {investments.map((i) => (
                  <li key={i.id} className="reveal border-b border-steel">
                    <Link href={`/investments/${i.slug}`} className="group relative grid gap-4 py-8 lg:grid-cols-12 lg:gap-6">
                      <span className="lg:col-span-5">
                        <span className="t-label block text-[var(--ink-muted)]">{i.investor}</span>
                        <span className="mt-2 flex items-center gap-3 font-serif text-[1.75rem] leading-tight text-indigo">
                          <ArrowRight aria-hidden className="size-5 shrink-0 text-copper" />
                          <span>
                            <span className="sr-only">invests in </span>
                            {i.investee}
                          </span>
                        </span>
                      </span>
                      <span className="lg:col-span-5">
                        <span className="t-label block text-teal">
                          {nature(i)}
                          {i.investment_status !== "active" ? ` · ${INVESTMENT_STATUS_LABEL[i.investment_status as InvestmentStatus]}` : ""}
                        </span>
                        {i.summary ? <span className="t-body mt-2 block text-[var(--ink-muted)]">{i.summary}</span> : null}
                      </span>
                      <span className="flex items-start justify-between gap-4 lg:col-span-2 lg:justify-end">
                        {i.logo ? <PublicImage img={{ ...i.logo, alt: "" }} className="h-12 w-auto max-w-[7rem] object-contain" /> : <span />}
                        <ArrowRight aria-hidden className="mt-1 size-5 shrink-0 text-indigo transition-transform duration-200 group-hover:translate-x-1" />
                      </span>
                      <span aria-hidden className="absolute bottom-[-1px] left-0 h-px w-0 bg-copper transition-[width] duration-300 group-hover:w-full group-focus-visible:w-full" />
                    </Link>
                  </li>
                ))}
              </ul>
            </Container>
          </section>
        </>
      ) : null}
    </>
  );
}
