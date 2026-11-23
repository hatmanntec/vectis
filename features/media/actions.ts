"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { describeDbError, type ActionResult } from "@/lib/cms/results";
import { checkFile, STORAGE_PATH_PATTERN } from "@/lib/media/rules";
import { searchMediaForPicker } from "./queries";
import { mediaIdsInContent } from "@/features/pages/content";
import { templateFor } from "@/features/pages/templates";
import { siteChanged } from "@/lib/cms/site-cache";

/**
 * Media library actions. The browser uploads the file itself straight to
 * Supabase Storage (only administrators are allowed to, by the storage
 * rules), then calls `registerUpload` so the file appears in the library.
 */

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Use ${max} characters or fewer.`)
    .transform((v) => (v === "" ? null : v));

const registerSchema = z.object({
  bucket: z.enum(["public-media", "private-files"]),
  path: z.string().regex(STORAGE_PATH_PATTERN),
  file_name: z.string().trim().min(1).max(255),
  mime_type: z.string().min(3).max(100),
  size_bytes: z.number().int().positive(),
  width: z.number().int().positive().max(50000).nullable(),
  height: z.number().int().positive().max(50000).nullable(),
  category: z.enum(["logo", "photo", "document", "other"]),
});

export type RegisterInput = z.input<typeof registerSchema>;

export async function registerUpload(input: RegisterInput): Promise<ActionResult & { id?: string }> {
  await requireAdmin();
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "The upload details were not valid." };

  const problem = checkFile(parsed.data.bucket, parsed.data.mime_type, parsed.data.size_bytes);
  if (problem) return { ok: false, error: problem };
  // The folder in the stored path must match the chosen category.
  if (!parsed.data.path.startsWith(`${parsed.data.category}/`)) {
    return { ok: false, error: "The upload details were not valid." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("media").insert(parsed.data).select("id").single();
  if (error || !data) return { ok: false, ...describeDbError(error) };
  siteChanged();
  return { ok: true, id: data.id };
}

const detailsSchema = z.object({
  alt_text: optionalText(300),
  caption: optionalText(500),
  category: z.enum(["logo", "photo", "document", "other"]),
});

export async function updateMediaDetails(id: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  if (!z.string().uuid().safeParse(id).success) return { ok: false, error: "Unknown file." };
  const parsed = detailsSchema.safeParse({
    alt_text: formData.get("alt_text") ?? "",
    caption: formData.get("caption") ?? "",
    category: formData.get("category"),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) fieldErrors[String(i.path[0])] ??= i.message;
    return { ok: false, error: "Please correct the highlighted fields.", fieldErrors };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("media").update(parsed.data).eq("id", id).select("id");
  if (error) return { ok: false, ...describeDbError(error) };
  if (!data?.length) return { ok: false, error: "This file no longer exists." };
  siteChanged();
  return { ok: true, message: "Changes saved." };
}

/**
 * Deletes a file. The database refuses if anything still uses it; only then
 * is the stored file itself removed.
 */
export async function deleteMedia(id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!z.string().uuid().safeParse(id).success) return { ok: false, error: "Unknown file." };
  const supabase = await createSupabaseServerClient();

  // Images placed in website page fields aren't protected by the database
  // (they live inside the page's content), so check those first.
  const { data: pages } = await supabase.from("pages").select("title, template, content");
  const usedBy = (pages ?? []).filter((p) => mediaIdsInContent(templateFor(p.template), p.content).includes(id));
  if (usedBy.length) {
    return { ok: false, error: `This file is used on the ${usedBy.map((p) => p.title).join(", ")} page. Remove it there first.` };
  }

  const { data: rows, error } = await supabase.from("media").delete().eq("id", id).select("bucket, path");
  if (error) {
    if (error.code === "23503") {
      return { ok: false, error: "This file is still used elsewhere. Remove it from those records first." };
    }
    return { ok: false, ...describeDbError(error) };
  }
  const row = rows?.[0];
  if (!row) return { ok: false, error: "This file no longer exists." };

  // The library entry is gone; now remove the stored file.
  await supabase.storage.from(row.bucket).remove([row.path]);
  siteChanged();
  redirect("/admin/media?notice=deleted");
}

/** Removes a file that was uploaded but could not be registered. */
export async function discardUpload(bucket: string, path: string): Promise<void> {
  await requireAdmin();
  if (!STORAGE_PATH_PATTERN.test(path) || !["public-media", "private-files"].includes(bucket)) return;
  const supabase = await createSupabaseServerClient();
  // Only if no library entry points at it.
  const { count } = await supabase.from("media").select("id", { count: "exact", head: true }).eq("path", path);
  if (!count) await supabase.storage.from(bucket).remove([path]);
}

/** Used by the "Choose an image" dialog. */
export async function pickerSearch(q: string, page: number, kind: "image" | "document") {
  const safePage = Number.isInteger(page) && page > 0 && page < 1000 ? page : 1;
  const safeKind = kind === "document" ? "document" : "image";
  const { items, total } = await searchMediaForPicker(String(q ?? "").slice(0, 100), safePage, safeKind);
  return {
    items: items.map((m) => ({
      id: m.id,
      file_name: m.file_name,
      alt_text: m.alt_text,
      mime_type: m.mime_type,
      bucket: m.bucket,
      previewUrl: m.previewUrl,
    })),
    total,
  };
}
