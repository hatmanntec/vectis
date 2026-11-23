import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProject } from "@/features/public/data";
import { PageSkeleton } from "@/features/public/components/bits";
import { pageMetadata } from "@/features/public/metadata";
import { RichText } from "@/features/public/components/rich-text";
import { Container, Documents, Facts, Gallery, MoreLink, PageHeading, PublicImage, Section, Tag } from "@/features/public/components/bits";
import { Timeline } from "@/features/public/components/page-blocks";
import { PROJECT_STATUS_LABEL, type ProjectStatus } from "@/features/projects/labels";
import { formatDate } from "@/lib/cms/status";

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const p = await getProject((await params).slug);
  if (!p) notFound();
  return pageMetadata({ title: p.title, seoTitle: p.seo_title, description: p.seo_description ?? p.summary, image: p.cover, path: `/projects/${p.slug}` });
}

export default function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Project params={params} />
    </Suspense>
  );
}

async function Project({ params }: { params: PageProps<"/projects/[slug]">["params"] }) {
  const p = await getProject((await params).slug);
  if (!p) notFound();
  const place = [p.location_name, p.state, p.country].filter(Boolean).join(", ");
  const map =
    p.latitude !== null && p.longitude !== null
      ? `https://www.openstreetmap.org/?mlat=${p.latitude}&mlon=${p.longitude}#map=12/${p.latitude}/${p.longitude}`
      : null;
  return (
    <>
      <PageHeading
        crumbs={[{ label: "VECTIS", href: "/" }, { label: "Projects", href: "/projects" }, { label: p.title }]}
        title={p.title}
        intro={p.summary}
      >
        <div className="mt-10 flex flex-wrap gap-2 lg:mt-14">
          <Tag>{PROJECT_STATUS_LABEL[p.project_status as ProjectStatus]}</Tag>
          {p.sector ? <Tag tone="indigo">{p.sector.name}</Tag> : null}
        </div>
      </PageHeading>
      {p.cover ? (
        <Container className="pt-10">
          <div className="reveal-image">
            <PublicImage img={p.cover} eager className="aspect-[21/9] w-full object-cover" />
          </div>
        </Container>
      ) : null}
      <Container className="grid gap-12 py-14 lg:grid-cols-12 lg:gap-6 lg:py-20">
        {p.description ? (
          <div className="reveal lg:col-span-7">
            <RichText doc={p.description} className="t-body" />
          </div>
        ) : null}
        <aside aria-label="Key facts" className={`reveal ${p.description ? "lg:col-span-4 lg:col-start-9" : "lg:col-span-5"}`}>
          <Facts
            items={[
              { label: "Business", value: p.company.href ? <Link href={p.company.href} className="text-indigo underline underline-offset-4">{p.company.name}</Link> : p.company.name },
              { label: "Location", value: place || null },
              { label: "Started", value: p.start_date ? formatDate(p.start_date) : null },
              { label: p.project_status === "completed" ? "Completed" : "Completion", value: p.end_date ? formatDate(p.end_date) : null },
              { label: "Map", value: map ? <a href={map} target="_blank" rel="noopener noreferrer" className="text-indigo underline underline-offset-4">View on map<span className="sr-only"> (opens in a new tab)</span></a> : null },
            ]}
          />
        </aside>
      </Container>
      {p.milestones.length ? (
        <Section title="Timeline" tone="white">
          <Timeline
            list={p.milestones.map((m) => ({ date: m.milestone_date ? formatDate(m.milestone_date) : "", title: m.title, text: m.description }))}
          />
        </Section>
      ) : null}
      {p.gallery.length ? (
        <Section title="Gallery">
          <Gallery images={p.gallery} />
        </Section>
      ) : null}
      {p.documents.length ? (
        <Section title="Documents" tone="white">
          <Documents docs={p.documents} />
        </Section>
      ) : null}
      <Section>
        <MoreLink href="/projects">All projects</MoreLink>
      </Section>
    </>
  );
}
