import { z } from "zod";

/** What a valid sector is. Used on the server before anything is saved. */

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Use ${max} characters or fewer.`)
    .transform((v) => (v === "" ? null : v));

export const sectorSchema = z.object({
  name: z.string().trim().min(1, "Enter a name.").max(120, "Use 120 characters or fewer."),
  slug: z
    .string()
    .trim()
    .min(1, "Enter a web address.")
    .max(120, "Use 120 characters or fewer.")
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lower-case letters, numbers and single hyphens only (e.g. oil-and-gas)."),
  description: optionalText(2000),
  sort_order: z.coerce
    .number({ message: "Enter a whole number." })
    .int("Enter a whole number.")
    .min(-9999)
    .max(9999)
    .default(0),
  seo_title: optionalText(70),
  seo_description: optionalText(160),
});

export type SectorInput = z.infer<typeof sectorSchema>;

export function readSectorForm(formData: FormData) {
  return sectorSchema.safeParse({
    name: formData.get("name") ?? "",
    slug: formData.get("slug") ?? "",
    description: formData.get("description") ?? "",
    sort_order: formData.get("sort_order") || 0,
    seo_title: formData.get("seo_title") ?? "",
    seo_description: formData.get("seo_description") ?? "",
  });
}

/** Turn validation problems into one message per field. */
export function fieldErrorsFrom(issues: z.core.$ZodIssue[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
