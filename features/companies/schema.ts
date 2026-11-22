import { z } from "zod";
import { parseRichText } from "@/lib/cms/rich-text";

/** What a valid company is. Checked on the server before saving. */

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Use ${max} characters or fewer.`)
    .transform((v) => (v === "" ? null : v));

const optionalUuid = (message: string) =>
  z
    .string()
    .trim()
    .refine((v) => v === "" || /^[0-9a-f-]{36}$/i.test(v), message)
    .transform((v) => (v === "" ? null : v));

export const companySchema = z
  .object({
    name: z.string().trim().min(1, "Enter the company name.").max(200, "Use 200 characters or fewer."),
    slug: z
      .string()
      .trim()
      .min(1, "Enter a web address.")
      .max(120, "Use 120 characters or fewer.")
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lower-case letters, numbers and single hyphens only."),
    classification: z.enum(["group", "business", "subsidiary", "external"], { message: "Choose what kind of company this is." }),
    parent_company_id: optionalUuid("Choose a company from the list."),
    short_description: optionalText(300),
    full_description: z.string().transform((v, ctx) => {
      const doc = parseRichText(v);
      if (doc === "invalid") {
        ctx.addIssue({ code: "custom", message: "The description could not be read. Please try again." });
        return z.NEVER;
      }
      return doc;
    }),
    established_year: z
      .string()
      .trim()
      .refine((v) => v === "" || (/^\d{4}$/.test(v) && Number(v) >= 1800 && Number(v) <= 2100), "Enter a year such as 1956.")
      .transform((v) => (v === "" ? null : Number(v))),
    website: z
      .string()
      .trim()
      .max(300)
      .refine((v) => v === "" || /^https?:\/\/[^\s]+\.[^\s]+$/.test(v), "Enter a full address, e.g. https://www.example.com")
      .transform((v) => (v === "" ? null : v)),
    email: z
      .string()
      .trim()
      .max(254)
      .refine((v) => v === "" || z.string().email().safeParse(v).success, "Enter a valid email address.")
      .transform((v) => (v === "" ? null : v.toLowerCase())),
    phone: optionalText(40),
    address: optionalText(500),
    logo_media_id: optionalUuid("Choose an image from the library."),
    cover_media_id: optionalUuid("Choose an image from the library."),
    sort_order: z.coerce.number({ message: "Enter a whole number." }).int("Enter a whole number.").min(-9999).max(9999),
    seo_title: optionalText(70),
    seo_description: optionalText(160),
    sector_ids: z.array(z.string().uuid()).max(50),
    primary_sector_id: optionalUuid("Choose a sector."),
  })
  .superRefine((v, ctx) => {
    if (v.classification === "group" && v.parent_company_id) {
      ctx.addIssue({ code: "custom", path: ["parent_company_id"], message: "The parent organisation sits at the top, so it has no parent." });
    }
    if (v.primary_sector_id && !v.sector_ids.includes(v.primary_sector_id)) {
      ctx.addIssue({ code: "custom", path: ["primary_sector_id"], message: "The main sector must be one of the ticked sectors." });
    }
  });

export function readCompanyForm(formData: FormData) {
  const text = (k: string) => String(formData.get(k) ?? "");
  return companySchema.safeParse({
    name: text("name"),
    slug: text("slug"),
    classification: text("classification"),
    parent_company_id: text("parent_company_id"),
    short_description: text("short_description"),
    full_description: text("full_description"),
    established_year: text("established_year"),
    website: text("website"),
    email: text("email"),
    phone: text("phone"),
    address: text("address"),
    logo_media_id: text("logo_media_id"),
    cover_media_id: text("cover_media_id"),
    sort_order: text("sort_order") || "0",
    seo_title: text("seo_title"),
    seo_description: text("seo_description"),
    sector_ids: [...new Set(formData.getAll("sector_ids").map(String))],
    primary_sector_id: text("primary_sector_id"),
  });
}

export const relationshipSchema = z
  .object({
    to_company_id: z.string().uuid("Choose the other company."),
    relationship_type: z.enum(["strategic_partner", "joint_venture", "affiliate", "other"], { message: "Choose the type." }),
    description: optionalText(1000),
    start_date: z.string().trim().transform((v) => (v === "" ? null : v)).refine((v) => v === null || /^\d{4}-\d{2}-\d{2}$/.test(v), "Enter a date."),
    end_date: z.string().trim().transform((v) => (v === "" ? null : v)).refine((v) => v === null || /^\d{4}-\d{2}-\d{2}$/.test(v), "Enter a date."),
    visible: z.boolean(),
  })
  .refine((v) => !v.start_date || !v.end_date || v.end_date >= v.start_date, {
    path: ["end_date"],
    message: "The end date must be after the start date.",
  });
