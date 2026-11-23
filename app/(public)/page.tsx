import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { getCorePage, getSettings, getSiteMap, latestNews, listBusinesses, listProjects, listSectors } from "@/features/public/data";
import { pageMetadata } from "@/features/public/metadata";
import { RichText } from "@/features/public/components/rich-text";
import { Container, MoreLink, PublicImage, Section } from "@/features/public/components/bits";
import { CompanyCard, NewsCard, ProjectCard } from "@/features/public/components/cards";
import { ItemGrid, items, text } from "@/features/public/components/page-blocks";

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

export default async function HomePage() {
  const page = await getCorePage("home");
  if (!page) return <Holding />;

  const [site, sectors, businesses, projects, news] = await Promise.all([
    getSiteMap(),
    listSectors(),
    listBusinesses(),
    listProjects(),
    latestNews(3),
  ]);
  const heroImage = page.images.hero_image;
  const heading = text(page, "hero_heading") ?? page.title;
  const sub = text(page, "hero_subheading");
  const highlights = items(page, "highlights");
  const ctaHeading = text(page, "cta_heading");
  const ctaText = text(page, "cta_text");

  return (
    <>
      <OrganisationData />
      <section className="relative overflow-hidden bg-indigo text-ivory" aria-label="Introduction">
        {heroImage ? (
          <>
            <PublicImage img={{ ...heroImage, alt: "" }} eager className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(13,17,90,0.92)_0%,rgba(13,17,90,0.75)_55%,rgba(13,17,90,0.35)_100%)]" aria-hidden />
          </>
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,#1b2070_0%,transparent_60%)]" aria-hidden />
        )}
        <Container className="relative py-24 sm:py-32 lg:py-40">
          <div className="mb-8 h-px w-20 bg-copper" aria-hidden />
          <h1 className="max-w-4xl text-4xl leading-[1.1] font-medium text-white sm:text-6xl">{heading}</h1>
          {sub ? <p className="mt-8 max-w-2xl text-lg leading-relaxed whitespace-pre-line text-ivory/90 sm:text-xl">{sub}</p> : null}
          {site.core.has("about") || site.core.has("businesses") ? (
            <div className="mt-10 flex flex-wrap gap-4">
              {site.core.has("about") ? (
                <Link href="/about" className="inline-flex h-12 items-center bg-white px-6 text-sm font-medium text-indigo hover:bg-ivory">
                  About VECTIS
                </Link>
              ) : null}
              {site.core.has("businesses") ? (
                <Link href="/businesses" className="inline-flex h-12 items-center border border-white/60 px-6 text-sm font-medium text-white hover:bg-white/10">
                  Our businesses
                </Link>
              ) : null}
            </div>
          ) : null}
        </Container>
      </section>

      {text(page, "intro_heading") || page.content.intro_text ? (
        <Section>
          <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
            {text(page, "intro_heading") ? <h2 className="text-3xl leading-tight font-medium sm:text-4xl">{text(page, "intro_heading")}</h2> : <div />}
            <RichText doc={page.content.intro_text} />
          </div>
        </Section>
      ) : null}

      {highlights.length ? (
        <Section tone="white">
          <ItemGrid list={highlights} />
        </Section>
      ) : null}

      {sectors.length ? (
        <Section title="Industries">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {sectors.map((s) => (
              <li key={s.id} className="relative overflow-hidden border border-border bg-white">
                {s.cover ? (
                  <PublicImage img={{ ...s.cover, alt: "" }} className="aspect-[4/3] w-full object-cover" />
                ) : (
                  <div className="h-1 bg-teal" aria-hidden />
                )}
                <div className="p-5">
                  <h3 className="text-lg font-medium">
                    {site.core.has("businesses") ? (
                      <Link href={`/businesses?sector=${s.slug}`} className="hover:underline">
                        {s.name}
                      </Link>
                    ) : (
                      s.name
                    )}
                  </h3>
                  {s.description ? <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{s.description}</p> : null}
                </div>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {businesses.length && site.core.has("businesses") ? (
        <Section title="Our businesses" tone="white">
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {businesses.slice(0, 6).map((c) => (
              <li key={c.id}>
                <CompanyCard c={c} />
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <MoreLink href="/businesses">All businesses</MoreLink>
          </div>
        </Section>
      ) : null}

      {projects.length ? (
        <Section title="Projects">
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.slice(0, 3).map((p) => (
              <li key={p.id}>
                <ProjectCard p={p} />
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <MoreLink href="/projects">All projects</MoreLink>
          </div>
        </Section>
      ) : null}

      {news.length ? (
        <Section title="Latest news" tone="white">
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {news.map((n) => (
              <li key={n.id}>
                <NewsCard n={n} />
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <MoreLink href="/news">All news</MoreLink>
          </div>
        </Section>
      ) : null}

      {ctaHeading || ctaText ? (
        <section className="bg-teal text-white" aria-label={ctaHeading ?? "Contact"}>
          <Container className="flex flex-col items-start gap-6 py-16 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              {ctaHeading ? <h2 className="text-3xl font-medium text-white">{ctaHeading}</h2> : null}
              {ctaText ? <p className="mt-3 leading-relaxed whitespace-pre-line text-white/90">{ctaText}</p> : null}
            </div>
            {site.core.has("contact") ? (
              <Link href="/contact" className="inline-flex h-12 shrink-0 items-center bg-white px-6 text-sm font-medium text-teal hover:bg-ivory">
                Contact us
              </Link>
            ) : null}
          </Container>
        </section>
      ) : null}
    </>
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
