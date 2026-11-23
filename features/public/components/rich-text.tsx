import type { ReactNode } from "react";
import { safeHref, type RichDoc, type RichNode } from "@/lib/cms/rich-text";

/**
 * Shows formatted text saved by the CMS editor. It is built element by
 * element from the stored JSON (never inserted as raw HTML), and links are
 * checked again before they are shown.
 */
/** The plain words of a node and everything inside it. */
function plain(n: RichNode): string {
  return n.type === "text" ? (n.text ?? "") : (n.content ?? []).map(plain).join("");
}

/** A heading's address on the page, made from its own words. */
export const headingId = (label: string) => `s-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;

/**
 * The main headings in a page's text, used for the "on this page" index.
 * Headings that repeat are listed once.
 */
export function richHeadings(doc: unknown): { id: string; label: string }[] {
  const d = doc as RichDoc | null;
  if (!d || !Array.isArray(d.content)) return [];
  const seen = new Set<string>();
  const out: { id: string; label: string }[] = [];
  for (const n of d.content) {
    if (n.type !== "heading" || n.attrs?.level === 3) continue;
    const label = plain(n).trim();
    const id = headingId(label);
    if (!label || seen.has(id)) continue;
    seen.add(id);
    out.push({ id, label });
  }
  return out;
}

function renderText(n: RichNode, key: number): ReactNode {
  let out: ReactNode = n.text ?? "";
  for (const m of n.marks ?? []) {
    if (m.type === "bold") out = <strong>{out}</strong>;
    else if (m.type === "italic") out = <em>{out}</em>;
    else if (m.type === "underline") out = <u>{out}</u>;
    else if (m.type === "link") {
      const href = safeHref(m.attrs?.href);
      if (href) {
        const external = /^https?:/i.test(href);
        out = (
          <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
            {out}
          </a>
        );
      }
    }
  }
  return <span key={key}>{out}</span>;
}

function renderNode(n: RichNode, key: number): ReactNode {
  const kids = (n.content ?? []).map((c, i) => renderNode(c, i));
  switch (n.type) {
    case "text":
      return renderText(n, key);
    case "hardBreak":
      return <br key={key} />;
    case "paragraph":
      return <p key={key}>{kids}</p>;
    case "heading": {
      if (n.attrs?.level === 3) return <h3 key={key}>{kids}</h3>;
      const label = plain(n).trim();
      // The id lets the "on this page" index link to it.
      return (
        <h2 key={key} id={label ? headingId(label) : undefined} className="scroll-mt-32">
          {kids}
        </h2>
      );
    }
    case "bulletList":
      return <ul key={key}>{kids}</ul>;
    case "orderedList":
      return (
        <ol key={key} start={Number(n.attrs?.start) || 1}>
          {kids}
        </ol>
      );
    case "listItem":
      return <li key={key}>{kids}</li>;
    case "blockquote":
      return <blockquote key={key}>{kids}</blockquote>;
    default:
      return null;
  }
}

export function RichText({ doc, className = "" }: { doc: unknown; className?: string }) {
  const d = doc as RichDoc | null;
  if (!d || d.type !== "doc" || !Array.isArray(d.content) || d.content.length === 0) return null;
  return <div className={`rich-text text-[1.0625rem] leading-relaxed text-graphite ${className}`}>{d.content.map((n, i) => renderNode(n, i))}</div>;
}
