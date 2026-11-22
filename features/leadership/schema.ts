import { z } from "zod";
import { parseRichText } from "@/lib/cms/rich-text";
import { CATEGORIES } from "./labels";

/** What a valid leadership profile and company role are. Checked on the server before saving. */

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Use ${max} characters or fewer.`)
    .transform((v) => (v === "" ? null : v));

export const leaderSchema = z.object({
  full_name: z.string().trim().min(1, "Enter the person's full name.").max(160, "Use 160 characters or fewer."),
  slug: z
    .string()
    .trim()
    .min(1, "Enter a web address.")
    .max(120, "Use 120 characters or fewer.")
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lower-case letters, numbers and single hyphens only."),
  job_title: optionalText(160),
  category: z.enum(CATEGORIES as [string, ...string[]], { message: "Choose where the person appears." }),
  biography: z.string().transform((v, ctx) => {
    const doc = parseRichText(v);
    if (doc === "invalid") {
      ctx.addIssue({ code: "custom", message: "The biography could not be read. Please try again." });
      return z.NEVER;
    }
    return doc;
  }),
  photo_media_id: z
    .string()
    .trim()
    .refine((v) => v === "" || /^[0-9a-f-]{36}$/i.test(v), "Choose a photo from the library.")
    .transform((v) => (v === "" ? null : v)),
  display_order: z.coerce.number({ message: "Enter a whole number." }).int("Enter a whole number.").min(-9999).max(9999),
  seo_title: optionalText(70),
  seo_description: optionalText(160),
});

export function readLeaderForm(formData: FormData) {
  const t = (k: string) => String(formData.get(k) ?? "");
  return leaderSchema.safeParse({
    full_name: t("full_name"),
    slug: t("slug"),
    job_title: t("job_title"),
    category: t("category"),
    biography: t("biography"),
    photo_media_id: t("photo_media_id"),
    display_order: t("display_order") || "0",
    seo_title: t("seo_title"),
    seo_description: t("seo_description"),
  });
}

export const roleSchema = z.object({
  company_id: z.string().uuid("Choose a company."),
  role_title: optionalText(160),
});
