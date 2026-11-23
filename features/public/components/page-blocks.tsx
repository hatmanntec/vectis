import type { PageData } from "../data";
import { RichText } from "./rich-text";
import { Container, PageHeading, PublicImage } from "./bits";

/** Reads a text field from a page's content. */
export const text = (page: PageData, key: string) => (typeof page.content[key] === "string" ? (page.content[key] as string) : null);

export type Item = { heading: string; text: string };
export const items = (page: PageData, key: string): Item[] =>
  Array.isArray(page.content[key]) ? (page.content[key] as Item[]).filter((i) => i && (i.heading || i.text)) : [];

/** Heading, introduction, page image and main text: the shape most pages share. */
export function StandardPage({ page, eyebrow, children }: { page: PageData; eyebrow?: string; children?: React.ReactNode }) {
  const image = page.images.image;
  const body = page.content.body;
  return (
    <>
      <PageHeading eyebrow={eyebrow} title={page.title} intro={text(page, "intro")} />
      {image ? (
        <Container className="-mt-px">
          <PublicImage img={image} eager className="aspect-[21/9] w-full border border-t-0 border-border object-cover" />
        </Container>
      ) : null}
      {body ? (
        <Container className="py-14 sm:py-16">
          <RichText doc={body} className="max-w-3xl" />
        </Container>
      ) : null}
      {children}
    </>
  );
}

/** Cards for a list of { heading, text } entries (values, principles, highlights). */
export function ItemGrid({ list, numbered = false }: { list: Item[]; numbered?: boolean }) {
  if (!list.length) return null;
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((i, n) => (
        <li key={`${i.heading}-${n}`} className="border border-border bg-white p-7">
          {numbered ? <p className="mb-4 font-serif text-sm text-copper">{String(n + 1).padStart(2, "0")}</p> : <div className="mb-5 h-px w-10 bg-copper" aria-hidden />}
          {i.heading ? <h3 className="text-xl font-medium">{i.heading}</h3> : null}
          {i.text ? <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-muted-foreground">{i.text}</p> : null}
        </li>
      ))}
    </ul>
  );
}

/** A vertical timeline of { heading (date), text } entries. */
export function Timeline({ list }: { list: { date: string; title?: string | null; text?: string | null }[] }) {
  if (!list.length) return null;
  return (
    <ol className="relative max-w-3xl border-l-2 border-copper/40 pl-8">
      {list.map((e, n) => (
        <li key={n} className="relative pb-10 last:pb-0">
          <span className="absolute top-1.5 -left-[41px] size-4 border-2 border-copper bg-ivory" aria-hidden />
          {e.date ? <p className="font-serif text-lg text-copper">{e.date}</p> : null}
          {e.title ? <h3 className="mt-1 text-xl font-medium">{e.title}</h3> : null}
          {e.text ? <p className="mt-2 leading-relaxed whitespace-pre-line text-muted-foreground">{e.text}</p> : null}
        </li>
      ))}
    </ol>
  );
}
