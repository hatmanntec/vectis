import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getNewsItem, sitemapEntries, withPlaceholder } from "@/features/public/data";
import { PageSkeleton } from "@/features/public/components/bits";
import { pageMetadata } from "@/features/public/metadata";
import { RichText } from "@/features/public/components/rich-text";
import { Container, Documents, Gallery, MoreLink, PublicImage, Section } from "@/features/public/components/bits";
import { PageHero } from "@/features/public/components/editorial";
import { NEWS_TYPE_LABEL, type NewsType } from "@/features/news/labels";
import { formatDate } from "@/lib/cms/status";

export async function generateMetadata({ params }: PageProps<"/news/[slug]">): Promise<Metadata> {
  const n = await getNewsItem((await params).slug);
  if (!n) notFound();
  return pageMetadata({ title: n.title, seoTitle: n.seo_title, description: n.seo_description ?? n.excerpt, image: n.cover, path: `/news/${n.slug}`, type: "article" });
}

/** Published items are built ahead of time; new ones are built on their first visit. */
export async function generateStaticParams() {
  const { news } = await sitemapEntries();
  return withPlaceholder(news.map((r) => ({ slug: r.slug })));
}

export default function NewsItemPage({ params }: PageProps<"/news/[slug]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Article params={params} />
    </Suspense>
  );
}

async function Article({ params }: { params: PageProps<"/news/[slug]">["params"] }) {
  const n = await getNewsItem((await params).slug);
  if (!n) notFound();
  return (
    <article>
      <PageHero crumbs={[{ label: "VECTIS", href: "/" }, { label: "News", href: "/news" }, { label: n.title }]} title={n.title} lead={n.excerpt}>
        <p className="t-label mt-10 flex flex-wrap items-center gap-x-4 gap-y-1 text-[var(--ink-muted)] lg:mt-14">
          <span className="text-teal">{NEWS_TYPE_LABEL[n.news_type as NewsType]}</span>
          {n.published_at ? <time dateTime={n.published_at}>{formatDate(n.published_at)}</time> : null}
          {n.author_name ? <span>{`By ${n.author_name}`}</span> : null}
        </p>
      </PageHero>
      {n.cover ? (
        <Container className="pt-10">
          <div className="reveal-image mx-auto max-w-[58rem]">
            <PublicImage img={n.cover} eager className="aspect-[16/9] w-full object-cover" />
          </div>
        </Container>
      ) : null}
      <Container className="py-14 lg:py-20">
        <div className="reveal mx-auto max-w-[42rem]">
          {n.body ? <RichText doc={n.body} className="t-body" /> : null}
          {n.companies.length ? (
            <div className="mt-12 border-t border-steel pt-6 text-[0.9375rem]">
              <span className="t-label mr-2 text-[var(--ink-muted)]">Companies mentioned</span>
              {n.companies.map((c, i) => (
                <span key={c.name}>
                  {i ? ", " : ""}
                  {c.href ? <Link href={c.href} className="text-indigo underline underline-offset-4">{c.name}</Link> : c.name}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </Container>
      {n.gallery.length ? (
        <Section title="Gallery" tone="white">
          <Gallery images={n.gallery} />
        </Section>
      ) : null}
      {n.documents.length ? (
        <Section title="Documents">
          <Documents docs={n.documents} />
        </Section>
      ) : null}
      <Section>
        <MoreLink href="/news">All news</MoreLink>
      </Section>
    </article>
  );
}
