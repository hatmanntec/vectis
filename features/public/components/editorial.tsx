import Link from "next/link";
import type { ReactNode } from "react";
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
    <div className="reveal grid gap-6 lg:grid-cols-12 lg:gap-6">
      <div className="lg:col-span-5">
        <p className={`t-label flex items-center gap-3 ${dark ? "text-ivory/80" : "text-[var(--ink-muted)]"}`}>
          {index ? <span className={dark ? "text-ivory" : "text-copper"}>{index}</span> : null}
          {index ? <span aria-hidden className={`h-px w-6 ${dark ? "bg-ivory/40" : "bg-steel"}`} /> : null}
          <span>{label}</span>
        </p>
        <H id={headingId} className={`mt-5 ${H === "h1" ? "t-h1" : "t-h2"} ${dark ? "text-white" : "text-indigo"}`}>{title}</H>
      </div>
      {lead || action ? (
        <div className="flex flex-col justify-end gap-6 lg:col-span-6 lg:col-start-7">
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
export function ValueChain({ tone = "dark", className = "" }: { tone?: Tone; className?: string }) {
  const dark = tone === "dark";
  const text = dark ? "text-ivory/85" : "text-graphite";
  const num = dark ? "text-ivory" : "text-copper";
  return (
    <div className={className}>
      <p className="sr-only">The VECTIS value chain: {VALUE_CHAIN.join(", then ")}.</p>
      <ol aria-hidden className="relative hidden grid-cols-5 md:grid">
        <span className="absolute top-[5px] right-0 left-0 h-px bg-copper" />
        {VALUE_CHAIN.map((stage, i) => (
          <li key={stage} className="relative pt-7">
            <span className={`absolute top-0 left-0 size-[11px] border border-copper ${i === VALUE_CHAIN.length - 1 ? "bg-copper" : dark ? "bg-indigo" : "bg-ivory"}`} />
            <span className={`t-label block ${num}`}>{String(i + 1).padStart(2, "0")}</span>
            <span className={`mt-1 block font-serif text-xl ${text}`}>{stage}</span>
          </li>
        ))}
      </ol>
      <ol aria-hidden className="relative space-y-3 border-l border-copper pl-5 md:hidden">
        {VALUE_CHAIN.map((stage, i) => (
          <li key={stage} className="relative flex items-baseline gap-3">
            <span className={`absolute top-[7px] -left-[26px] size-[11px] border border-copper ${i === VALUE_CHAIN.length - 1 ? "bg-copper" : dark ? "bg-indigo" : "bg-ivory"}`} />
            <span className={`t-label ${num}`}>{String(i + 1).padStart(2, "0")}</span>
            <span className={`font-serif text-lg ${text}`}>{stage}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
