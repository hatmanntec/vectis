"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import type { Img } from "../../data";
import { PublicImage } from "../bits";

export type DirectoryGroup = {
  index?: string;
  name: string;
  items: { name: string; slug: string; shortDescription: string | null; logo: Img; sectors: { name: string; slug: string }[] }[];
};

/**
 * The businesses, grouped by cluster. On large screens, names sit on the
 * left and a detail panel on the right changes as you point at or tab to
 * each one. On phones and tablets it becomes an accordion, one per cluster.
 */
export function BusinessDirectory({ groups }: { groups: DirectoryGroup[] }) {
  const all = groups.flatMap((g) => g.items.map((item) => ({ item, group: g })));
  const [activeSlug, setActiveSlug] = useState(all[0]?.item.slug);
  const active = all.find((a) => a.item.slug === activeSlug) ?? all[0];
  if (!active) return null;

  return (
    <>
      {/* Large screens */}
      <div className="hidden lg:grid lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-5">
          {groups.map((g) => (
            <div key={g.name} className="mb-10 last:mb-0">
              <p className="t-label flex gap-2 border-b border-steel pb-3 text-[var(--ink-muted)]">
                {g.index ? <span className="text-copper">{g.index}</span> : null}
                <span>{g.name}</span>
              </p>
              <ul>
                {g.items.map((b) => {
                  const on = b.slug === active.item.slug;
                  return (
                    <li key={b.slug}>
                      <Link
                        href={`/businesses/${b.slug}`}
                        onPointerEnter={() => setActiveSlug(b.slug)}
                        onFocus={() => setActiveSlug(b.slug)}
                        className={`group relative flex min-h-12 items-center justify-between border-b border-steel/50 py-2 pr-2 font-serif text-xl transition-colors duration-200 ${
                          on ? "text-indigo" : "text-graphite hover:text-indigo"
                        }`}
                      >
                        <span>{b.name}</span>
                        <ArrowRight aria-hidden className={`size-4 transition-all duration-200 ${on ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0"}`} />
                        <span
                          aria-hidden
                          className={`absolute bottom-[-1px] left-0 h-px bg-copper transition-[width] duration-300 ${on ? "w-full" : "w-0"}`}
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
        <div className="lg:col-span-6 lg:col-start-7">
          <div className="sticky top-32 border border-steel bg-white p-10">
            <Detail item={active.item} group={active.group} />
          </div>
        </div>
      </div>

      {/* Phones and tablets */}
      <div className="border-t border-indigo lg:hidden">
        {groups.map((g, i) => (
          <Accordion key={g.name} group={g} defaultOpen={i === 0} />
        ))}
      </div>
    </>
  );
}

function Detail({ item, group }: { item: DirectoryGroup["items"][number]; group: DirectoryGroup }) {
  return (
    <div key={item.slug}>
      <p className="t-label flex gap-2 text-[var(--ink-muted)]">
        {group.index ? <span className="text-copper">{group.index}</span> : null}
        <span>{group.name}</span>
      </p>
      {item.logo ? <PublicImage img={item.logo} className="mt-8 h-14 w-auto object-contain" /> : null}
      <p className="mt-6 font-serif text-4xl leading-tight text-indigo">{item.name}</p>
      {item.shortDescription ? <p className="mt-5 t-lead text-[var(--ink-muted)]">{item.shortDescription}</p> : null}
      {item.sectors.length ? (
        <ul className="mt-8 flex flex-wrap gap-2" aria-label="Sectors">
          {item.sectors.map((s) => (
            <li key={s.slug} className="border border-steel px-2.5 py-1 t-label text-teal">
              {s.name}
            </li>
          ))}
        </ul>
      ) : null}
      <Link href={`/businesses/${item.slug}`} className="link-arrow mt-10 min-h-11 text-[0.9375rem] text-indigo underline-offset-4 hover:underline">
        View {item.name}
        <ArrowRight aria-hidden className="size-4" />
      </Link>
    </div>
  );
}

function Accordion({ group, defaultOpen }: { group: DirectoryGroup; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <div className="border-b border-steel">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="flex min-h-16 w-full items-center justify-between gap-4 py-4 text-left"
      >
        <span>
          {group.index ? <span className="t-label mr-3 text-copper">{group.index}</span> : null}
          <span className="font-serif text-xl text-indigo">{group.name}</span>
        </span>
        <ChevronDown aria-hidden className={`size-5 shrink-0 text-indigo transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      <ul id={id} hidden={!open} className="pb-4">
        {group.items.map((b) => (
          <li key={b.slug} className="border-t border-steel/50">
            <Link href={`/businesses/${b.slug}`} className="block py-4">
              <span className="link-arrow font-serif text-lg text-indigo">
                {b.name}
                <ArrowRight aria-hidden className="size-4" />
              </span>
              {b.shortDescription ? <span className="mt-1 block text-[0.9375rem] leading-relaxed text-[var(--ink-muted)]">{b.shortDescription}</span> : null}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
