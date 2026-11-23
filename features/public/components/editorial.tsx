import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { ArrowRight } from "lucide-react";

/**
 * Shared pieces of the "institutional editorial" design: section headers,
 * buttons, arrow links and the VECTIS value-chain line.
 */

type Tone = "light" | "dark";

/** Mono index and label ("03 — Businesses") over a Fraunces heading, with an optional lead, on a 5 + 7 grid. */
export function SectionHead({
  index,
  label,
  title,
  lead,
  tone = "light",
  action,
  as: H = "h2",
  headingId,
}: {
  index?: string;
  label: string;
  title: string;
  lead?: ReactNode;
  tone?: Tone;
  action?: ReactNode;
  as?: "h1" | "h2";
  /** Lets the section be named by its heading (aria-labelledby). */
  headingId?: string;
}) {
  const dark = tone === "dark";
  return (
    <div className="grid gap-6 lg:grid-cols-12 lg:gap-6">
      <div className="reveal lg:col-span-5">
        <p className={`t-label flex items-center gap-3 ${dark ? "text-ivory/80" : "text-[var(--ink-muted)]"}`}>
          {index ? <span className={dark ? "text-ivory" : "t-index"}>{index}</span> : null}
          {index ? <span aria-hidden className={`draw-x h-px w-6 ${dark ? "bg-ivory/40" : "bg-copper"}`} /> : null}
          <span>{label}</span>
        </p>
        <H id={headingId} className={`mt-5 ${H === "h1" ? "t-h1" : "t-h2"} ${dark ? "text-white" : "text-indigo"}`}>{title}</H>
      </div>
      {lead || action ? (
        <div className="reveal flex flex-col justify-end gap-6 lg:col-span-6 lg:col-start-7">
          {lead ? <div className={`t-lead ${dark ? "text-ivory/85" : "text-[var(--ink-muted)]"}`}>{lead}</div> : null}
          {action}
        </div>
      ) : null}
    </div>
  );
}

const buttonBase =
  "inline-flex min-h-12 items-center justify-center gap-2 px-6 text-[0.9375rem] font-medium transition-colors duration-200";

/** The two buttons: solid indigo (or ivory on dark), and outline on dark. */
export function ButtonLink({
  href,
  children,
  variant = "solid",
}: {
  href: string;
  children: ReactNode;
  variant?: "solid" | "solid-light" | "outline-light";
}) {
  const cls = {
    solid: "bg-indigo text-white hover:bg-[#1b2070]",
    "solid-light": "bg-ivory text-indigo hover:bg-white",
    "outline-light": "border border-ivory/60 text-white hover:border-white hover:bg-white/10",
  }[variant];
  return (
    <Link href={href} className={`${buttonBase} ${cls}`}>
      {children}
    </Link>
  );
}

/** A text link with an arrow that slides on hover. */
export function ArrowLink({ href, children, tone = "light" }: { href: string; children: ReactNode; tone?: Tone }) {
  return (
    <Link
      href={href}
      className={`link-arrow min-h-11 text-[0.9375rem] underline-offset-4 hover:underline ${tone === "dark" ? "text-white" : "text-indigo"}`}
    >
      {children}
      <ArrowRight aria-hidden className="size-4" />
    </Link>
  );
}

/** VECTIS's own model, from the group profile. */
export const VALUE_CHAIN = ["Capital", "Assets", "Operations", "Markets", "Impact"] as const;

/**
 * The value chain drawn as a copper line: across the page on tablets and
 * larger, down the side on phones.
 */
export function ValueChain({ tone = "dark", className = "", animate = false }: { tone?: Tone; className?: string; animate?: boolean }) {
  const dark = tone === "dark";
  const text = dark ? "text-ivory/85" : "text-graphite";
  const num = dark ? "text-ivory" : "t-index";
  return (
    <div className={className}>
      <p className="sr-only">The VECTIS value chain: {VALUE_CHAIN.join(", then ")}.</p>
      <ol aria-hidden className="relative hidden grid-cols-5 md:grid">
        <span className={`absolute top-[5px] right-0 left-0 h-px bg-copper ${animate ? "enter-draw" : ""}`} />
        {VALUE_CHAIN.map((stage, i) => (
          <li key={stage} className={`relative pt-7 ${animate ? "enter-step" : ""}`} style={animate ? ({ "--step": i } as CSSProperties) : undefined}>
            <span className={`absolute top-0 left-0 size-[11px] border border-copper ${i === VALUE_CHAIN.length - 1 ? "bg-copper" : dark ? "bg-indigo" : "bg-ivory"}`} />
            <span className={`t-label block ${num}`}>{String(i + 1).padStart(2, "0")}</span>
            <span className={`mt-1 block font-serif text-xl ${text}`}>{stage}</span>
          </li>
        ))}
      </ol>
      <ol aria-hidden className="relative space-y-3 border-l border-copper pl-5 md:hidden">
        {VALUE_CHAIN.map((stage, i) => (
          <li key={stage} className={`relative flex items-baseline gap-3 ${animate ? "enter-step" : ""}`} style={animate ? ({ "--step": i } as CSSProperties) : undefined}>
            <span className={`absolute top-[7px] -left-[26px] size-[11px] border border-copper ${i === VALUE_CHAIN.length - 1 ? "bg-copper" : dark ? "bg-indigo" : "bg-ivory"}`} />
            <span className={`t-label ${num}`}>{String(i + 1).padStart(2, "0")}</span>
            <span className={`font-serif text-lg ${text}`}>{stage}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export type Crumb = { label: string; href?: string };
export type BandTone = "ivory" | "indigo" | "teal" | "graphite";

const BAND: Record<BandTone, { bg: string; title: string; lead: string; label: string; rule: string; dark: boolean }> = {
  ivory: { bg: "bg-ivory", title: "text-indigo", lead: "text-[var(--ink-muted)]", label: "text-[var(--ink-muted)]", rule: "bg-steel", dark: false },
  indigo: { bg: "bg-indigo", title: "text-white", lead: "text-ivory/85", label: "text-ivory/80", rule: "bg-ivory/40", dark: true },
  teal: { bg: "bg-teal", title: "text-white", lead: "text-ivory/90", label: "text-ivory/85", rule: "bg-ivory/40", dark: true },
  graphite: { bg: "bg-graphite", title: "text-white", lead: "text-ivory/85", label: "text-ivory/80", rule: "bg-ivory/40", dark: true },
};

/** "VECTIS › Businesses › …": where this page sits. The last entry is the page itself. */
export function Crumbs({ items, tone = "ivory" }: { items: Crumb[]; tone?: BandTone }) {
  const t = BAND[tone];
  return (
    <nav aria-label="Breadcrumb">
      <ol className={`t-label flex flex-wrap items-center gap-x-2 gap-y-1 ${t.label}`}>
        {items.map((c, i) => (
          <li key={`${c.label}-${i}`} className="flex items-center gap-2">
            {i > 0 ? <span aria-hidden className={t.dark ? "text-ivory/60" : "text-copper"}>›</span> : null}
            {c.href && i < items.length - 1 ? (
              <Link href={c.href} className="inline-flex min-h-8 items-center underline-offset-4 hover:underline">
                {c.label}
              </Link>
            ) : (
              <span aria-current={i === items.length - 1 ? "page" : undefined}>{c.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** The top band of an inner page: breadcrumb, title and lead, in one of four tones. */
export function PageHero({
  crumbs,
  title,
  lead,
  tone = "ivory",
  children,
}: {
  crumbs: Crumb[];
  title: string;
  lead?: string | null;
  tone?: BandTone;
  children?: ReactNode;
}) {
  const t = BAND[tone];
  return (
    <header className={`${t.bg} ${t.dark ? "on-dark" : "border-b border-steel"}`}>
      <div className="enter mx-auto w-full max-w-[79rem] px-5 pt-10 pb-14 sm:px-8 sm:pt-14 lg:pb-20">
        <Crumbs items={crumbs} tone={tone} />
        <div className="mt-10 grid gap-8 lg:mt-14 lg:grid-cols-12 lg:gap-6">
          <h1 className={`t-h1 lg:col-span-7 ${t.title}`}>{title}</h1>
          {lead ? <p className={`t-lead whitespace-pre-line lg:col-span-5 lg:pt-3 ${t.lead}`}>{lead}</p> : null}
        </div>
        {children}
      </div>
    </header>
  );
}

/** A titled block within a page: mono label over a Fraunces heading, on a hairline. */
export function Block({
  label,
  title,
  children,
  tone = "white",
  id,
}: {
  label?: string;
  title: string;
  children: ReactNode;
  tone?: "white" | "ivory";
  id?: string;
}) {
  const hid = id ?? `block-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <section aria-labelledby={hid} className={tone === "ivory" ? "bg-ivory" : "bg-white"}>
      <div className="mx-auto w-full max-w-[79rem] px-5 py-14 sm:px-8 lg:py-20">
        <div className="reveal relative mb-10 pt-5">
          <span aria-hidden className="draw-x absolute top-0 right-0 left-0 h-px bg-indigo" />
          {label ? <p className="t-label text-[var(--ink-muted)]">{label}</p> : null}
          <h2 id={hid} className="t-h3 mt-2 text-indigo lg:text-[2rem]">
            {title}
          </h2>
        </div>
        {children}
      </div>
    </section>
  );
}

/** VECTIS › About › page (About is linked only when that page is published). */
export function aboutCrumbs(aboutPublished: boolean, title: string): Crumb[] {
  return [{ label: "VECTIS", href: "/" }, { label: "About", href: aboutPublished ? "/about" : undefined }, { label: title }];
}
