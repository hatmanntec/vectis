/** Publication status as the administrator sees it. */

export type ContentStatus = "draft" | "published" | "archived";
export type DisplayStatus = "Draft" | "Published" | "Scheduled" | "Archived";

export const STATUS_FILTERS = ["draft", "published", "archived"] as const;

export function displayStatus(status: ContentStatus, publishedAt: string | null): DisplayStatus {
  if (status === "archived") return "Archived";
  if (status === "draft") return "Draft";
  return publishedAt && new Date(publishedAt).getTime() > Date.now() ? "Scheduled" : "Published";
}

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Africa/Lagos",
});
const dateTimeFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Africa/Lagos",
});

/** e.g. "22 Nov 2026" (Nigeria time). */
export const formatDate = (iso: string | null | undefined) => (iso ? dateFmt.format(new Date(iso)) : "—");
/** e.g. "22 Nov 2026, 19:23" (Nigeria time). */
export const formatDateTime = (iso: string | null | undefined) => (iso ? dateTimeFmt.format(new Date(iso)) : "—");

/** Turn a name into a web-address slug: "Oil & Gas" → "oil-and-gas". */
export function slugify(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120)
    .replace(/-+$/g, "");
}
