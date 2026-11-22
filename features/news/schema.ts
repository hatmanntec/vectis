import { z } from "zod";
import { parseRichText } from "@/lib/cms/rich-text";
import { NEWS_TYPES } from "./labels";

/** What a valid news item is. Checked on the server before saving. */

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Use ${max} characters or fewer.`)
    .transform((v) => (v === "" ? null : v));

const UUID = /^[0-9a-f-]{36}$/i;

export const newsSchema = z.object({
  title: z.string().trim().min(1, "Enter a headline.").max(200, "Use 200 characters or fewer."),
  slug: z
    .string()
    .trim()
    .min(1, "Enter a web address.")
    .max(120, "Use 120 characters or fewer.")
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lower-case letters, numbers and single hyphens only."),
  news_type: z.enum(NEWS_TYPES as [string, ...string[]], { message: "Choose the kind of item." }),
  excerpt: optionalText(400),
  body: z.string().transform((v, ctx) => {
    const doc = parseRichText(v);
    if (doc === "invalid") {
      ctx.addIssue({ code: "custom", message: "The text could not be read. Please try again." });
      return z.NEVER;
    }
    return doc;
  }),
  author_name: optionalText(120),
  is_featured: z.boolean(),
  cover_media_id: z
    .string()
    .trim()
    .refine((v) => v === "" || UUID.test(v), "Choose an image from the library.")
    .transform((v) => (v === "" ? null : v)),
  seo_title: optionalText(70),
  seo_description: optionalText(160),
  company_ids: z.array(z.string().regex(UUID, "Choose companies from the list.")).max(50, "Tag 50 companies or fewer."),
});

export function readNewsForm(formData: FormData) {
  const t = (k: string) => String(formData.get(k) ?? "");
  return newsSchema.safeParse({
    title: t("title"),
    slug: t("slug"),
    news_type: t("news_type") || "article",
    excerpt: t("excerpt"),
    body: t("body"),
    author_name: t("author_name"),
    is_featured: formData.get("is_featured") === "on",
    cover_media_id: t("cover_media_id"),
    seo_title: t("seo_title"),
    seo_description: t("seo_description"),
    company_ids: [...new Set(formData.getAll("company_ids").map(String))],
  });
}

/**
 * A publication time typed in Nigeria time (the form's date-and-time box,
 * e.g. "2026-12-01T09:00"). Nigeria has no daylight saving, so it is always
 * UTC+01:00. Returns an ISO timestamp, or null if it isn't a real time.
 */
export function nigeriaTimeToIso(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  const d = new Date(`${value}:00+01:00`);
  if (Number.isNaN(d.getTime())) return null;
  const year = d.getUTCFullYear();
  if (year < 1956 || year > 2100) return null;
  return d.toISOString();
}

/** The reverse, for filling the box: ISO → "2026-12-01T09:00" in Nigeria time. */
export function isoToNigeriaTime(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(new Date(iso).getTime() + 60 * 60 * 1000);
  return d.toISOString().slice(0, 16);
}
