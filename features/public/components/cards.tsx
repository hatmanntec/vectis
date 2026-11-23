import Link from "next/link";
import { Building2, CalendarDays, MapPin, UserRound } from "lucide-react";
import { formatDate } from "@/lib/cms/status";
import { NATURE_LABEL, INVESTMENT_STATUS_LABEL, type InvestmentStatus, type Nature } from "@/features/investments/labels";
import { PROJECT_STATUS_LABEL, type ProjectStatus } from "@/features/projects/labels";
import { NEWS_TYPE_LABEL, type NewsType } from "@/features/news/labels";
import type { CompanyCard as CompanyCardData, Img } from "../data";
import { PublicImage, Tag } from "./bits";

/** Cards: square, on a hairline, with a copper rule that draws in on hover or focus. */
const card = "group relative flex h-full flex-col border-t border-indigo bg-transparent pt-5 pb-6";
const rule = "pointer-events-none absolute -top-px left-0 h-0.5 w-0 bg-copper transition-[width] duration-500 group-hover:w-full group-focus-visible:w-full";
const title = "font-serif text-[1.375rem] leading-snug text-indigo group-hover:underline group-hover:underline-offset-4";

export function CompanyCard({ c }: { c: CompanyCardData }) {
  return (
    <Link href={`/businesses/${c.slug}`} className={card}>
      <div className="flex h-36 items-center justify-center border-b border-border bg-white p-6">
        {c.logo ? (
          <PublicImage img={c.logo} className="max-h-full max-w-[70%] object-contain" />
        ) : (
          <span className="font-serif text-2xl text-indigo">{c.name}</span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-xl font-medium group-hover:underline">{c.name}</h3>
        {c.shortDescription ? <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.shortDescription}</p> : null}
        {c.sectors.length ? (
          <div className="mt-auto flex flex-wrap gap-2 pt-4">
            {c.sectors.map((s) => (
              <Tag key={s.slug}>{s.name}</Tag>
            ))}
          </div>
        ) : null}
      </div>
    </Link>
  );
}

export function InvestmentCard({
  i,
}: {
  i: { slug: string; investor: string; investee: string; nature: string; nature_note: string | null; investment_status: string; summary: string | null; logo: Img };
}) {
  return (
    <Link href={`/investments/${i.slug}`} className={card}>
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex items-start gap-4">
          <span className="flex size-14 shrink-0 items-center justify-center border border-border bg-white">
            {i.logo ? <PublicImage img={i.logo} className="max-h-full max-w-full object-contain p-1" /> : <Building2 className="size-5 text-steel" aria-hidden />}
          </span>
          <div className="min-w-0">
            <h3 className="text-lg leading-snug font-medium group-hover:underline">{i.investee}</h3>
            <p className="text-sm text-muted-foreground">{`Investment by ${i.investor}`}</p>
          </div>
        </div>
        {i.summary ? <p className="text-sm leading-relaxed text-muted-foreground">{i.summary}</p> : null}
        <div className="mt-auto flex flex-wrap gap-2">
          <Tag tone="indigo">{i.nature_note ?? NATURE_LABEL[i.nature as Nature]}</Tag>
          {i.investment_status !== "active" ? <Tag tone="copper">{INVESTMENT_STATUS_LABEL[i.investment_status as InvestmentStatus]}</Tag> : null}
        </div>
      </div>
    </Link>
  );
}

export function ProjectCard({
  p,
}: {
  p: { slug: string; title: string; summary: string | null; project_status: string; location_name?: string | null; state: string | null; cover: Img; company?: string };
}) {
  const place = [p.location_name, p.state].filter(Boolean).join(", ");
  return (
    <Link href={`/projects/${p.slug}`} className={card}>
      <span aria-hidden className={rule} />
      <div className="reveal-image mb-5 aspect-[16/9] bg-indigo">
        {p.cover ? (
          <PublicImage img={p.cover} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(ellipse_at_80%_20%,rgba(40,91,89,0.45)_0%,transparent_60%)]" aria-hidden />
        )}
      </div>
      <p className="t-label text-teal">{PROJECT_STATUS_LABEL[p.project_status as ProjectStatus]}</p>
      <h3 className={`mt-2 ${title}`}>{p.title}</h3>
      {p.company ? <p className="t-label mt-2 text-[var(--ink-muted)]">{p.company}</p> : null}
      {p.summary ? <p className="mt-3 text-[0.9375rem] leading-relaxed text-[var(--ink-muted)]">{p.summary}</p> : null}
      {place ? (
        <p className="mt-auto flex items-center gap-1.5 pt-4 text-sm text-[var(--ink-muted)]">
          <MapPin className="size-4 text-copper" aria-hidden />
          {place}
        </p>
      ) : null}
    </Link>
  );
}

export function NewsCard({
  n,
}: {
  n: { slug: string; title: string; news_type: string; excerpt: string | null; published_at: string | null; cover: Img; is_featured?: boolean };
}) {
  return (
    <Link href={`/news/${n.slug}`} className={card}>
      <span aria-hidden className={rule} />
      {n.cover ? (
        <div className="reveal-image mb-5 aspect-[16/9] bg-steel/20">
          <PublicImage img={n.cover} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
        </div>
      ) : null}
      <p className="t-label flex flex-wrap items-center gap-x-3 gap-y-1 text-[var(--ink-muted)]">
        <span className="text-teal">{NEWS_TYPE_LABEL[n.news_type as NewsType]}</span>
        {n.published_at ? (
          <span className="flex items-center gap-1">
            <CalendarDays className="size-3.5" aria-hidden />
            <time dateTime={n.published_at}>{formatDate(n.published_at)}</time>
          </span>
        ) : null}
      </p>
      <h3 className={`mt-3 ${title}`}>{n.title}</h3>
      {n.excerpt ? <p className="mt-3 text-[0.9375rem] leading-relaxed text-[var(--ink-muted)]">{n.excerpt}</p> : null}
    </Link>
  );
}

export function PersonCard({ p }: { p: { slug: string; full_name: string; job_title: string | null; photo: Img; role?: string | null } }) {
  return (
    <Link href={`/leadership/${p.slug}`} className={card}>
      <span aria-hidden className={rule} />
      <div className="reveal-image mb-5 aspect-[4/5] bg-steel/25">
        {p.photo ? (
          <PublicImage img={{ ...p.photo, alt: p.photo.alt || p.full_name }} className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.02]" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <UserRound className="size-16 text-indigo/40" aria-hidden />
          </div>
        )}
      </div>
      <h3 className={title}>{p.full_name}</h3>
      {p.role ?? p.job_title ? <p className="t-label mt-2 text-[var(--ink-muted)]">{p.role ?? p.job_title}</p> : null}
    </Link>
  );
}
