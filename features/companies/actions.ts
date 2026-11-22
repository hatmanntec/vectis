"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { describeDbError, type ActionResult } from "@/lib/cms/results";
import type { Json } from "@/types/database";
import { readCompanyForm, relationshipSchema } from "./schema";

/**
 * Saving, publishing, archiving and deleting companies, and their links to
 * other companies. Each action checks the administrator itself; the
 * database applies its own rules and records everything in the audit trail.
 */

const UNIQUE = { slug: "web address" };
const uuid = z.string().uuid();
type Supabase = Awaited<ReturnType<typeof createSupabaseServerClient>>;

function fieldErrors(issues: z.core.$ZodIssue[]) {
  const out: Record<string, string> = {};
  for (const i of issues) out[String(i.path[0] ?? "form")] ??= i.message;
  return out;
}

function companyError(error: { code?: string; message?: string; hint?: string | null } | null): ActionResult {
  if (error?.hint === "parent_cycle") {
    return {
      ok: false,
      error: "That parent would create a loop in the group structure.",
      fieldErrors: { parent_company_id: "A company can't sit under itself, directly or through another company." },
    };
  }
  return { ok: false, ...describeDbError(error, UNIQUE) };
}

async function saveSectors(supabase: Supabase, companyId: string, sectorIds: string[], primary: string | null) {
  const { error } = await supabase.rpc("set_company_sectors", {
    p_company_id: companyId,
    p_sector_ids: sectorIds,
    ...(primary ? { p_primary_sector_id: primary } : {}),
  });
  return error;
}

export async function createCompany(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = readCompanyForm(formData);
  if (!parsed.success) {
    return { ok: false, error: "Please correct the highlighted fields.", fieldErrors: fieldErrors(parsed.error.issues) };
  }
  const { sector_ids, primary_sector_id, full_description, ...fields } = parsed.data;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("companies")
    .insert({ ...fields, full_description: full_description as Json })
    .select("id")
    .single();
  if (error || !data) return companyError(error);

  const sectorError = await saveSectors(supabase, data.id, sector_ids, primary_sector_id);
  // The company exists either way; if the sectors failed, say so on its page.
  redirect(`/admin/companies/${data.id}?notice=${sectorError ? "created_sectors_failed" : "created"}`);
}

export async function updateCompany(id: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  if (!uuid.safeParse(id).success) return { ok: false, error: "Unknown record." };
  const parsed = readCompanyForm(formData);
  if (!parsed.success) {
    return { ok: false, error: "Please correct the highlighted fields.", fieldErrors: fieldErrors(parsed.error.issues) };
  }
  const { sector_ids, primary_sector_id, full_description, ...fields } = parsed.data;
  if (fields.parent_company_id === id) {
    return { ok: false, error: "Please correct the highlighted fields.", fieldErrors: { parent_company_id: "A company can't be its own parent." } };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("companies")
    .update({ ...fields, full_description: full_description as Json })
    .eq("id", id)
    .select("id");
  if (error) return companyError(error);
  if (!data?.length) return { ok: false, error: "This company no longer exists." };

  const sectorError = await saveSectors(supabase, id, sector_ids, primary_sector_id);
  if (sectorError) return { ok: false, error: "The details were saved, but the sectors could not be. Please try again." };
  return { ok: true, message: "Changes saved." };
}

export async function setCompanyStatus(id: string, status: "published" | "draft" | "archived"): Promise<ActionResult> {
  await requireAdmin();
  if (!uuid.safeParse(id).success) return { ok: false, error: "Unknown record." };
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("companies").update({ status }).eq("id", id).select("id");
  if (error) return { ok: false, ...describeDbError(error) };
  if (!data?.length) return { ok: false, error: "This company no longer exists." };
  return { ok: true };
}

/** Permanent deletion: archived companies only, and only if nothing depends on them. */
export async function deleteCompany(id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!uuid.safeParse(id).success) return { ok: false, error: "Unknown record." };
  const supabase = await createSupabaseServerClient();
  const { error, count } = await supabase.from("companies").delete({ count: "exact" }).eq("id", id);
  if (error) {
    if (error.code === "23503") {
      return {
        ok: false,
        error:
          "This company still has investments, projects or companies under it. Move or remove those first; " +
          "until then it stays archived (hidden from the website).",
      };
    }
    return { ok: false, ...describeDbError(error) };
  }
  if (!count) return { ok: false, error: "This company no longer exists." };
  redirect("/admin/companies?notice=deleted");
}

// ---------------------------------------------------------------------------
// Links with other companies (partners, joint ventures, …)
// ---------------------------------------------------------------------------

export async function addRelationship(companyId: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  if (!uuid.safeParse(companyId).success) return { ok: false, error: "Unknown record." };
  const parsed = relationshipSchema.safeParse({
    to_company_id: String(formData.get("to_company_id") ?? ""),
    relationship_type: String(formData.get("relationship_type") ?? ""),
    description: String(formData.get("description") ?? ""),
    start_date: String(formData.get("start_date") ?? ""),
    end_date: String(formData.get("end_date") ?? ""),
    visible: formData.get("visible") === "on",
  });
  if (!parsed.success) {
    return { ok: false, error: "Please correct the highlighted fields.", fieldErrors: fieldErrors(parsed.error.issues) };
  }
  if (parsed.data.to_company_id === companyId) {
    return { ok: false, error: "Choose a different company.", fieldErrors: { to_company_id: "A company can't be linked to itself." } };
  }
  const { visible, ...rest } = parsed.data;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("company_relationships")
    .insert({ ...rest, from_company_id: companyId, status: visible ? "published" : "draft" });
  if (error) {
    if (error.code === "23505") return { ok: false, error: "This link already exists." };
    return { ok: false, ...describeDbError(error) };
  }
  return { ok: true, message: "Link added." };
}

export async function setRelationshipVisibility(relationshipId: string, visible: boolean): Promise<ActionResult> {
  await requireAdmin();
  if (!uuid.safeParse(relationshipId).success) return { ok: false, error: "Unknown link." };
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("company_relationships")
    .update({ status: visible ? "published" : "draft" })
    .eq("id", relationshipId)
    .select("id");
  if (error) return { ok: false, ...describeDbError(error) };
  if (!data?.length) return { ok: false, error: "This link no longer exists." };
  return { ok: true, message: visible ? "Now shown on the website." : "Hidden from the website." };
}

export async function removeRelationship(relationshipId: string): Promise<ActionResult> {
  await requireAdmin();
  if (!uuid.safeParse(relationshipId).success) return { ok: false, error: "Unknown link." };
  const supabase = await createSupabaseServerClient();
  const { error, count } = await supabase.from("company_relationships").delete({ count: "exact" }).eq("id", relationshipId);
  if (error) return { ok: false, ...describeDbError(error) };
  if (!count) return { ok: false, error: "This link was already removed." };
  return { ok: true, message: "Link removed. Both companies are unchanged." };
}
