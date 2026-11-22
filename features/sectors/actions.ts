"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { describeDbError, type ActionResult } from "@/lib/cms/results";
import { fieldErrorsFrom, readSectorForm } from "./schema";

/**
 * Saving, publishing, archiving and deleting sectors.
 * Each action checks the administrator itself and validates its input; the
 * database then applies its own rules (Row Level Security, archive-before-
 * delete, records still in use) and records the change in the audit trail.
 */

const UNIQUE = { slug: "web address", name: "name" };
const idSchema = z.string().uuid();

export async function createSector(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = readSectorForm(formData);
  if (!parsed.success) {
    return { ok: false, error: "Please correct the highlighted fields.", fieldErrors: fieldErrorsFrom(parsed.error.issues) };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("sectors").insert(parsed.data).select("id").single();
  if (error || !data) return { ok: false, ...describeDbError(error, UNIQUE) };

  redirect(`/admin/sectors/${data.id}?notice=created`);
}

export async function updateSector(id: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  if (!idSchema.safeParse(id).success) return { ok: false, error: "Unknown record." };
  const parsed = readSectorForm(formData);
  if (!parsed.success) {
    return { ok: false, error: "Please correct the highlighted fields.", fieldErrors: fieldErrorsFrom(parsed.error.issues) };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("sectors").update(parsed.data).eq("id", id).select("id");
  if (error) return { ok: false, ...describeDbError(error, UNIQUE) };
  if (!data?.length) return { ok: false, error: "This sector no longer exists." };
  return { ok: true, message: "Changes saved." };
}

const statusMessages = {
  published: "Published.",
  draft: "Moved back to draft. It is no longer visible on the website.",
  archived: "Archived. It is hidden everywhere and can be restored.",
} as const;

/** Publish, unpublish (back to draft), archive, or restore (archive → draft). */
export async function setSectorStatus(id: string, status: "published" | "draft" | "archived"): Promise<ActionResult> {
  await requireAdmin();
  if (!idSchema.safeParse(id).success) return { ok: false, error: "Unknown record." };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("sectors").update({ status }).eq("id", id).select("id");
  if (error) return { ok: false, ...describeDbError(error) };
  if (!data?.length) return { ok: false, error: "This sector no longer exists." };
  return { ok: true, message: statusMessages[status] };
}

/** Permanent deletion. Only allowed for archived sectors that nothing uses. */
export async function deleteSector(id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!idSchema.safeParse(id).success) return { ok: false, error: "Unknown record." };

  const supabase = await createSupabaseServerClient();
  const { error, count } = await supabase.from("sectors").delete({ count: "exact" }).eq("id", id);
  if (error) {
    if (error.code === "23503") {
      return {
        ok: false,
        error: "This sector is still assigned to one or more companies. Remove it from them first.",
      };
    }
    return { ok: false, ...describeDbError(error) };
  }
  if (!count) return { ok: false, error: "This sector no longer exists." };
  redirect("/admin/sectors?notice=deleted");
}
