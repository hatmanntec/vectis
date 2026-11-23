import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, FileText } from "lucide-react";
import type { Doc, Img } from "../data";
import { PageHero, type BandTone, type Crumb } from "./editorial";

/** Page-width container. */
export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[79rem] px-5 sm:px-8 ${className}`}>{children}</div>;
}

/** An image from the media library (already optimised on upload). */
export function PublicImage({ img, className = "", eager = false }: { img: NonNullable<Img>; className?: string; eager?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={img.url}
      alt={img.alt}
      width={img.width ?? undefined}
      height={img.height ?? undefined}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className={className}
    />
  );
}

/**
 * The band at the top of every inner page: breadcrumb, title and lead.
 * Without `crumbs`, the trail is VECTIS › this page.
 */
export function PageHeading({
  title,
  intro,
  crumbs,
  tone,
  children,
}: {
  /** Kept for older callers; the breadcrumb now says where a page sits. */
  eyebrow?: string;
  title: string;
  intro?: string | null;
  crumbs?: Crumb[];
  tone?: BandTone;
  children?: ReactNode;
}) {
  return (
    <PageHero crumbs={crumbs ?? [{ label: "VECTIS", href: "/" }, { label: title }]} title={title} lead={intro} tone={tone}>
      {children}
    </PageHero>
  );
}

/** A titled section of a page (same look as Block). */
export function Section({ title, children, id, tone = "plain" }: { title?: string; children: ReactNode; id?: string; tone?: "plain" | "white" }) {
  const hid = title ? `${id ?? "s"}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` : undefined;
  return (
    <section id={id} aria-labelledby={hid} className={tone === "white" ? "bg-white" : ""}>
      <Container className="py-14 lg:py-20">
        {title ? (
          <div className="reveal relative mb-10 pt-5">
            <span aria-hidden className="draw-x absolute top-0 right-0 left-0 h-px bg-indigo" />
            <h2 id={hid} className="t-h3 text-indigo lg:text-[2rem]">
              {title}
            </h2>
          </div>
        ) : null}
        {children}
      </Container>
    </section>
  );
}

export function MoreLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="link-arrow min-h-11 text-[0.9375rem] text-indigo underline-offset-4 hover:underline">
      {children}
      <ArrowRight className="size-4" aria-hidden />
    </Link>
  );
}

/** Shown where a list has nothing published yet. */
export function Nothing({ children }: { children: ReactNode }) {
  return <p className="border-y border-steel py-12 text-center t-body text-[var(--ink-muted)]">{children}</p>;
}

/** A grid of gallery photographs. */
export function Gallery({ images }: { images: NonNullable<Img>[] }) {
  if (!images.length) return null;
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {images.map((img, i) => (
        <li key={`${img.url}-${i}`} className="reveal-image bg-steel/20">
          <a href={img.url} target="_blank" rel="noopener noreferrer" aria-label={img.alt ? `Open photo: ${img.alt}` : `Open photo ${i + 1}`} className="block overflow-hidden">
            <PublicImage img={img} className="aspect-[4/3] w-full object-cover transition-transform duration-700 hover:scale-[1.03]" />
          </a>
        </li>
      ))}
    </ul>
  );
}

const size = (b: number) => (b < 1024 * 1024 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`);

/** Downloadable public documents. */
export function Documents({ docs }: { docs: Doc[] }) {
  if (!docs.length) return null;
  return (
    <ul className="border-t border-indigo">
      {docs.map((d) => (
        <li key={d.url} className="reveal border-b border-steel">
          <a href={d.url} target="_blank" rel="noopener noreferrer" className="group flex min-h-14 items-center gap-4 py-4">
            <FileText className="size-5 shrink-0 text-copper" aria-hidden />
            <span className="min-w-0 flex-1 truncate font-serif text-lg text-indigo group-hover:underline group-hover:underline-offset-4">{d.name}</span>
            <span className="t-label text-[var(--ink-muted)]">PDF · {size(d.size)}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/** Small key–value facts (e.g. "Established 1956"). */
/** Facts rail: a Plex Mono label above each value, on hairlines. Empty facts are left out. */
export function Facts({ items }: { items: { label: string; value: ReactNode }[] }) {
  const shown = items.filter((i) => i.value !== null && i.value !== undefined && i.value !== "");
  if (!shown.length) return null;
  return (
    <dl className="border-t border-indigo">
      {shown.map((i) => (
        <div key={i.label} className="border-b border-steel py-4">
          <dt className="t-label text-[var(--ink-muted)]">{i.label}</dt>
          <dd className="mt-1.5 text-[0.9375rem] break-words text-graphite">{i.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Tag({ children, tone = "teal" }: { children: ReactNode; tone?: "teal" | "copper" | "indigo" }) {
  const cls = {
    teal: "border-teal/30 text-teal",
    copper: "border-copper/40 text-copper",
    indigo: "border-indigo/30 text-indigo",
  }[tone];
  return <span className={`t-label inline-block border px-2.5 py-1 ${cls}`}>{children}</span>;
}

/**
 * Shown for an instant while a page's content streams in. It fills the
 * screen, so the footer starts below it and nothing on screen jumps when
 * the content arrives.
 */
export function PageSkeleton() {
  return <div aria-hidden className="min-h-[100svh] bg-ivory" />;
}
