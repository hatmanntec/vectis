import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getCorePage, listBusinesses, listSectors } from "@/features/public/data";
import { pageMetadata } from "@/features/public/metadata";
import { groupByCluster } from "@/features/public/clusters";
import { PageBody, text } from "@/features/public/components/page-blocks";
import { Container, Nothing, PublicImage } from "@/features/public/components/bits";
import { PageHero } from "@/features/public/components/editorial";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCorePage("businesses");
  return page ? pageMetadata({ title: page.title, seoTitle: page.seoTitle, description: page.seoDescription, image: page.ogImage, path: "/businesses" }) : {};
}

export default async function BusinessesPage({ searchParams }: PageProps<"/businesses">) {
  const page = await getCorePage("businesses");
  if (!page) notFound();
  const body = page.content.body;
  return (
    <>
      <PageHero crumbs={[{ label: "VECTIS", href: "/" }, { label: page.title }]} title={page.title} lead={text(page, "intro")} />
      {page.images.image ? (
        <Container className="pt-10">
          <div className="reveal-image">
            <PublicImage img={page.images.image} eager className="aspect-[21/9] w-full object-cover" />
          </div>
        </Container>
      ) : null}
      <PageBody doc={body} bottom={false} />
      <Suspense
        fallback={
          <Container className="py-16">
            <div className="h-64 animate-pulse bg-ivory" />
          </Container>
        }
      >
        <Directory searchParams={searchParams} />
      </Suspense>
    </>
  );
}

/**
 * Every published VECTIS business, grouped by cluster, with a filter by
 * industry. The filter is a set of ordinary links, so it works without
 * JavaScript and each filtered view has its own address.
 */
async function Directory({ searchParams }: { searchParams: PageProps<"/businesses">["searchParams"] }) {
  const [{ sector }, businesses, sectors] = await Promise.all([searchParams, listBusinesses(), listSectors()]);
  const used = sectors.filter((s) => businesses.some((b) => b.sectors.some((x) => x.slug === s.slug)));
  const current = typeof sector === "string" ? used.find((s) => s.slug === sector) ?? null : null;
  const shown = current ? businesses.filter((b) => b.sectors.some((s) => s.slug === current.slug)) : businesses;
  const groups = groupByCluster(shown);

  return (
    <Container className="py-14 lg:py-20">
      {used.length > 1 ? (
        <div className="mb-14 border-y border-steel py-6 lg:grid lg:grid-cols-12 lg:gap-6">
          <p id="filter-label" className="t-label mb-4 text-[var(--ink-muted)] lg:col-span-2 lg:mb-0 lg:pt-2.5">
            Filter by industry
          </p>
          <nav aria-labelledby="filter-label" className="lg:col-span-10">
            <ul className="flex flex-wrap gap-2">
              {[{ slug: null as string | null, name: "All industries" }, ...used].map((s) => {
                const active = (s.slug ?? null) === (current?.slug ?? null);
                return (
                  <li key={s.slug ?? "all"}>
                    <Link
                      href={s.slug ? `/businesses?sector=${s.slug}` : "/businesses"}
                      aria-current={active ? "page" : undefined}
                      scroll={false}
                      className={`inline-flex min-h-10 items-center border px-3.5 text-sm transition-colors duration-200 ${
                        active ? "border-indigo bg-indigo text-white" : "border-steel bg-white text-graphite hover:border-indigo hover:text-indigo"
                      }`}
                    >
                      {s.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      ) : null}

      <p className="sr-only" aria-live="polite">
        {current ? `Showing ${shown.length} ${shown.length === 1 ? "business" : "businesses"} in ${current.name}.` : ""}
      </p>
      {current ? (
        <p className="t-label mb-10 text-[var(--ink-muted)]" aria-hidden>
          {shown.length} {shown.length === 1 ? "business" : "businesses"} in {current.name}
        </p>
      ) : null}

      {groups.length ? (
        <div className="space-y-16 lg:space-y-24">
          {groups.map(({ cluster, items }) => (
            <section key={cluster.key} id={cluster.key} aria-labelledby={`cluster-${cluster.key}`} className="scroll-mt-32 lg:grid lg:grid-cols-12 lg:gap-6">
              <div className="mb-6 lg:col-span-4 lg:mb-0">
                <div className="lg:sticky lg:top-32">
                  {cluster.key !== "other" ? <p className="t-label t-index">{cluster.index}</p> : null}
                  <h2 id={`cluster-${cluster.key}`} className="t-h3 mt-2 text-indigo">
                    {cluster.name}
                  </h2>
                  <p className="t-label mt-3 text-[var(--ink-muted)]">
                    {items.length} {items.length === 1 ? "business" : "businesses"}
                  </p>
                </div>
              </div>
              <ul className="border-t border-indigo lg:col-span-8">
                {items.map((b) => (
                  <li key={b.id} className="reveal border-b border-steel">
                    <Link href={`/businesses/${b.slug}`} className="group relative grid gap-3 py-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-6 lg:py-7">
                      <span>
                        <span className="block font-serif text-2xl leading-tight text-indigo">{b.name}</span>
                        {b.shortDescription ? <span className="t-body mt-2 block text-[var(--ink-muted)]">{b.shortDescription}</span> : null}
                        {b.sectors.length ? (
                          <span className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
                            {b.sectors.map((s) => (
                              <span key={s.slug} className="t-label text-teal">
                                {s.name}
                              </span>
                            ))}
                          </span>
                        ) : null}
                      </span>
                      {b.logo ? (
                        <span className="flex h-14 w-28 items-center justify-start sm:justify-end">
                          <PublicImage img={{ ...b.logo, alt: "" }} className="max-h-full max-w-full object-contain" />
                        </span>
                      ) : null}
                      <span aria-hidden className="absolute bottom-[-1px] left-0 h-px w-0 bg-copper transition-[width] duration-300 group-hover:w-full group-focus-visible:w-full" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <Nothing>Business profiles will appear here soon.</Nothing>
      )}
    </Container>
  );
}
