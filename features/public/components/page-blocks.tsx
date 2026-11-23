import type { PageData } from "../data";
import { RichText, richHeadings } from "./rich-text";
import { Container, PageHeading, PublicImage } from "./bits";
import type { Crumb } from "./editorial";

/** Reads a text field from a page's content. */
export const text = (page: PageData, key: string) => (typeof page.content[key] === "string" ? (page.content[key] as string) : null);

export type Item = { heading: string; text: string };
export const items = (page: PageData, key: string): Item[] =>
  Array.isArray(page.content[key]) ? (page.content[key] as Item[]).filter((i) => i && (i.heading || i.text)) : [];

/**
 * Heading band, page image and main text: the shape most pages share. The
 * main text sits in a comfortable reading column, offset on wide screens.
 */
export function StandardPage({ page, crumbs, children }: { page: PageData; eyebrow?: string; crumbs?: Crumb[]; children?: React.ReactNode }) {
  const image = page.images.image;
  return (
    <>
      <PageHeading title={page.title} intro={text(page, "intro")} crumbs={crumbs} />
      {image ? (
        <Container className="pt-10">
          <div className="reveal-image">
            <PublicImage img={image} eager className="aspect-[21/9] w-full object-cover" />
          </div>
        </Container>
      ) : null}
      <PageBody doc={page.content.body} bottom={!children} />
      {children}
    </>
  );
}

/**
 * A page's main text in a comfortable reading column. When the text has two
 * or more headings, the space beside it carries an index of them, which
 * follows the reader down the page; with fewer, the text simply starts at
 * the left rather than leaving that space empty.
 */
export function PageBody({ doc, bottom = true }: { doc: unknown; bottom?: boolean }) {
  if (!doc) return null;
  const headings = richHeadings(doc);
  // Sections below bring their own spacing, so the gap isn't doubled.
  const pad = bottom ? "py-14 lg:py-20" : "pt-14 lg:pt-20";
  if (headings.length < 2) {
    return (
      <Container className={pad}>
        <div className="reveal max-w-[42rem]">
          <RichText doc={doc} className="t-body" />
        </div>
      </Container>
    );
  }
  return (
    <Container className={pad}>
      <div className="lg:grid lg:grid-cols-12 lg:gap-6">
        <nav aria-labelledby="on-this-page" className="reveal mb-12 lg:col-span-3 lg:mb-0">
          <div className="lg:sticky lg:top-32">
            <p id="on-this-page" className="t-label border-b border-steel pb-3 text-[var(--ink-muted)]">
              On this page
            </p>
            <ol className="mt-2">
              {headings.map((h, i) => (
                <li key={h.id}>
                  <a
                    href={`#${h.id}`}
                    className="flex min-h-10 items-baseline gap-3 py-1 text-[0.9375rem] text-graphite underline-offset-4 hover:text-indigo hover:underline"
                  >
                    <span className="t-label t-index">{String(i + 1).padStart(2, "0")}</span>
                    <span>{h.label}</span>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>
        <div className="reveal max-w-[42rem] lg:col-span-8 lg:col-start-5">
          <RichText doc={doc} className="t-body" />
        </div>
      </div>
    </Container>
  );
}

/** Numbered entries ({ heading, text }) on hairlines: values, principles, highlights. */
export function ItemGrid({ list, numbered = true }: { list: Item[]; numbered?: boolean }) {
  if (!list.length) return null;
  return (
    <ol className="grid border-t border-indigo sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-3">
      {list.map((i, n) => (
        <li key={`${i.heading}-${n}`} className="reveal border-b border-steel py-8">
          {numbered ? <p className="t-label t-index">{String(n + 1).padStart(2, "0")}</p> : null}
          {i.heading ? <h3 className="t-h3 mt-3 text-indigo">{i.heading}</h3> : null}
          {i.text ? <p className="mt-3 text-[0.9375rem] leading-relaxed whitespace-pre-line text-[var(--ink-muted)]">{i.text}</p> : null}
        </li>
      ))}
    </ol>
  );
}

/** A vertical timeline: the date large on the left, the event on the right, joined by a copper line. */
export function Timeline({ list }: { list: { date: string; title?: string | null; text?: string | null }[] }) {
  if (!list.length) return null;
  return (
    <ol className="relative">
      <span aria-hidden className="absolute top-2 bottom-2 left-[5px] w-px bg-copper md:left-[calc(25%+5px)]" />
      {list.map((e, n) => (
        <li key={n} className="reveal relative grid gap-2 pb-12 pl-8 last:pb-0 md:grid-cols-4 md:gap-6 md:pl-0">
          <span aria-hidden className="absolute top-2 left-0 size-[11px] border border-copper bg-ivory md:left-[25%]" />
          <p className={`font-serif leading-none text-indigo md:pr-10 md:text-right ${e.date.length > 6 ? "text-xl md:text-2xl" : "text-3xl md:text-5xl"}`}>{e.date}</p>
          <div className="md:col-span-3 md:pl-12">
            {e.title ? <h3 className="t-h3 text-indigo">{e.title}</h3> : null}
            {e.text ? <p className="t-body mt-2 whitespace-pre-line text-[var(--ink-muted)]">{e.text}</p> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
