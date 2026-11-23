import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { UserRound } from "lucide-react";
import { getLeader, getSiteMap } from "@/features/public/data";
import { pageMetadata } from "@/features/public/metadata";
import { RichText } from "@/features/public/components/rich-text";
import { Container, MoreLink, PublicImage, Section } from "@/features/public/components/bits";
import { CATEGORY_LABEL, type LeadershipCategory } from "@/features/leadership/labels";

export async function generateMetadata({ params }: PageProps<"/leadership/[slug]">): Promise<Metadata> {
  const p = await getLeader((await params).slug);
  if (!p) notFound();
  return pageMetadata({ title: p.full_name, seoTitle: p.seo_title, description: p.seo_description ?? p.job_title, image: p.photo, path: `/leadership/${p.slug}` });
}

export default function LeaderPage({ params }: PageProps<"/leadership/[slug]">) {
  return (
    <Suspense fallback={<div className="h-96" />}>
      <Leader params={params} />
    </Suspense>
  );
}

async function Leader({ params }: { params: PageProps<"/leadership/[slug]">["params"] }) {
  const [p, site] = await Promise.all([getLeader((await params).slug), getSiteMap()]);
  if (!p) notFound();
  return (
    <>
      <header className="border-b border-border bg-white">
        <Container className="grid items-end gap-10 py-14 sm:py-20 md:grid-cols-[18rem_minmax(0,1fr)]">
          <div className="aspect-[4/5] w-full max-w-72 overflow-hidden border border-border bg-indigo/5">
            {p.photo ? (
              <PublicImage img={{ ...p.photo, alt: p.photo.alt || p.full_name }} eager className="h-full w-full object-cover object-top" />
            ) : (
              <div className="flex h-full items-center justify-center">
                <UserRound className="size-20 text-steel" aria-hidden />
              </div>
            )}
          </div>
          <div>
            <p className="mb-4 text-xs font-medium tracking-[0.2em] text-copper uppercase">{CATEGORY_LABEL[p.category as LeadershipCategory]}</p>
            <h1 className="text-4xl leading-tight font-medium sm:text-5xl">{p.full_name}</h1>
            {p.job_title ? <p className="mt-4 text-lg text-muted-foreground">{p.job_title}</p> : null}
            <div className="mt-6 h-px w-16 bg-copper" aria-hidden />
          </div>
        </Container>
      </header>
      <Container className="grid gap-12 py-14 sm:py-16 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div>{p.biography ? <RichText doc={p.biography} /> : null}</div>
        {p.roles.length ? (
          <aside>
            <h2 className="mb-4 font-sans text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">Roles</h2>
            <ul className="divide-y divide-border border border-border bg-white text-sm">
              {p.roles.map((r) => (
                <li key={r.company} className="px-5 py-3">
                  <span className="font-medium text-indigo">{r.href ? <Link href={r.href} className="hover:underline">{r.company}</Link> : r.company}</span>
                  {r.role ? <span className="block text-muted-foreground">{r.role}</span> : null}
                </li>
              ))}
            </ul>
          </aside>
        ) : null}
      </Container>
      {site.core.has("leadership") ? (
        <Section>
          <MoreLink href="/leadership">All leadership</MoreLink>
        </Section>
      ) : null}
    </>
  );
}
