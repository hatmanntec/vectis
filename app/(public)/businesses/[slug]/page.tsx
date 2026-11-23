import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getBusiness, listBusinesses } from "@/features/public/data";
import { clusterOf, type Cluster } from "@/features/public/clusters";
import { pageMetadata } from "@/features/public/metadata";
import { RichText } from "@/features/public/components/rich-text";
import { Container, Documents, Facts, Gallery, PublicImage } from "@/features/public/components/bits";
import { Block, PageHero, type BandTone, type Crumb } from "@/features/public/components/editorial";
import { ArrowRight } from "lucide-react";
import { NewsCard, PersonCard, ProjectCard } from "@/features/public/components/cards";
import { RELATIONSHIP_LABEL, type RelationshipType } from "@/features/companies/labels";
import { NATURE_LABEL, type Nature } from "@/features/investments/labels";

export async function generateMetadata({ params }: PageProps<"/businesses/[slug]">): Promise<Metadata> {
  const c = await getBusiness((await params).slug);
  if (!c) notFound();
  return pageMetadata({ title: c.name, seoTitle: c.seoTitle, description: c.seoDescription ?? c.shortDescription, image: c.cover ?? c.logo, path: `/businesses/${c.slug}` });
}

export default function BusinessPage({ params }: PageProps<"/businesses/[slug]">) {
  return (
    <Suspense fallback={<div className="h-96" />}>
      <Business params={params} />
    </Suspense>
  );
}

const year = (d: string | null) => (d ? d.slice(0, 4) : null);

/** The header band takes the cluster's colour: indigo for investment, teal for energy, graphite otherwise. */
const bandTone = (c: Cluster): BandTone => (c.tone === "indigo" ? "indigo" : c.tone === "teal" ? "teal" : "graphite");

async function Business({ params }: { params: PageProps<"/businesses/[slug]">["params"] }) {
  const [c, all] = await Promise.all([getBusiness((await params).slug), listBusinesses()]);
  if (!c) notFound();
  const website = c.website && /^https?:\/\//i.test(c.website) ? c.website : null;
  const isGroup = c.classification === "group";
  const cluster = clusterOf(c);

  // Lineage: VECTIS › Businesses › cluster › this business.
  const crumbs: Crumb[] = [{ label: "VECTIS", href: "/" }, { label: "Businesses", href: "/businesses" }];
  if (!isGroup) crumbs.push({ label: cluster.name, href: `/businesses#${cluster.key}` });
  crumbs.push({ label: c.name });

  // Other businesses in the same cluster (not this one, nor its own group companies, listed separately).
  const childIds = new Set(c.children.map((k) => k.id));
  const related = isGroup ? [] : all.filter((b) => b.id !== c.id && !childIds.has(b.id) && clusterOf(b).key === cluster.key).slice(0, 6);
  const link = "text-indigo underline underline-offset-4 hover:no-underline";

  return (
    <>
      <PageHero crumbs={crumbs} title={c.name} lead={c.shortDescription} tone={isGroup ? "indigo" : bandTone(cluster)}>
        {c.sectors.length ? (
          <ul aria-label="Sectors" className="mt-10 flex flex-wrap gap-2 lg:mt-14">
            {c.sectors.map((s) => (
              <li key={s.slug} className="t-label border border-ivory/40 px-2.5 py-1 text-ivory">
                {s.name}
              </li>
            ))}
          </ul>
        ) : null}
      </PageHero>
      {c.cover ? (
        <Container className="pt-10">
          <PublicImage img={c.cover} eager className="aspect-[21/9] w-full object-cover" />
        </Container>
      ) : null}

      <Container className="grid gap-12 py-14 lg:grid-cols-12 lg:gap-6 lg:py-20">
        <div className="lg:col-span-7">
          {c.parent ? <p className="t-label mb-6 text-[var(--ink-muted)]">{`Part of ${c.parent.name}`}</p> : null}
          {c.description ? <RichText doc={c.description} className="t-body" /> : c.shortDescription ? null : <p className="t-body text-[var(--ink-muted)]">A fuller profile will appear here soon.</p>}
        </div>
        <aside aria-label="Key facts" className="lg:col-span-4 lg:col-start-9">
          <div className="space-y-8 lg:sticky lg:top-32">
            {c.logo ? (
              <div className="flex h-32 items-center justify-center border border-steel bg-white p-6">
                <PublicImage img={{ ...c.logo, alt: c.logo.alt || c.name }} className="max-h-full max-w-full object-contain" />
              </div>
            ) : null}
            <Facts
              items={[
                { label: "Established", value: c.establishedYear },
                { label: "Cluster", value: isGroup ? null : cluster.key === "other" ? null : cluster.name },
                {
                  label: "Part of",
                  value: c.parent ? (
                    c.parent.href ? (
                      <Link href={c.parent.href} className={link}>
                        {c.parent.name}
                      </Link>
                    ) : (
                      c.parent.name
                    )
                  ) : null,
                },
                {
                  label: "Website",
                  value: website ? (
                    <a href={website} target="_blank" rel="noopener noreferrer" className={link}>
                      {website.replace(/^https?:\/\//, "")}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  ) : null,
                },
                { label: "Email", value: c.email ? <a href={`mailto:${c.email}`} className={link}>{c.email}</a> : null },
                { label: "Telephone", value: c.phone ? <a href={`tel:${c.phone.replace(/[^\d+]/g, "")}`} className={link}>{c.phone}</a> : null },
                { label: "Address", value: c.address ? <span className="whitespace-pre-line">{c.address}</span> : null },
              ]}
            />
          </div>
        </aside>
      </Container>

      {c.children.length ? (
        <Block label="Structure" title="Group companies" tone="ivory">
          <RowList
            rows={c.children.map((k) => ({ key: k.id, href: `/businesses/${k.slug}`, title: k.name, text: k.short_description }))}
          />
        </Block>
      ) : null}

      {c.investmentsMade.length || c.investmentsReceived.length ? (
        <Block label="Investments" title="Investment relationships">
          <RowList
            rows={[
              ...c.investmentsMade.map((i) => ({
                key: i.id,
                href: `/investments/${i.slug}`,
                title: `Investment in ${i.otherName}`,
                meta: i.nature_note ?? NATURE_LABEL[i.nature as Nature],
              })),
              ...c.investmentsReceived.map((i) => ({
                key: i.id,
                href: `/investments/${i.slug}`,
                title: `Investment by ${i.otherName}`,
                meta: i.nature_note ?? NATURE_LABEL[i.nature as Nature],
              })),
            ]}
          />
        </Block>
      ) : null}

      {c.relationships.length ? (
        <Block label="Relationships" title="Partnerships and affiliations" tone="ivory">
          <ul className="grid gap-x-6 border-t border-steel sm:grid-cols-2">
            {c.relationships.map((r, n) => (
              <li key={n} className="border-b border-steel py-6">
                <p className="t-label text-teal">{RELATIONSHIP_LABEL[r.relationship_type as RelationshipType]}</p>
                <p className="mt-2 font-serif text-xl text-indigo">
                  {r.otherHref ? (
                    <Link href={r.otherHref} className="underline-offset-4 hover:underline">
                      {r.otherName}
                    </Link>
                  ) : (
                    r.otherName
                  )}
                </p>
                {r.description ? <p className="mt-2 text-[0.9375rem] leading-relaxed text-[var(--ink-muted)]">{r.description}</p> : null}
                {year(r.start_date) ? (
                  <p className="t-label mt-3 text-[var(--ink-muted)]">
                    Since {year(r.start_date)}
                    {year(r.end_date) ? ` · until ${year(r.end_date)}` : ""}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </Block>
      ) : null}

      {c.projects.length ? (
        <Block label="Work" title="Projects">
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {c.projects.map((p) => (
              <li key={p.id}>
                <ProjectCard p={p} />
              </li>
            ))}
          </ul>
        </Block>
      ) : null}

      {c.people.length ? (
        <Block label="People" title="Leadership" tone="ivory">
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {c.people.map((p) => (
              <li key={p.id}>
                <PersonCard p={p} />
              </li>
            ))}
          </ul>
        </Block>
      ) : null}

      {c.gallery.length ? (
        <Block label="Gallery" title="Images">
          <Gallery images={c.gallery} />
        </Block>
      ) : null}

      {c.documents.length ? (
        <Block label="Downloads" title="Documents" tone="ivory">
          <Documents docs={c.documents} />
        </Block>
      ) : null}

      {c.news.length ? (
        <Block label="Latest" title="News">
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {c.news.map((n) => (
              <li key={n.id}>
                <NewsCard n={{ ...n, excerpt: null, cover: null }} />
              </li>
            ))}
          </ul>
        </Block>
      ) : null}

      {related.length ? (
        <Block label={cluster.key === "other" ? "More businesses" : cluster.name} title={cluster.key === "other" ? "Other VECTIS businesses" : "Related businesses"} tone="ivory" id="related">
          <RowList rows={related.map((b) => ({ key: b.id, href: `/businesses/${b.slug}`, title: b.name, text: b.shortDescription }))} />
        </Block>
      ) : null}
    </>
  );
}

/** Linked rows on hairlines: a Fraunces title, an optional line and a mono tag, with a copper rule on hover. */
function RowList({ rows }: { rows: { key: string; href: string; title: string; text?: string | null; meta?: string | null }[] }) {
  return (
    <ul className="grid gap-x-6 border-t border-indigo md:grid-cols-2">
      {rows.map((r) => (
        <li key={r.key} className="border-b border-steel">
          <Link href={r.href} className="group relative flex min-h-16 items-start justify-between gap-6 py-5">
            <span>
              <span className="block font-serif text-xl leading-snug text-indigo">{r.title}</span>
              {r.text ? <span className="mt-1 block text-[0.9375rem] leading-relaxed text-[var(--ink-muted)]">{r.text}</span> : null}
              {r.meta ? <span className="t-label mt-2 block text-teal">{r.meta}</span> : null}
            </span>
            <ArrowRight aria-hidden className="mt-1.5 size-4 shrink-0 text-indigo transition-transform duration-200 group-hover:translate-x-1" />
            <span aria-hidden className="absolute bottom-[-1px] left-0 h-px w-0 bg-copper transition-[width] duration-300 group-hover:w-full group-focus-visible:w-full" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
