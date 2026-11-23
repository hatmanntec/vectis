import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { formatDate } from "@/lib/cms/status";
import { NEWS_TYPE_LABEL, type NewsType } from "@/features/news/labels";
import {
  getCorePage,
  getSettings,
  getSiteMap,
  latestNews,
  listBusinesses,
  listInvestments,
  listProjects,
  listSectors,
  type Img,
} from "@/features/public/data";
import { pageMetadata } from "@/features/public/metadata";
import { CLUSTERS, groupByCluster } from "@/features/public/clusters";
import { RichText } from "@/features/public/components/rich-text";
import { Container, PublicImage } from "@/features/public/components/bits";
import { items, text } from "@/features/public/components/page-blocks";
import { ArrowLink, ButtonLink, SectionHead, ValueChain } from "@/features/public/components/editorial";
import { SINCE_LINE } from "@/features/public/components/site-header";
import { ClusterIndex, type ClusterRow } from "@/features/public/components/home/cluster-index";
import { BusinessDirectory } from "@/features/public/components/home/business-directory";
import { RelationshipMap } from "@/features/public/components/relationship-map";
import { NATURE_LABEL, type Nature } from "@/features/investments/labels";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCorePage("home");
  return pageMetadata({ title: page?.title ?? "Home", seoTitle: page?.seoTitle, description: page?.seoDescription, image: page?.ogImage, path: "/" });
}

/** Organisation details for search engines (only what is published in Settings). */
async function OrganisationData() {
  const s = await getSettings();
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: s.siteName,
    url: process.env.NEXT_PUBLIC_SITE_URL || undefined,
    foundingDate: "1956",
    ...(s.email ? { email: s.email } : {}),
    ...(s.phone ? { telephone: s.phone } : {}),
    ...(s.address ? { address: s.address } : {}),
    ...(s.social.length ? { sameAs: s.social.map((x) => x.url) } : {}),
  };
  return (
    <script
      type="application/ld+json"
      // JSON only (escaped "<"), built from the settings above.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

/**
 * The home page: one story told in sections of different shapes. Every
 * word comes from the CMS (the Home page, the Investment Philosophy page,
 * and the published businesses, sectors, investments, projects and news);
 * a section with nothing published behind it is left out.
 */
export default async function HomePage() {
  const page = await getCorePage("home");
  if (!page) return <Holding />;

  const [site, sectors, businesses, investments, projects, news, philosophy] = await Promise.all([
    getSiteMap(),
    listSectors(),
    listBusinesses(),
    listInvestments(),
    listProjects(),
    latestNews(4),
    getCorePage("investment-philosophy"),
  ]);
  const has = (key: string) => site.core.has(key);

  const heading = text(page, "hero_heading") ?? page.title;
  const sub = text(page, "hero_subheading");
  const heroImage = page.images.hero_image;
  const introHeading = text(page, "intro_heading");
  const introText = page.content.intro_text;
  const ctaHeading = text(page, "cta_heading");
  const ctaText = text(page, "cta_text");

  // The Home page's highlights are the five clusters; each lists the
  // businesses whose main sector places them in that cluster.
  const grouped = groupByCluster(businesses);
  const clusterRows: ClusterRow[] = items(page, "highlights").map((h, i) => {
    const cluster = CLUSTERS.find((c) => c.name.toLowerCase() === h.heading.trim().toLowerCase());
    const group = cluster && grouped.find((g) => g.cluster.key === cluster.key);
    return {
      index: cluster?.index ?? String(i + 1).padStart(2, "0"),
      heading: h.heading,
      text: h.text,
      businesses: has("businesses") && group ? group.items.map((b) => ({ name: b.name, slug: b.slug })) : [],
    };
  });

  const principles = philosophy ? items(philosophy, "principles") : [];
  const mapLinks = investments.map((i) => ({
    slug: i.slug,
    investor: i.investor,
    investee: i.investee,
    nature: i.nature_note ?? NATURE_LABEL[i.nature as Nature],
  }));

  // Businesses in each sector, for the industries index.
  const bySector = new Map<string, { name: string; slug: string }[]>();
  for (const b of businesses) for (const s of b.sectors) bySector.set(s.slug, [...(bySector.get(s.slug) ?? []), { name: b.name, slug: b.slug }]);

  // Sections are numbered in the order they appear, skipping any that are hidden.
  let n = 0;
  const next = () => String(++n).padStart(2, "0");

  return (
    <>
      <OrganisationData />

      {/* 1. Hero */}
      <section className="on-dark relative isolate flex min-h-[calc(100svh-7.25rem)] flex-col overflow-hidden bg-indigo text-ivory" aria-label="Introduction">
        {heroImage ? (
          <>
            <div aria-hidden className="enter-settle absolute inset-0 -z-10 mix-blend-luminosity">
              <PublicImage img={{ ...heroImage, alt: "" }} eager className="h-full w-full object-cover opacity-45 grayscale" />
            </div>
            <div
              className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(13,17,90,0.95)_0%,rgba(13,17,90,0.8)_50%,rgba(13,17,90,0.45)_100%)]"
              aria-hidden
            />
          </>
        ) : (
          <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_85%_15%,rgba(40,91,89,0.35)_0%,transparent_55%)]" />
        )}
        <Container className="flex flex-1 flex-col justify-between gap-16 pt-16 pb-10 sm:pt-24 lg:pt-28 lg:pb-14">
          <div className="enter max-w-5xl">
            <p className="t-label flex items-center gap-3 text-ivory/85">
              <span aria-hidden className="h-px w-8 bg-copper" />
              {SINCE_LINE}
            </p>
            <h1 className="t-hero mt-8 text-white">{heading}</h1>
            {sub ? <p className="t-lead mt-8 max-w-2xl whitespace-pre-line text-ivory/85">{sub}</p> : null}
            {has("about") || has("businesses") ? (
              <div className="mt-10 flex flex-wrap gap-4">
                {has("about") ? (
                  <ButtonLink href="/about" variant="solid-light">
                    About VECTIS
                  </ButtonLink>
                ) : null}
                {has("businesses") ? (
                  <ButtonLink href="/businesses" variant="outline-light">
                    Our businesses
                  </ButtonLink>
                ) : null}
              </div>
            ) : null}
          </div>
          <ValueChain tone="dark" animate />
        </Container>
      </section>

      {/* 2. Heritage */}
      {introHeading || introText ? (
        <section aria-labelledby="home-heritage" className="section-y bg-ivory">
          <Container className="grid gap-10 lg:grid-cols-12 lg:gap-6">
            <div className="reveal lg:col-span-5">
              <p className="t-label flex items-center gap-3 text-[var(--ink-muted)]">
                <span className="t-index">{next()}</span>
                <span aria-hidden className="h-px w-6 bg-steel" />
                <span>Heritage</span>
              </p>
              <p aria-hidden className="mt-4 font-serif text-[clamp(6rem,4rem+10vw,13rem)] leading-[0.85] font-light tracking-[-0.04em] text-indigo">
                1956
              </p>
              <p className="t-label mt-4 text-[var(--ink-muted)]">Established in Nigeria</p>
            </div>
            <div className="reveal lg:col-span-6 lg:col-start-7 lg:pt-10">
              {introHeading ? (
                <h2 id="home-heritage" className="t-h2 text-indigo">
                  {introHeading}
                </h2>
              ) : (
                <h2 id="home-heritage" className="sr-only">
                  Heritage
                </h2>
              )}
              <RichText doc={introText} className="t-body mt-6 text-graphite" />
              {has("history") ? (
                <div className="mt-8">
                  <ArrowLink href="/history">Corporate history</ArrowLink>
                </div>
              ) : null}
            </div>
          </Container>
        </section>
      ) : null}

      {/* 3. Five clusters */}
      {clusterRows.length ? (
        <section aria-labelledby="home-clusters" className="section-y bg-white">
          <Container>
            <SectionHead headingId="home-clusters" index={next()} label="Structure" title="One group, five connected clusters" />
            <div className="mt-12 lg:mt-16">
              <ClusterIndex rows={clusterRows} />
            </div>
          </Container>
        </section>
      ) : null}

      {/* 4. Businesses */}
      {businesses.length && has("businesses") ? (
        <section aria-labelledby="home-businesses" className="section-y bg-ivory">
          <Container>
            <SectionHead headingId="home-businesses"
              index={next()}
              label="Businesses"
              title="The VECTIS businesses"
              action={<ArrowLink href="/businesses">All businesses</ArrowLink>}
            />
            <div className="mt-12 lg:mt-16">
              <BusinessDirectory
                groups={grouped.map((g) => ({
                  index: g.cluster.key === "other" ? undefined : g.cluster.index,
                  name: g.cluster.name,
                  items: g.items.map((b) => ({ name: b.name, slug: b.slug, shortDescription: b.shortDescription, logo: b.logo, sectors: b.sectors })),
                }))}
              />
            </div>
          </Container>
        </section>
      ) : null}

      {/* 5. Investments */}
      {mapLinks.length || (philosophy && principles.length) ? (
        <section aria-labelledby="home-investments" className="on-dark section-y bg-indigo text-ivory">
          <Container>
            <SectionHead headingId="home-investments"
              tone="dark"
              index={next()}
              label="Investments"
              title={philosophy?.title ?? "Investments"}
              lead={philosophy ? text(philosophy, "intro") : null}
              action={has("investment-philosophy") ? <ArrowLink href="/investment-philosophy" tone="dark">Investment philosophy</ArrowLink> : null}
            />
            <div className="mt-12 grid gap-14 lg:mt-16 lg:grid-cols-12 lg:gap-6">
              {mapLinks.length ? (
                <div className="reveal lg:col-span-7">
                  <RelationshipMap links={mapLinks} tone="dark" />
                </div>
              ) : null}
              {principles.length ? (
                <ol className={`reveal ${mapLinks.length ? "lg:col-span-4 lg:col-start-9" : "grid gap-8 sm:grid-cols-2 lg:col-span-12 lg:grid-cols-4"}`}>
                  {principles.map((p, i) => (
                    <li key={`${p.heading}-${i}`} className="border-t border-ivory/30 py-6">
                      <p className="t-label text-ivory/80">{String(i + 1).padStart(2, "0")}</p>
                      <h3 className="mt-2 font-serif text-2xl text-white">{p.heading}</h3>
                      {p.text ? <p className="mt-2 text-[0.9375rem] leading-relaxed text-ivory/85">{p.text}</p> : null}
                    </li>
                  ))}
                </ol>
              ) : null}
            </div>
          </Container>
        </section>
      ) : null}

      {/* 6. Industries */}
      {sectors.length ? (
        <section aria-labelledby="home-industries" className="section-y bg-white">
          <Container>
            <SectionHead headingId="home-industries"
              index={next()}
              label="Industries"
              title={`${sectors.length === 15 ? "Fifteen" : sectors.length} sectors, one mandate`}
              action={<ArrowLink href="/industries">All industries</ArrowLink>}
            />
            <ol className="mt-12 grid border-t border-indigo md:grid-cols-2 md:gap-x-6 lg:mt-16">
              {sectors.map((s, i) => {
                const inSector = bySector.get(s.slug) ?? [];
                return (
                  <li key={s.id} className="reveal grid grid-cols-[3rem_minmax(0,1fr)] gap-x-2 border-b border-steel py-5">
                    <span className="t-label pt-1.5 t-index">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <h3 className="font-serif text-xl leading-snug text-indigo">
                        <Link href={`/industries#${s.slug}`} className="underline-offset-4 hover:underline">
                          {s.name}
                        </Link>
                      </h3>
                      {inSector.length ? (
                        <p className="mt-1 text-sm leading-relaxed text-[var(--ink-muted)]">{inSector.map((b) => b.name).join(" · ")}</p>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ol>
          </Container>
        </section>
      ) : null}

      {/* 7. Projects and news */}
      {projects.length || news.length ? (
        <section aria-labelledby="home-latest" className="section-y bg-ivory">
          <Container>
            <SectionHead headingId="home-latest" index={next()} label="Latest" title={projects.length && news.length ? "Projects and news" : projects.length ? "Projects" : "News"} />
            <div className="mt-12 space-y-16 lg:mt-16">
              {projects.length ? (
                <Featured
                  label="Projects"
                  all={{ href: "/projects", text: "All projects" }}
                  list={projects.slice(0, 4).map((p) => ({
                    href: `/projects/${p.slug}`,
                    title: p.title,
                    meta: [p.company, p.location_name].filter(Boolean).join(" · "),
                    text: p.summary,
                    image: p.cover,
                  }))}
                />
              ) : null}
              {news.length ? (
                <Featured
                  label="News"
                  all={{ href: "/news", text: "All news" }}
                  list={news.map((x) => ({
                    href: `/news/${x.slug}`,
                    title: x.title,
                    meta: [NEWS_TYPE_LABEL[x.news_type as NewsType], x.published_at ? formatDate(x.published_at) : null].filter(Boolean).join(" · "),
                    text: x.excerpt,
                    image: x.cover,
                  }))}
                />
              ) : null}
            </div>
          </Container>
        </section>
      ) : null}

      {/* 8. Partnership */}
      {ctaHeading || ctaText ? (
        <section aria-labelledby="home-partnership" className="on-dark section-y bg-graphite text-ivory">
          <Container className="grid gap-10 lg:grid-cols-12 lg:gap-6">
            <div className="reveal lg:col-span-7">
              <p className="t-label flex items-center gap-3 text-ivory/80">
                <span>{next()}</span>
                <span aria-hidden className="h-px w-6 bg-copper" />
                <span>Partnership</span>
              </p>
              <h2 id="home-partnership" className="t-h1 mt-6 text-white">
                {ctaHeading ?? "Partnership"}
              </h2>
            </div>
            <div className="reveal flex flex-col justify-end gap-8 lg:col-span-5">
              {ctaText ? <p className="t-lead whitespace-pre-line text-ivory/85">{ctaText}</p> : null}
              {has("contact") ? (
                <div>
                  <ButtonLink href="/contact" variant="solid-light">
                    Contact VECTIS
                  </ButtonLink>
                </div>
              ) : null}
            </div>
          </Container>
        </section>
      ) : null}
    </>
  );
}

type Entry = { href: string; title: string; meta: string; text: string | null; image: Img };

/** One item large, the rest as a short list. */
function Featured({ label, list, all }: { label: string; list: Entry[]; all: { href: string; text: string } }) {
  const [first, ...rest] = list;
  return (
    <div className="reveal">
      <div className="mb-6 flex items-center justify-between gap-4 border-b border-indigo pb-3">
        <h3 className="t-label text-indigo">{label}</h3>
        <ArrowLink href={all.href}>{all.text}</ArrowLink>
      </div>
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-6">
        <Link href={first.href} className={`group ${rest.length ? "lg:col-span-7" : "lg:col-span-12"}`}>
          {first.image ? (
            <div className="reveal-image mb-6 aspect-[16/9] bg-steel/30">
              <PublicImage img={{ ...first.image, alt: "" }} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
            </div>
          ) : null}
          {first.meta ? <p className="t-label text-[var(--ink-muted)]">{first.meta}</p> : null}
          <p className="t-h3 mt-3 text-indigo group-hover:underline group-hover:underline-offset-4">{first.title}</p>
          {first.text ? <p className="t-body mt-3 text-[var(--ink-muted)]">{first.text}</p> : null}
        </Link>
        {rest.length ? (
          <ul className="border-t border-steel lg:col-span-5 lg:border-t-0">
            {rest.map((e) => (
              <li key={e.href} className="border-b border-steel lg:first:border-t">
                <Link href={e.href} className="group block py-5">
                  {e.meta ? <p className="t-label text-[var(--ink-muted)]">{e.meta}</p> : null}
                  <p className="mt-2 font-serif text-xl leading-snug text-indigo group-hover:underline group-hover:underline-offset-4">{e.title}</p>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

/** Shown until the Home page is published in the CMS. Says nothing beyond the logo. */
function Holding() {
  return (
    <section className="flex flex-1 items-center justify-center px-6 py-20">
      <div className="w-full max-w-xl border border-border bg-white px-8 py-14 text-center sm:px-14">
        <Logo width={260} priority className="mx-auto" />
        <div className="mx-auto my-10 h-px w-16 bg-copper" aria-hidden />
        <h1 className="text-2xl font-medium sm:text-3xl">Our new website is being prepared</h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">Please check back soon.</p>
      </div>
    </section>
  );
}
