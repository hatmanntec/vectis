import { parseRichText } from "@/lib/cms/rich-text";
import { allFields, type Template } from "./templates";

/**
 * Reads a page's fields from the submitted form, checks each against its
 * template, and builds the JSON saved in pages.content. Unknown fields are
 * ignored; empty fields are left out.
 */

const UUID = /^[0-9a-f-]{36}$/i;

export type Item = { heading: string; text: string };

export function readPageContent(template: Template, formData: FormData) {
  const content: Record<string, unknown> = {};
  const errors: Record<string, string> = {};

  for (const f of allFields(template)) {
    const name = `c.${f.key}`;
    if (f.kind === "text" || f.kind === "textarea") {
      const v = String(formData.get(name) ?? "").trim();
      if (v.length > f.max) errors[name] = `Use ${f.max} characters or fewer.`;
      else if (v) content[f.key] = v;
    } else if (f.kind === "richtext") {
      const doc = parseRichText(String(formData.get(name) ?? ""));
      if (doc === "invalid") errors[name] = "The text could not be read. Please try again.";
      else if (doc) content[f.key] = doc;
    } else if (f.kind === "image") {
      const v = String(formData.get(name) ?? "").trim();
      if (v && !UUID.test(v)) errors[name] = "Choose an image from the library.";
      else if (v) content[f.key] = v;
    } else {
      const headings = formData.getAll(`${name}.heading`).map((v) => String(v).trim());
      const texts = formData.getAll(`${name}.text`).map((v) => String(v).trim());
      const items: Item[] = [];
      for (let i = 0; i < headings.length; i++) {
        const heading = headings[i] ?? "";
        const text = texts[i] ?? "";
        if (!heading && !text) continue;
        if (heading.length > 160 || text.length > 1000) {
          errors[name] = "Keep each heading to 160 characters and each text to 1,000.";
          break;
        }
        items.push({ heading, text });
      }
      if (items.length > f.maxItems) errors[name] = `Use ${f.maxItems} entries or fewer.`;
      else if (items.length) content[f.key] = items;
    }
  }
  return { content, errors };
}

/** Every library file a page's fields point at (for "Where it's used" and delete protection). */
export function mediaIdsInContent(template: Template, content: unknown): string[] {
  if (!content || typeof content !== "object") return [];
  const c = content as Record<string, unknown>;
  return allFields(template)
    .filter((f) => f.kind === "image")
    .map((f) => c[f.key])
    .filter((v): v is string => typeof v === "string" && UUID.test(v));
}
