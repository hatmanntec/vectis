import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { NEWS_PAGE_SIZE, listNews } from "@/features/public/data";
import { pageMetadata } from "@/features/public/metadata";
import { Container, Nothing, PageHeading } from "@/features/public/components/bits";
import { NewsCard } from "@/features/public/components/cards";
import { NEWS_TYPES, NEWS_TYPE_LABEL } from "@/features/news/labels";

/**
 * This page reads the kind filter and page number from the web address. Next.js would otherwise try to
 * change pages instantly, before that part of the address is known, which can
 * leave the page showing "This page couldn't load". Waiting for the page to be
 * ready costs a moment on the change and always works.
 */
export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({ title: "News", path: "/news" });
}

export default function NewsPage({ searchParams }: PageProps<"/news">) {
  return (
    <>
      <PageHeading title="News" intro="News and announcements from VECTIS." />
      <Suspense fallback={<Container className="py-16"><div className="h-64 animate-pulse bg-white/60" /></Container>}>
        <NewsList searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function NewsList({ searchParams }: { searchParams: PageProps<"/news">["searchParams"] }) {
  const sp = await searchParams;
  const type = typeof sp.type === "string" && (NEWS_TYPES as string[]).includes(sp.type) ? sp.type : null;
  const pageNum = Math.min(Math.max(Number.parseInt(String(sp.page ?? "1"), 10) || 1, 1), 1000);
  const { items, total } = await listNews(pageNum, type);
  const pages = Math.max(1, Math.ceil(total / NEWS_PAGE_SIZE));
  const href = (p: number, t: string | null) => {
    const q = new URLSearchParams();
    if (t) q.set("type", t);
    if (p > 1) q.set("page", String(p));
    const s = q.toString();
    return s ? `/news?${s}` : "/news";
  };
  return (
    <Container className="py-14 lg:py-20">
      <nav aria-label="Filter news" className="mb-14 flex flex-wrap gap-2 border-y border-steel py-6">
        {[{ value: null as string | null, label: "All" }, ...NEWS_TYPES.map((t) => ({ value: t as string | null, label: NEWS_TYPE_LABEL[t] }))].map((t) => (
          <Link
            key={t.value ?? "all"}
            href={href(1, t.value)}
            aria-current={t.value === type ? "page" : undefined}
            scroll={false}
            className={`inline-flex min-h-10 items-center border px-3.5 text-sm transition-colors duration-200 ${t.value === type ? "border-indigo bg-indigo text-white" : "border-steel bg-white text-graphite hover:border-indigo hover:text-indigo"}`}
          >
            {t.label}
          </Link>
        ))}
      </nav>
      {items.length ? (
        <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((n) => (
            <li key={n.id} className="reveal">
              <NewsCard n={n} />
            </li>
          ))}
        </ul>
      ) : (
        <Nothing>No news here yet.</Nothing>
      )}
      {pages > 1 ? (
        <nav aria-label="Pages" className="mt-14 flex items-center justify-between border-t border-steel pt-6 text-sm">
          {pageNum > 1 ? <Link href={href(pageNum - 1, type)} className="inline-flex min-h-11 items-center border border-steel bg-white px-4 hover:border-indigo">Newer</Link> : <span />}
          <span className="t-label text-[var(--ink-muted)]">
            Page {pageNum} of {pages}
          </span>
          {pageNum < pages ? <Link href={href(pageNum + 1, type)} className="inline-flex min-h-11 items-center border border-steel bg-white px-4 hover:border-indigo">Older</Link> : <span />}
        </nav>
      ) : null}
    </Container>
  );
}
