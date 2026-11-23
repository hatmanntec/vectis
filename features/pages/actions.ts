"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { describeDbError, type ActionResult } from "@/lib/cms/results";
import type { Json } from "@/types/database";
import { readPageContent } from "./content";
import { templateFor } from "./templates";
import { siteChanged } from "@/lib/cms/site-cache";

/**
 * Editing website pages. Core pages (Home, About…) can be edited and
 * unpublished but never archived or deleted. Extra pages behave like other
 * records. Each action checks the administrator itself.
 */

const uuid = z.string().uuid();

/** Addresses the website already uses; extra pages can't take them. */
const RESERVED = new Set([
  "admin", "api", "about", "history", "businesses", "investments", "investment-philosophy", "governance",
  "leadership", "projects", "news", "contact", "sectors", "search", "privacy", "terms", "sitemap", "robots",
]);

const slugSchema = z
  .string()
  .trim()
  .min(1, "Enter a web address.")
  .max(120, "Use 120 characters or fewer.")
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lower-case letters, numbers and single hyphens only.")
  .refine((v) => !RESERVED.has(v), "The website already uses this address. Choose another.");

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Use ${max} characters or fewer.`)
    .transform((v) => (v === "" ? null : v));

const metaSchema = z.object({
  title: z.string().trim().min(1, "Enter the page's title.").max(200, "Use 200 characters or fewer."),
  seo_title: optionalText(70),
  seo_description: optionalText(160),
  og_image_media_id: z
    .string()
    .trim()
    .refine((v) => v === "" || /^[0-9a-f-]{36}$/i.test(v), "Choose an image from the library.")
    .transform((v) => (v === "" ? null : v)),
});

const INVALID = "Please correct the highlighted fields.";

function fieldErrors(issues: z.core.$ZodIssue[]) {
  const out: Record<string, string> = {};
  for (const i of issues) out[String(i.path[0] ?? "form")] ??= i.message;
  return out;
}

/** Creates an extra (standard) page with just a title and address; the rest is filled in afterwards. */
export async function createPage(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = z
    .object({ title: metaSchema.shape.title, slug: slugSchema })
    .safeParse({ title: String(formData.get("name") ?? ""), slug: String(formData.get("slug") ?? "") });
  if (!parsed.success) {
    const errors = fieldErrors(parsed.error.issues);
    // The name field is sent as "name" by the shared name-and-address fields.
    if (errors.title) errors.name = errors.title;
    return { ok: false, error: INVALID, fieldErrors: errors };
  }
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("pages")
    .insert({ title: parsed.data.title, slug: parsed.data.slug, page_key: parsed.data.slug, template: "standard", is_system: false })
    .select("id")
    .single();
  if (error || !data) {
    if (error?.code === "23505") {
      return { ok: false, error: "That web address is already in use.", fieldErrors: { slug: "Already in use." } };
    }
    return { ok: false, ...describeDbError(error) };
  }
  siteChanged();
  redirect(`/admin/pages/${data.id}?notice=created`);
}

export async function updatePage(id: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  if (!uuid.safeParse(id).success) return { ok: false, error: "Unknown record." };
  const supabase = await createSupabaseServerClient();
  const { data: page } = await supabase.from("pages").select("template, is_system").eq("id", id).maybeSingle();
  if (!page) return { ok: false, error: "This page no longer exists." };

  const meta = metaSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    seo_title: String(formData.get("seo_title") ?? ""),
    seo_description: String(formData.get("seo_description") ?? ""),
    og_image_media_id: String(formData.get("og_image_media_id") ?? ""),
  });
  const slug = page.is_system ? null : slugSchema.safeParse(String(formData.get("slug") ?? ""));
  const { content, errors } = readPageContent(templateFor(page.template), formData);

  const allErrors = {
    ...(meta.success ? {} : fieldErrors(meta.error.issues)),
    ...(slug && !slug.success ? { slug: slug.error.issues[0]?.message ?? "Check the web address." } : {}),
    ...errors,
  };
  if (Object.keys(allErrors).length || !meta.success) return { ok: false, error: INVALID, fieldErrors: allErrors };

  const update = {
    ...meta.data,
    content: content as { [key: string]: Json },
    ...(slug?.success ? { slug: slug.data } : {}),
  };
  const { data, error } = await supabase.from("pages").update(update).eq("id", id).select("id");
  if (error) {
    if (error.code === "23505") return { ok: false, error: "That web address is already in use.", fieldErrors: { slug: "Already in use." } };
    return { ok: false, ...describeDbError(error) };
  }
  if (!data?.length) return { ok: false, error: "This page no longer exists." };
  siteChanged();
  return { ok: true, message: "Changes saved." };
}

export async function setPageStatus(id: string, status: "published" | "draft" | "archived"): Promise<ActionResult> {
  await requireAdmin();
  if (!uuid.safeParse(id).success) return { ok: false, error: "Unknown record." };
  const supabase = await createSupabaseServerClient();
  if (status === "archived") {
    const { data: page } = await supabase.from("pages").select("is_system").eq("id", id).maybeSingle();
    if (page?.is_system) return { ok: false, error: "Core website pages can't be archived. Unpublish it instead." };
  }
  const { data, error } = await supabase.from("pages").update({ status }).eq("id", id).select("id");
  if (error) return { ok: false, ...describeDbError(error) };
  if (!data?.length) return { ok: false, error: "This page no longer exists." };
  siteChanged();
  return { ok: true };
}

export async function deletePage(id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!uuid.safeParse(id).success) return { ok: false, error: "Unknown record." };
  const supabase = await createSupabaseServerClient();
  const { error, count } = await supabase.from("pages").delete({ count: "exact" }).eq("id", id);
  if (error) {
    if (error.hint === "system_page") return { ok: false, error: "Core website pages can't be deleted. Unpublish it instead." };
    return { ok: false, ...describeDbError(error) };
  }
  if (!count) return { ok: false, error: "This page no longer exists." };
  siteChanged();
  redirect("/admin/pages?notice=deleted");
}
