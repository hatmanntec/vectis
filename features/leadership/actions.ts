"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { describeDbError, type ActionResult } from "@/lib/cms/results";
import type { Json } from "@/types/database";
import { readLeaderForm, roleSchema } from "./schema";
import { siteChanged } from "@/lib/cms/site-cache";

/**
 * Saving, publishing, archiving and deleting leadership profiles, and the
 * companies each person holds roles in. Each action checks the administrator.
 */

const uuid = z.string().uuid();

function fieldErrors(issues: z.core.$ZodIssue[]) {
  const out: Record<string, string> = {};
  for (const i of issues) out[String(i.path[0] ?? "form")] ??= i.message;
  return out;
}

const INVALID = "Please correct the highlighted fields.";

export async function createLeader(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = readLeaderForm(formData);
  if (!parsed.success) return { ok: false, error: INVALID, fieldErrors: fieldErrors(parsed.error.issues) };
  const supabase = await createSupabaseServerClient();
  const { biography, ...fields } = parsed.data;
  const { data, error } = await supabase
    .from("leadership")
    .insert({ ...fields, category: fields.category as "director", biography: biography as Json })
    .select("id")
    .single();
  if (error || !data) return { ok: false, ...describeDbError(error, { slug: "web address" }) };
  siteChanged();
  redirect(`/admin/leadership/${data.id}?notice=created`);
}

export async function updateLeader(id: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  if (!uuid.safeParse(id).success) return { ok: false, error: "Unknown record." };
  const parsed = readLeaderForm(formData);
  if (!parsed.success) return { ok: false, error: INVALID, fieldErrors: fieldErrors(parsed.error.issues) };
  const supabase = await createSupabaseServerClient();
  const { biography, ...fields } = parsed.data;
  const { data, error } = await supabase
    .from("leadership")
    .update({ ...fields, category: fields.category as "director", biography: biography as Json })
    .eq("id", id)
    .select("id");
  if (error) return { ok: false, ...describeDbError(error, { slug: "web address" }) };
  if (!data?.length) return { ok: false, error: "This profile no longer exists." };
  siteChanged();
  return { ok: true, message: "Changes saved." };
}

export async function setLeaderStatus(id: string, status: "published" | "draft" | "archived"): Promise<ActionResult> {
  await requireAdmin();
  if (!uuid.safeParse(id).success) return { ok: false, error: "Unknown record." };
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("leadership").update({ status }).eq("id", id).select("id");
  if (error) return { ok: false, ...describeDbError(error) };
  if (!data?.length) return { ok: false, error: "This profile no longer exists." };
  siteChanged();
  return { ok: true };
}

export async function deleteLeader(id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!uuid.safeParse(id).success) return { ok: false, error: "Unknown record." };
  const supabase = await createSupabaseServerClient();
  const { error, count } = await supabase.from("leadership").delete({ count: "exact" }).eq("id", id);
  if (error) return { ok: false, ...describeDbError(error) };
  if (!count) return { ok: false, error: "This profile no longer exists." };
  siteChanged();
  redirect("/admin/leadership?notice=deleted");
}

// ---------------------------------------------------------------------
// Company roles
// ---------------------------------------------------------------------

export async function addRole(leadershipId: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  if (!uuid.safeParse(leadershipId).success) return { ok: false, error: "Unknown record." };
  const parsed = roleSchema.safeParse({
    company_id: String(formData.get("company_id") ?? ""),
    role_title: String(formData.get("role_title") ?? ""),
  });
  if (!parsed.success) return { ok: false, error: INVALID, fieldErrors: fieldErrors(parsed.error.issues) };
  const supabase = await createSupabaseServerClient();
  const { data: last } = await supabase
    .from("leadership_affiliations")
    .select("sort_order")
    .eq("leadership_id", leadershipId)
    .order("sort_order", { ascending: false })
    .limit(1);
  const { error } = await supabase
    .from("leadership_affiliations")
    .insert({ leadership_id: leadershipId, ...parsed.data, sort_order: (last?.[0]?.sort_order ?? -1) + 1 });
  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "This person already has a role in that company.", fieldErrors: { company_id: "Already added." } };
    }
    return { ok: false, ...describeDbError(error) };
  }
  siteChanged();
  return { ok: true, message: "Role added." };
}

export async function updateRoleTitle(leadershipId: string, companyId: string, title: string): Promise<ActionResult> {
  await requireAdmin();
  const parsed = roleSchema.safeParse({ company_id: companyId, role_title: title });
  if (!uuid.safeParse(leadershipId).success || !parsed.success) {
    return { ok: false, error: parsed.success ? "Unknown record." : (parsed.error.issues[0]?.message ?? INVALID) };
  }
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("leadership_affiliations")
    .update({ role_title: parsed.data.role_title })
    .eq("leadership_id", leadershipId)
    .eq("company_id", companyId)
    .select("company_id");
  if (error) return { ok: false, ...describeDbError(error) };
  if (!data?.length) return { ok: false, error: "This role no longer exists." };
  siteChanged();
  return { ok: true, message: "Role saved." };
}

export async function removeRole(leadershipId: string, companyId: string): Promise<ActionResult> {
  await requireAdmin();
  if (!uuid.safeParse(leadershipId).success || !uuid.safeParse(companyId).success) return { ok: false, error: "Unknown record." };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("leadership_affiliations")
    .delete()
    .eq("leadership_id", leadershipId)
    .eq("company_id", companyId);
  if (error) return { ok: false, ...describeDbError(error) };
  siteChanged();
  return { ok: true, message: "Role removed." };
}

export async function moveRole(leadershipId: string, companyId: string, direction: "up" | "down"): Promise<ActionResult> {
  await requireAdmin();
  if (!uuid.safeParse(leadershipId).success || !uuid.safeParse(companyId).success) return { ok: false, error: "Unknown record." };
  const supabase = await createSupabaseServerClient();
  const { data: all } = await supabase
    .from("leadership_affiliations")
    .select("company_id, sort_order")
    .eq("leadership_id", leadershipId)
    .order("sort_order")
    .order("created_at");
  const ids = (all ?? []).map((r) => r.company_id);
  const i = ids.indexOf(companyId);
  const j = direction === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= ids.length) return { ok: true };
  [ids[i], ids[j]] = [ids[j], ids[i]];
  const current = new Map((all ?? []).map((r) => [r.company_id, r.sort_order]));
  for (const [order, cid] of ids.entries()) {
    if (current.get(cid) === order) continue;
    const { error } = await supabase
      .from("leadership_affiliations")
      .update({ sort_order: order })
      .eq("leadership_id", leadershipId)
      .eq("company_id", cid);
    if (error) return { ok: false, ...describeDbError(error) };
  }
  siteChanged();
  return { ok: true };
}
