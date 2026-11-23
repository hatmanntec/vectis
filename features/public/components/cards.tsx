import Link from "next/link";
import { Building2, CalendarDays, MapPin, UserRound } from "lucide-react";
import { formatDate } from "@/lib/cms/status";
import { NATURE_LABEL, INVESTMENT_STATUS_LABEL, type InvestmentStatus, type Nature } from "@/features/investments/labels";
import { PROJECT_STATUS_LABEL, type ProjectStatus } from "@/features/projects/labels";
import { NEWS_TYPE_LABEL, type NewsType } from "@/features/news/labels";
import type { CompanyCard as CompanyCardData, Img } from "../data";
import { PublicImage, Tag } from "./bits";

const card = "group flex h-full flex-col border border-border bg-white transition-shadow hover:shadow-[0_8px_30px_-12px_rgba(13,17,90,0.25)]";

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
      <div className="aspect-[16/9] overflow-hidden border-b border-border bg-indigo/5">
        {p.cover ? (
          <PublicImage img={p.cover} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
        ) : (
          <div className="h-full w-full bg-[linear-gradient(135deg,var(--vectis-indigo),#1b2070)]" aria-hidden />
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex flex-wrap gap-2">
          <Tag>{PROJECT_STATUS_LABEL[p.project_status as ProjectStatus]}</Tag>
        </div>
        <h3 className="text-xl font-medium group-hover:underline">{p.title}</h3>
        {p.company ? <p className="mt-1 text-sm text-muted-foreground">{p.company}</p> : null}
        {p.summary ? <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.summary}</p> : null}
        {place ? (
          <p className="mt-auto flex items-center gap-1.5 pt-4 text-sm text-muted-foreground">
            <MapPin className="size-4 text-copper" aria-hidden />
            {place}
          </p>
        ) : null}
      </div>
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
      {n.cover ? (
        <div className="aspect-[16/9] overflow-hidden border-b border-border">
          <PublicImage img={n.cover} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
        </div>
      ) : null}
      <div className="flex flex-1 flex-col p-6">
        <p className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium tracking-[0.14em] text-copper uppercase">
          <span>{NEWS_TYPE_LABEL[n.news_type as NewsType]}</span>
          {n.published_at ? (
            <span className="flex items-center gap-1 tracking-normal text-muted-foreground normal-case">
              <CalendarDays className="size-3.5" aria-hidden />
              <time dateTime={n.published_at}>{formatDate(n.published_at)}</time>
            </span>
          ) : null}
        </p>
        <h3 className="text-xl leading-snug font-medium group-hover:underline">{n.title}</h3>
        {n.excerpt ? <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{n.excerpt}</p> : null}
      </div>
    </Link>
  );
}

export function PersonCard({ p }: { p: { slug: string; full_name: string; job_title: string | null; photo: Img; role?: string | null } }) {
  return (
    <Link href={`/leadership/${p.slug}`} className={card}>
      <div className="aspect-[4/5] overflow-hidden border-b border-border bg-indigo/5">
        {p.photo ? (
          <PublicImage img={{ ...p.photo, alt: p.photo.alt || p.full_name }} className="h-full w-full object-cover object-top" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <UserRound className="size-16 text-steel" aria-hidden />
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-lg leading-snug font-medium group-hover:underline">{p.full_name}</h3>
        {p.role ?? p.job_title ? <p className="mt-1 text-sm text-muted-foreground">{p.role ?? p.job_title}</p> : null}
      </div>
    </Link>
  );
}
