import { z } from "zod";
import { parseRichText } from "@/lib/cms/rich-text";

/** What a valid project and timeline entry are. Checked on the server before saving. */

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Use ${max} characters or fewer.`)
    .transform((v) => (v === "" ? null : v));

const optionalId = (message: string) =>
  z
    .string()
    .trim()
    .refine((v) => v === "" || /^[0-9a-f-]{36}$/i.test(v), message)
    .transform((v) => (v === "" ? null : v));

const optionalDate = z
  .string()
  .trim()
  .refine((v) => v === "" || /^\d{4}-\d{2}-\d{2}$/.test(v), "Enter a date.")
  .transform((v) => (v === "" ? null : v));

const optionalCoordinate = (limit: number, name: string) =>
  z
    .string()
    .trim()
    .refine(
      (v) => v === "" || (/^-?\d{1,3}(\.\d{1,6})?$/.test(v) && Math.abs(Number(v)) <= limit),
      `Enter a ${name} between -${limit} and ${limit}, with up to 6 decimal places.`,
    )
    .transform((v) => (v === "" ? null : Number(v)));

export const projectSchema = z
  .object({
    title: z.string().trim().min(1, "Enter the project's name.").max(200, "Use 200 characters or fewer."),
    slug: z
      .string()
      .trim()
      .min(1, "Enter a web address.")
      .max(120, "Use 120 characters or fewer.")
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lower-case letters, numbers and single hyphens only."),
    company_id: z.string().uuid("Choose the business behind the project."),
    sector_id: optionalId("Choose a sector."),
    project_status: z.enum(["planned", "in_progress", "completed", "on_hold"], { message: "Choose the project's stage." }),
    summary: optionalText(400),
    description: z.string().transform((v, ctx) => {
      const doc = parseRichText(v);
      if (doc === "invalid") {
        ctx.addIssue({ code: "custom", message: "The description could not be read. Please try again." });
        return z.NEVER;
      }
      return doc;
    }),
    location_name: optionalText(200),
    state: optionalText(100),
    country: z.string().trim().min(1, "Enter the country.").max(100, "Use 100 characters or fewer."),
    latitude: optionalCoordinate(90, "latitude"),
    longitude: optionalCoordinate(180, "longitude"),
    start_date: optionalDate,
    end_date: optionalDate,
    cover_media_id: optionalId("Choose an image from the library."),
    sort_order: z.coerce.number({ message: "Enter a whole number." }).int("Enter a whole number.").min(-9999).max(9999),
    seo_title: optionalText(70),
    seo_description: optionalText(160),
  })
  .refine((v) => !v.start_date || !v.end_date || v.end_date >= v.start_date, {
    path: ["end_date"],
    message: "The end date can't be before the start date.",
  })
  .refine((v) => (v.latitude === null) === (v.longitude === null), {
    path: ["longitude"],
    message: "Enter both latitude and longitude, or neither.",
  });

export function readProjectForm(formData: FormData) {
  const t = (k: string) => String(formData.get(k) ?? "");
  return projectSchema.safeParse({
    title: t("title"),
    slug: t("slug"),
    company_id: t("company_id"),
    sector_id: t("sector_id"),
    project_status: t("project_status") || "planned",
    summary: t("summary"),
    description: t("description"),
    location_name: t("location_name"),
    state: t("state"),
    country: t("country") || "Nigeria",
    latitude: t("latitude"),
    longitude: t("longitude"),
    start_date: t("start_date"),
    end_date: t("end_date"),
    cover_media_id: t("cover_media_id"),
    sort_order: t("sort_order") || "0",
    seo_title: t("seo_title"),
    seo_description: t("seo_description"),
  });
}

/** One entry on a project's timeline. */
export const milestoneSchema = z.object({
  title: z.string().trim().min(1, "Enter what happened or will happen.").max(200, "Use 200 characters or fewer."),
  milestone_date: optionalDate,
  description: optionalText(2000),
});

export function readMilestoneForm(formData: FormData) {
  const t = (k: string) => String(formData.get(k) ?? "");
  return milestoneSchema.safeParse({
    title: t("title"),
    milestone_date: t("milestone_date"),
    description: t("description"),
  });
}
