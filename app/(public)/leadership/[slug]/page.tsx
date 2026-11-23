import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { UserRound } from "lucide-react";
import { getLeader, getSiteMap, sitemapEntries, withPlaceholder } from "@/features/public/data";
import { PageSkeleton } from "@/features/public/components/bits";
import { pageMetadata } from "@/features/public/metadata";
import { RichText } from "@/features/public/components/rich-text";
import { Container, MoreLink, PublicImage, Section } from "@/features/public/components/bits";
import { Crumbs } from "@/features/public/components/editorial";
import { CATEGORY_LABEL, type LeadershipCategory } from "@/features/leadership/labels";

export async function generateMetadata({ params }: PageProps<"/leadership/[slug]">): Promise<Metadata> {
  const p = await getLeader((await params).slug);
  if (!p) notFound();
  return pageMetadata({ title: p.full_name, seoTitle: p.seo_title, description: p.seo_description ?? p.job_title, image: p.photo, path: `/leadership/${p.slug}` });
}

/** Published items are built ahead of time; new ones are built on their first visit. */
export async function generateStaticParams() {
  const { leadership } = await sitemapEntries();
  return withPlaceholder(leadership.map((r) => ({ slug: r.slug })));
}

export default function LeaderPage({ params }: PageProps<"/leadership/[slug]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Leader params={params} />
    </Suspense>
  );
}

async function Leader({ params }: { params: PageProps<"/leadership/[slug]">["params"] }) {
  const [p, site] = await Promise.all([getLeader((await params).slug), getSiteMap()]);
  if (!p) notFound();
  return (
    <>
      <header className="border-b border-steel bg-ivory">
        <div className="enter mx-auto w-full max-w-[79rem] px-5 pt-10 pb-14 sm:px-8 sm:pt-14 lg:pb-20">
          <Crumbs
            items={[
              { label: "VECTIS", href: "/" },
              { label: "Leadership", href: site.core.has("leadership") ? "/leadership" : undefined },
              { label: p.full_name },
            ]}
          />
          <div className="mt-10 grid items-end gap-10 md:grid-cols-12 md:gap-6 lg:mt-14">
            <div className="aspect-[4/5] w-full max-w-72 overflow-hidden bg-steel/25 md:col-span-4 md:max-w-none lg:col-span-3">
              {p.photo ? (
                <PublicImage img={{ ...p.photo, alt: p.photo.alt || p.full_name }} eager className="h-full w-full object-cover object-top" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <UserRound className="size-20 text-indigo/40" aria-hidden />
                </div>
              )}
            </div>
            <div className="md:col-span-8 lg:col-span-8 lg:col-start-5">
              <p className="t-label text-teal">{CATEGORY_LABEL[p.category as LeadershipCategory]}</p>
              <h1 className="t-h1 mt-4 text-indigo">{p.full_name}</h1>
              {p.job_title ? <p className="t-lead mt-4 text-[var(--ink-muted)]">{p.job_title}</p> : null}
            </div>
          </div>
        </div>
      </header>
      <Container className="grid gap-12 py-14 lg:grid-cols-12 lg:gap-6 lg:py-20">
        <div className="reveal lg:col-span-7">{p.biography ? <RichText doc={p.biography} className="t-body" /> : null}</div>
        {p.roles.length ? (
          <aside aria-labelledby="roles" className="reveal lg:col-span-4 lg:col-start-9">
            <h2 id="roles" className="t-label mb-3 text-[var(--ink-muted)]">
              Roles
            </h2>
            <ul className="border-t border-indigo">
              {p.roles.map((r) => (
                <li key={r.company} className="border-b border-steel py-4">
                  <span className="font-serif text-lg text-indigo">{r.href ? <Link href={r.href} className="underline-offset-4 hover:underline">{r.company}</Link> : r.company}</span>
                  {r.role ? <span className="mt-0.5 block text-[0.9375rem] text-[var(--ink-muted)]">{r.role}</span> : null}
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
