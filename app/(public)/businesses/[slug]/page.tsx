import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getBusiness } from "@/features/public/data";
import { pageMetadata } from "@/features/public/metadata";
import { RichText } from "@/features/public/components/rich-text";
import { Container, Documents, Facts, Gallery, PageHeading, PublicImage, Section, Tag } from "@/features/public/components/bits";
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

async function Business({ params }: { params: PageProps<"/businesses/[slug]">["params"] }) {
  const c = await getBusiness((await params).slug);
  if (!c) notFound();
  const website = c.website && /^https?:\/\//i.test(c.website) ? c.website : null;

  return (
    <>
      <PageHeading eyebrow={c.parent ? `Part of ${c.parent.name}` : undefined} title={c.name} intro={c.shortDescription}>
        {c.sectors.length ? (
          <div className="mt-6 flex flex-wrap gap-2">
            {c.sectors.map((s) => (
              <Tag key={s.slug}>{s.name}</Tag>
            ))}
          </div>
        ) : null}
      </PageHeading>
      {c.cover ? (
        <Container>
          <PublicImage img={c.cover} eager className="aspect-[21/9] w-full border border-t-0 border-border object-cover" />
        </Container>
      ) : null}

      <Container className={`grid gap-12 py-14 sm:py-16 ${c.description ? "lg:grid-cols-[minmax(0,1fr)_20rem]" : "max-w-3xl"}`}>
        {c.description ? <RichText doc={c.description} /> : null}
        <aside className="space-y-6">
          {c.logo ? (
            <div className="flex h-40 items-center justify-center border border-border bg-white p-6">
              <PublicImage img={{ ...c.logo, alt: c.logo.alt || c.name }} className="max-h-full max-w-full object-contain" />
            </div>
          ) : null}
          <Facts
            items={[
              { label: "Established", value: c.establishedYear },
              {
                label: "Part of",
                value: c.parent ? c.parent.href ? <Link href={c.parent.href} className="text-indigo underline">{c.parent.name}</Link> : c.parent.name : null,
              },
              { label: "Website", value: website ? <a href={website} target="_blank" rel="noopener noreferrer" className="text-indigo underline">{website.replace(/^https?:\/\//, "")}</a> : null },
              { label: "Email", value: c.email ? <a href={`mailto:${c.email}`} className="text-indigo underline">{c.email}</a> : null },
              { label: "Telephone", value: c.phone ? <a href={`tel:${c.phone.replace(/[^\d+]/g, "")}`} className="text-indigo underline">{c.phone}</a> : null },
              { label: "Address", value: c.address ? <span className="whitespace-pre-line">{c.address}</span> : null },
            ]}
          />
        </aside>
      </Container>

      {c.children.length ? (
        <Section title="Group companies" tone="white">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {c.children.map((k) => (
              <li key={k.id}>
                <Link href={`/businesses/${k.slug}`} className="block h-full border border-border bg-white p-5 hover:border-indigo">
                  <span className="font-serif text-lg text-indigo">{k.name}</span>
                  {k.short_description ? <span className="mt-2 block text-sm text-muted-foreground">{k.short_description}</span> : null}
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {c.investmentsMade.length || c.investmentsReceived.length ? (
        <Section title="Investments">
          <ul className="divide-y divide-border border border-border bg-white">
            {c.investmentsMade.map((i) => (
              <li key={i.id}>
                <Link href={`/investments/${i.slug}`} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 hover:bg-ivory/50">
                  <span className="font-medium text-indigo">{`Investment in ${i.otherName}`}</span>
                  <Tag tone="indigo">{i.nature_note ?? NATURE_LABEL[i.nature as Nature]}</Tag>
                </Link>
              </li>
            ))}
            {c.investmentsReceived.map((i) => (
              <li key={i.id}>
                <Link href={`/investments/${i.slug}`} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 hover:bg-ivory/50">
                  <span className="font-medium text-indigo">{`Investment by ${i.otherName}`}</span>
                  <Tag tone="indigo">{i.nature_note ?? NATURE_LABEL[i.nature as Nature]}</Tag>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {c.relationships.length ? (
        <Section title="Partnerships and affiliations" tone="white">
          <ul className="grid gap-4 sm:grid-cols-2">
            {c.relationships.map((r, n) => (
              <li key={n} className="border border-border bg-white p-5">
                <p className="text-xs font-medium tracking-[0.14em] text-copper uppercase">{RELATIONSHIP_LABEL[r.relationship_type as RelationshipType]}</p>
                <p className="mt-2 font-serif text-lg text-indigo">
                  {r.otherHref ? <Link href={r.otherHref} className="hover:underline">{r.otherName}</Link> : r.otherName}
                </p>
                {r.description ? <p className="mt-2 text-sm text-muted-foreground">{r.description}</p> : null}
                {year(r.start_date) ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Since {year(r.start_date)}
                    {year(r.end_date) ? ` · until ${year(r.end_date)}` : ""}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {c.projects.length ? (
        <Section title="Projects">
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {c.projects.map((p) => (
              <li key={p.id}>
                <ProjectCard p={p} />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {c.people.length ? (
        <Section title="Leadership" tone="white">
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {c.people.map((p) => (
              <li key={p.id}>
                <PersonCard p={p} />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {c.gallery.length ? (
        <Section title="Gallery">
          <Gallery images={c.gallery} />
        </Section>
      ) : null}

      {c.documents.length ? (
        <Section title="Documents" tone="white">
          <Documents docs={c.documents} />
        </Section>
      ) : null}

      {c.news.length ? (
        <Section title="News">
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {c.news.map((n) => (
              <li key={n.id}>
                <NewsCard n={{ ...n, excerpt: null, cover: null }} />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
    </>
  );
}
