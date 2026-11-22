import { z } from "zod";
import { parseRichText } from "@/lib/cms/rich-text";
import { CURRENCIES } from "./labels";

/** What a valid investment is. Checked on the server before saving. */

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Use ${max} characters or fewer.`)
    .transform((v) => (v === "" ? null : v));

const optionalUuid = z
  .string()
  .trim()
  .refine((v) => v === "" || /^[0-9a-f-]{36}$/i.test(v), "Choose an image from the library.")
  .transform((v) => (v === "" ? null : v));

export const investmentSchema = z
  .object({
    investor_company_id: z.string().uuid("Choose the VECTIS business that made the investment."),
    investee_company_id: z.string().uuid("Choose the company invested in."),
    nature: z.enum(["portfolio_investment", "equity_stake", "joint_venture", "strategic_investment", "other"], {
      message: "Choose the nature of the investment.",
    }),
    nature_note: optionalText(300),
    investment_status: z.enum(["active", "pending", "exited"]),
    investment_date: z
      .string()
      .trim()
      .refine((v) => v === "" || /^\d{4}-\d{2}-\d{2}$/.test(v), "Enter a date.")
      .transform((v) => (v === "" ? null : v)),
    slug: z
      .string()
      .trim()
      .min(1, "Enter a web address.")
      .max(120, "Use 120 characters or fewer.")
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lower-case letters, numbers and single hyphens only."),
    summary: optionalText(400),
    description: z.string().transform((v, ctx) => {
      const doc = parseRichText(v);
      if (doc === "invalid") {
        ctx.addIssue({ code: "custom", message: "The description could not be read. Please try again." });
        return z.NEVER;
      }
      return doc;
    }),
    logo_media_id: optionalUuid,
    sort_order: z.coerce.number({ message: "Enter a whole number." }).int("Enter a whole number.").min(-9999).max(9999),
    seo_title: optionalText(70),
    seo_description: optionalText(160),
  })
  .refine((v) => v.investor_company_id !== v.investee_company_id, {
    path: ["investee_company_id"],
    message: "A company can't invest in itself.",
  });

export function readInvestmentForm(formData: FormData) {
  const t = (k: string) => String(formData.get(k) ?? "");
  return investmentSchema.safeParse({
    investor_company_id: t("investor_company_id"),
    investee_company_id: t("investee_company_id"),
    nature: t("nature"),
    nature_note: t("nature_note"),
    investment_status: t("investment_status") || "active",
    investment_date: t("investment_date"),
    slug: t("slug"),
    summary: t("summary"),
    description: t("description"),
    logo_media_id: t("logo_media_id"),
    sort_order: t("sort_order") || "0",
    seo_title: t("seo_title"),
    seo_description: t("seo_description"),
  });
}

/** Confidential figures: never shown on the website. */
export const privateDetailsSchema = z.object({
  stake_percentage: z
    .string()
    .trim()
    .refine((v) => v === "" || (/^\d{1,3}(\.\d{1,2})?$/.test(v) && Number(v) <= 100), "Enter a percentage between 0 and 100 (e.g. 12.5).")
    .transform((v) => (v === "" ? null : Number(v))),
  amount: z
    .string()
    .trim()
    .transform((v) => v.replace(/,/g, ""))
    .refine((v) => v === "" || /^\d{1,16}(\.\d{1,2})?$/.test(v), "Enter an amount using numbers only (e.g. 2500000).")
    .transform((v) => (v === "" ? null : Number(v))),
  currency: z
    .string()
    .trim()
    .refine((v) => v === "" || (CURRENCIES as readonly string[]).includes(v), "Choose a currency.")
    .transform((v) => (v === "" ? null : v)),
  notes: optionalText(5000),
});
