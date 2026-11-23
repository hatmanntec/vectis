import type { ReactNode } from "react";
import { safeHref, type RichDoc, type RichNode } from "@/lib/cms/rich-text";

/**
 * Shows formatted text saved by the CMS editor. It is built element by
 * element from the stored JSON (never inserted as raw HTML), and links are
 * checked again before they are shown.
 */
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
    case "heading":
      return n.attrs?.level === 3 ? <h3 key={key}>{kids}</h3> : <h2 key={key}>{kids}</h2>;
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
