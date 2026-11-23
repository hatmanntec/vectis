"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { Plus } from "lucide-react";

export type ClusterRow = {
  index: string;
  heading: string;
  text: string;
  businesses: { name: string; slug: string }[];
};

/**
 * The five clusters as an editorial index (01–05). A row with businesses
 * opens to list them: on hover with a mouse, or by tapping or pressing its
 * button. One row is open at a time.
 */
export function ClusterIndex({ rows }: { rows: ClusterRow[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <ol className="border-t border-indigo">
      {rows.map((row, i) => (
        <Row
          key={`${row.index}-${row.heading}`}
          row={row}
          open={open === i}
          onToggle={() => setOpen((cur) => (cur === i ? null : i))}
          onHover={() => setOpen(i)}
        />
      ))}
    </ol>
  );
}

function Row({ row, open, onToggle, onHover }: { row: ClusterRow; open: boolean; onToggle: () => void; onHover: () => void }) {
  const id = useId();
  const expandable = row.businesses.length > 0;
  const head = (
    <>
      <span className="t-label pt-2 text-copper lg:col-span-1">{row.index}</span>
      <span className="font-serif text-[1.625rem] leading-tight text-indigo lg:col-span-4 lg:text-[2rem]">{row.heading}</span>
      <span className="t-body text-[var(--ink-muted)] lg:col-span-5 lg:pt-1.5">{row.text}</span>
    </>
  );
  return (
    <li
      className="reveal border-b border-steel"
      onPointerEnter={(e) => expandable && e.pointerType === "mouse" && onHover()}
    >
      {expandable ? (
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={onToggle}
          className="group grid w-full gap-3 py-7 text-left lg:grid-cols-12 lg:gap-6 lg:py-9"
        >
          {head}
          <span className="flex items-center gap-3 lg:col-span-2 lg:justify-end lg:pt-1.5">
            <span className="t-label text-[var(--ink-muted)]">
              {row.businesses.length} {row.businesses.length === 1 ? "business" : "businesses"}
            </span>
            <Plus aria-hidden className={`size-5 text-indigo transition-transform duration-200 ${open ? "rotate-45" : "group-hover:rotate-90"}`} />
          </span>
        </button>
      ) : (
        <div className="grid gap-3 py-7 lg:grid-cols-12 lg:gap-6 lg:py-9">{head}</div>
      )}
      {expandable ? (
        <div id={id} className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
          <div className="overflow-hidden" inert={!open}>
            <ul className="flex flex-wrap gap-x-8 gap-y-1 pb-8 lg:pl-[calc(100%/12+0.5rem)]">
              {row.businesses.map((b) => (
                <li key={b.slug}>
                  <Link href={`/businesses/${b.slug}`} className="link-arrow min-h-11 text-[0.9375rem] text-indigo underline-offset-4 hover:underline">
                    {b.name}
                    <span aria-hidden>→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </li>
  );
}
