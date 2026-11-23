import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, FileText } from "lucide-react";
import type { Doc, Img } from "../data";

/** Page-width container. */
export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-6xl px-5 sm:px-8 ${className}`}>{children}</div>;
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

/** The heading block at the top of every inner page. */
export function PageHeading({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow?: string;
  title: string;
  intro?: string | null;
  children?: ReactNode;
}) {
  return (
    <header className="border-b border-border bg-white">
      <Container className="py-14 sm:py-20">
        {eyebrow ? <p className="mb-4 text-xs font-medium tracking-[0.2em] text-copper uppercase">{eyebrow}</p> : null}
        <h1 className="max-w-4xl text-4xl leading-tight font-medium sm:text-5xl">{title}</h1>
        <div className="mt-6 h-px w-16 bg-copper" aria-hidden />
        {intro ? <p className="mt-6 max-w-3xl text-lg leading-relaxed whitespace-pre-line text-muted-foreground">{intro}</p> : null}
        {children}
      </Container>
    </header>
  );
}

/** A titled section of a page. */
export function Section({ title, children, id, tone = "plain" }: { title?: string; children: ReactNode; id?: string; tone?: "plain" | "white" }) {
  return (
    <section id={id} className={tone === "white" ? "border-y border-border bg-white" : ""} aria-label={title}>
      <Container className="py-14 sm:py-16">
        {title ? <h2 className="mb-8 text-2xl font-medium sm:text-3xl">{title}</h2> : null}
        {children}
      </Container>
    </section>
  );
}

export function MoreLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 text-sm font-medium text-indigo underline-offset-4 hover:underline">
      {children}
      <ArrowRight className="size-4" aria-hidden />
    </Link>
  );
}

/** Shown where a list has nothing published yet. */
export function Nothing({ children }: { children: ReactNode }) {
  return <p className="border border-dashed border-border px-6 py-10 text-center text-muted-foreground">{children}</p>;
}

/** A grid of gallery photographs. */
export function Gallery({ images }: { images: NonNullable<Img>[] }) {
  if (!images.length) return null;
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {images.map((img, i) => (
        <li key={`${img.url}-${i}`} className="overflow-hidden border border-border bg-white">
          <a href={img.url} target="_blank" rel="noopener noreferrer" aria-label={img.alt ? `Open photo: ${img.alt}` : `Open photo ${i + 1}`}>
            <PublicImage img={img} className="aspect-[4/3] w-full object-cover transition-transform duration-500 hover:scale-[1.03]" />
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
    <ul className="divide-y divide-border border border-border bg-white">
      {docs.map((d) => (
        <li key={d.url}>
          <a href={d.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-5 py-4 hover:bg-ivory/60">
            <FileText className="size-5 shrink-0 text-copper" aria-hidden />
            <span className="min-w-0 flex-1 truncate font-medium text-indigo">{d.name}</span>
            <span className="text-xs text-muted-foreground">PDF · {size(d.size)}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/** Small key–value facts (e.g. "Established 1956"). */
export function Facts({ items }: { items: { label: string; value: ReactNode }[] }) {
  const shown = items.filter((i) => i.value !== null && i.value !== undefined && i.value !== "");
  if (!shown.length) return null;
  return (
    <dl className="divide-y divide-border border border-border bg-white text-sm">
      {shown.map((i) => (
        <div key={i.label} className="grid grid-cols-[9rem_minmax(0,1fr)] gap-4 px-5 py-3">
          <dt className="text-muted-foreground">{i.label}</dt>
          <dd className="break-words text-graphite">{i.value}</dd>
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
  return <span className={`inline-block border px-2 py-0.5 text-xs font-medium ${cls}`}>{children}</span>;
}
