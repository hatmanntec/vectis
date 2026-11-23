import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getNewsItem } from "@/features/public/data";
import { pageMetadata } from "@/features/public/metadata";
import { RichText } from "@/features/public/components/rich-text";
import { Container, Documents, Gallery, MoreLink, PublicImage, Section } from "@/features/public/components/bits";
import { NEWS_TYPE_LABEL, type NewsType } from "@/features/news/labels";
import { formatDate } from "@/lib/cms/status";

export async function generateMetadata({ params }: PageProps<"/news/[slug]">): Promise<Metadata> {
  const n = await getNewsItem((await params).slug);
  if (!n) notFound();
  return pageMetadata({ title: n.title, seoTitle: n.seo_title, description: n.seo_description ?? n.excerpt, image: n.cover, path: `/news/${n.slug}`, type: "article" });
}

export default function NewsItemPage({ params }: PageProps<"/news/[slug]">) {
  return (
    <Suspense fallback={<div className="h-96" />}>
      <Article params={params} />
    </Suspense>
  );
}

async function Article({ params }: { params: PageProps<"/news/[slug]">["params"] }) {
  const n = await getNewsItem((await params).slug);
  if (!n) notFound();
  return (
    <article>
      <header className="border-b border-border bg-white">
        <Container className="max-w-4xl py-14 sm:py-20">
          <p className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium tracking-[0.2em] text-copper uppercase">
            <span>{NEWS_TYPE_LABEL[n.news_type as NewsType]}</span>
            {n.published_at ? (
              <time dateTime={n.published_at} className="tracking-normal text-muted-foreground normal-case">
                {formatDate(n.published_at)}
              </time>
            ) : null}
          </p>
          <h1 className="text-3xl leading-tight font-medium sm:text-5xl">{n.title}</h1>
          {n.excerpt ? <p className="mt-6 text-lg leading-relaxed text-muted-foreground">{n.excerpt}</p> : null}
          {n.author_name ? <p className="mt-6 text-sm text-muted-foreground">By {n.author_name}</p> : null}
        </Container>
      </header>
      {n.cover ? (
        <Container className="max-w-4xl">
          <PublicImage img={n.cover} eager className="aspect-[16/9] w-full border border-t-0 border-border object-cover" />
        </Container>
      ) : null}
      <Container className="max-w-4xl py-12 sm:py-16">
        {n.body ? <RichText doc={n.body} /> : null}
        {n.companies.length ? (
          <div className="mt-12 border-t border-border pt-6 text-sm">
            <span className="text-muted-foreground">Companies mentioned: </span>
            {n.companies.map((c, i) => (
              <span key={c.name}>
                {i ? ", " : ""}
                {c.href ? <Link href={c.href} className="text-indigo underline">{c.name}</Link> : c.name}
              </span>
            ))}
          </div>
        ) : null}
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
