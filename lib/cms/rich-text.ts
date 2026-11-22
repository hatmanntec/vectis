/**
 * Formatted text (descriptions, articles, biographies).
 *
 * The editor saves text as structured JSON, never as HTML. Before anything is
 * stored, the server rebuilds the document keeping ONLY the formatting below
 * and only safe links, so nothing harmful can be smuggled in through a form.
 */

export type RichNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: RichNode[];
  marks?: { type: string; attrs?: Record<string, unknown> }[];
  text?: string;
};
export type RichDoc = { type: "doc"; content: RichNode[] };

const BLOCKS = new Set(["paragraph", "heading", "bulletList", "orderedList", "listItem", "blockquote"]);
const INLINE = new Set(["text", "hardBreak"]);
const MARKS = new Set(["bold", "italic", "underline", "link"]);
const MAX_JSON_LENGTH = 200_000;
const MAX_DEPTH = 12;

export function safeHref(href: unknown): string | null {
  if (typeof href !== "string") return null;
  const h = href.trim();
  if (/^https?:\/\/[^\s]+$/i.test(h) || /^mailto:[^\s@]+@[^\s@]+$/i.test(h) || /^\/[^\s/][^\s]*$/.test(h)) return h.slice(0, 2000);
  return null;
}

function cleanNode(node: unknown, depth: number): RichNode | null {
  if (!node || typeof node !== "object" || depth > MAX_DEPTH) return null;
  const n = node as RichNode;

  if (n.type === "text") {
    if (typeof n.text !== "string" || n.text === "") return null;
    const marks = (Array.isArray(n.marks) ? n.marks : [])
      .filter((m) => m && MARKS.has(m.type))
      .map((m) => {
        if (m.type !== "link") return { type: m.type };
        const href = safeHref(m.attrs?.href);
        return href ? { type: "link", attrs: { href } } : null;
      })
      .filter((m): m is NonNullable<typeof m> => m !== null);
    return marks.length ? { type: "text", text: n.text.slice(0, 20_000), marks } : { type: "text", text: n.text.slice(0, 20_000) };
  }
  if (n.type === "hardBreak") return { type: "hardBreak" };
  if (!BLOCKS.has(n.type)) return null;

  const content = (Array.isArray(n.content) ? n.content : [])
    .map((c) => cleanNode(c, depth + 1))
    .filter((c): c is RichNode => c !== null)
    // Inline content only inside paragraphs/headings; blocks only elsewhere.
    .filter((c) => (n.type === "paragraph" || n.type === "heading" ? INLINE.has(c.type) : !INLINE.has(c.type)));

  const out: RichNode = { type: n.type };
  if (n.type === "heading") out.attrs = { level: n.attrs?.level === 3 ? 3 : 2 };
  if (n.type === "orderedList") {
    const start = Number(n.attrs?.start);
    out.attrs = { start: Number.isInteger(start) && start > 0 && start < 10000 ? start : 1 };
  }
  if (content.length) out.content = content;
  return out;
}

/**
 * Turns whatever the form sent into a clean document, or null if it's empty.
 * Returns "invalid" if it isn't a document at all.
 */
export function parseRichText(raw: unknown): RichDoc | null | "invalid" {
  if (raw === null || raw === undefined || raw === "") return null;
  if (typeof raw !== "string" || raw.length > MAX_JSON_LENGTH) return "invalid";
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return "invalid";
  }
  if (!data || typeof data !== "object" || (data as RichNode).type !== "doc") return "invalid";
  const content = ((data as RichNode).content ?? [])
    .map((c) => cleanNode(c, 1))
    .filter((c): c is RichNode => c !== null && !INLINE.has(c.type));
  const doc: RichDoc = { type: "doc", content };
  return richTextIsEmpty(doc) ? null : doc;
}

export function richTextIsEmpty(doc: RichDoc | null | undefined): boolean {
  if (!doc?.content?.length) return true;
  const hasText = (n: RichNode): boolean => (n.type === "text" && Boolean(n.text?.trim())) || (n.content ?? []).some(hasText);
  return !doc.content.some(hasText);
}
