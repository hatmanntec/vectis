import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getCorePage, listBusinesses, listSectors } from "@/features/public/data";
import { pageMetadata } from "@/features/public/metadata";
import { StandardPage } from "@/features/public/components/page-blocks";
import { Container, Nothing } from "@/features/public/components/bits";
import { CompanyCard } from "@/features/public/components/cards";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCorePage("businesses");
  return page ? pageMetadata({ title: page.title, seoTitle: page.seoTitle, description: page.seoDescription, image: page.ogImage, path: "/businesses" }) : {};
}

export default async function BusinessesPage({ searchParams }: PageProps<"/businesses">) {
  const page = await getCorePage("businesses");
  if (!page) notFound();
  return (
    <StandardPage page={page} eyebrow="The VECTIS group">
      <Suspense fallback={<Container className="pb-16"><div className="h-64 animate-pulse bg-white" /></Container>}>
        <Directory searchParams={searchParams} />
      </Suspense>
    </StandardPage>
  );
}

async function Directory({ searchParams }: { searchParams: PageProps<"/businesses">["searchParams"] }) {
  const [{ sector }, businesses, sectors] = await Promise.all([searchParams, listBusinesses(), listSectors()]);
  const used = sectors.filter((s) => businesses.some((b) => b.sectors.some((x) => x.slug === s.slug)));
  const current = typeof sector === "string" && used.some((s) => s.slug === sector) ? sector : null;
  const shown = current ? businesses.filter((b) => b.sectors.some((s) => s.slug === current)) : businesses;
  return (
    <Container className="pb-16 sm:pb-20">
      {used.length > 1 ? (
        <nav aria-label="Filter by industry" className="mb-8 flex flex-wrap gap-2">
          {[{ slug: null as string | null, name: "All" }, ...used].map((s) => {
            const active = s.slug === current;
            return (
              <Link
                key={s.slug ?? "all"}
                href={s.slug ? `/businesses?sector=${s.slug}` : "/businesses"}
                aria-current={active ? "page" : undefined}
                scroll={false}
                className={`border px-4 py-2 text-sm ${active ? "border-indigo bg-indigo text-white" : "border-border bg-white text-graphite hover:border-indigo"}`}
              >
                {s.name}
              </Link>
            );
          })}
        </nav>
      ) : null}
      {shown.length ? (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((c) => (
            <li key={c.id}>
              <CompanyCard c={c} />
            </li>
          ))}
        </ul>
      ) : (
        <Nothing>Business profiles will appear here soon.</Nothing>
      )}
    </Container>
  );
}
