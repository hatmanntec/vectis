import { z } from "zod";

/** Rules for the website settings form. */

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Use ${max} characters or fewer.`)
    .transform((v) => (v === "" ? null : v));

const optionalUrl = z
  .string()
  .trim()
  .max(300, "Use 300 characters or fewer.")
  .refine((v) => v === "" || /^https:\/\/[^\s]+\.[^\s]+$/.test(v), "Enter a full address starting with https://")
  .transform((v) => (v === "" ? null : v));

const optionalUuid = z
  .string()
  .trim()
  .refine((v) => v === "" || /^[0-9a-f-]{36}$/i.test(v), "Choose an image from the library.")
  .transform((v) => (v === "" ? null : v));

export const SOCIAL_NETWORKS = [
  { key: "linkedin", label: "LinkedIn" },
  { key: "x", label: "X (Twitter)" },
  { key: "facebook", label: "Facebook" },
  { key: "instagram", label: "Instagram" },
  { key: "youtube", label: "YouTube" },
] as const;

export const settingsSchema = z.object({
  site_name: z.string().trim().min(1, "Enter the website name.").max(80, "Use 80 characters or fewer."),
  tagline: optionalText(200),
  contact_email: z
    .string()
    .trim()
    .max(254)
    .refine((v) => v === "" || z.string().email().safeParse(v).success, "Enter a valid email address.")
    .transform((v) => (v === "" ? null : v.toLowerCase())),
  contact_phone: optionalText(40),
  contact_address: optionalText(500),
  seo_default_title: optionalText(70),
  seo_default_description: optionalText(160),
  logo_media_id: optionalUuid,
  og_image_media_id: optionalUuid,
  linkedin: optionalUrl,
  x: optionalUrl,
  facebook: optionalUrl,
  instagram: optionalUrl,
  youtube: optionalUrl,
});

export function readSettingsForm(formData: FormData) {
  const raw: Record<string, string> = {};
  for (const key of Object.keys(settingsSchema.shape)) raw[key] = String(formData.get(key) ?? "");
  return settingsSchema.safeParse(raw);
}
