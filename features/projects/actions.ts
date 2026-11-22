"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { describeDbError, type ActionResult } from "@/lib/cms/results";
import type { Json } from "@/types/database";
import { readMilestoneForm, readProjectForm } from "./schema";

/**
 * Saving, publishing, archiving and deleting projects, and editing their
 * timeline. Each action checks the administrator itself.
 */

const uuid = z.string().uuid();

function fieldErrors(issues: z.core.$ZodIssue[]) {
  const out: Record<string, string> = {};
  for (const i of issues) out[String(i.path[0] ?? "form")] ??= i.message;
  return out;
}

const INVALID = "Please correct the highlighted fields.";

export async function createProject(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = readProjectForm(formData);
  if (!parsed.success) return { ok: false, error: INVALID, fieldErrors: fieldErrors(parsed.error.issues) };
  const supabase = await createSupabaseServerClient();
  const { description, ...fields } = parsed.data;
  const { data, error } = await supabase
    .from("projects")
    .insert({ ...fields, description: description as Json })
    .select("id")
    .single();
  if (error || !data) return { ok: false, ...describeDbError(error, { slug: "web address" }) };
  redirect(`/admin/projects/${data.id}?notice=created`);
}

export async function updateProject(id: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  if (!uuid.safeParse(id).success) return { ok: false, error: "Unknown record." };
  const parsed = readProjectForm(formData);
  if (!parsed.success) return { ok: false, error: INVALID, fieldErrors: fieldErrors(parsed.error.issues) };
  const supabase = await createSupabaseServerClient();
  const { description, ...fields } = parsed.data;
  const { data, error } = await supabase
    .from("projects")
    .update({ ...fields, description: description as Json })
    .eq("id", id)
    .select("id");
  if (error) return { ok: false, ...describeDbError(error, { slug: "web address" }) };
  if (!data?.length) return { ok: false, error: "This project no longer exists." };
  return { ok: true, message: "Changes saved." };
}

export async function setProjectStatus(id: string, status: "published" | "draft" | "archived"): Promise<ActionResult> {
  await requireAdmin();
  if (!uuid.safeParse(id).success) return { ok: false, error: "Unknown record." };
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("projects").update({ status }).eq("id", id).select("id");
  if (error) return { ok: false, ...describeDbError(error) };
  if (!data?.length) return { ok: false, error: "This project no longer exists." };
  return { ok: true };
}

export async function deleteProject(id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!uuid.safeParse(id).success) return { ok: false, error: "Unknown record." };
  const supabase = await createSupabaseServerClient();
  const { error, count } = await supabase.from("projects").delete({ count: "exact" }).eq("id", id);
  if (error) return { ok: false, ...describeDbError(error) };
  if (!count) return { ok: false, error: "This project no longer exists." };
  redirect("/admin/projects?notice=deleted");
}

// ---------------------------------------------------------------------
// Timeline
// ---------------------------------------------------------------------

export async function addMilestone(projectId: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  if (!uuid.safeParse(projectId).success) return { ok: false, error: "Unknown record." };
  const parsed = readMilestoneForm(formData);
  if (!parsed.success) return { ok: false, error: INVALID, fieldErrors: fieldErrors(parsed.error.issues) };
  const supabase = await createSupabaseServerClient();
  const { data: last } = await supabase
    .from("project_milestones")
    .select("sort_order")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: false })
    .limit(1);
  const sort_order = (last?.[0]?.sort_order ?? -1) + 1;
  const { error } = await supabase.from("project_milestones").insert({ project_id: projectId, sort_order, ...parsed.data });
  if (error) return { ok: false, ...describeDbError(error) };
  return { ok: true, message: "Added to the timeline." };
}

export async function updateMilestone(id: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  if (!uuid.safeParse(id).success) return { ok: false, error: "Unknown record." };
  const parsed = readMilestoneForm(formData);
  if (!parsed.success) return { ok: false, error: INVALID, fieldErrors: fieldErrors(parsed.error.issues) };
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("project_milestones").update(parsed.data).eq("id", id).select("id");
  if (error) return { ok: false, ...describeDbError(error) };
  if (!data?.length) return { ok: false, error: "This entry no longer exists." };
  return { ok: true, message: "Timeline entry saved." };
}

export async function removeMilestone(id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!uuid.safeParse(id).success) return { ok: false, error: "Unknown record." };
  const supabase = await createSupabaseServerClient();
  const { error, count } = await supabase.from("project_milestones").delete({ count: "exact" }).eq("id", id);
  if (error) return { ok: false, ...describeDbError(error) };
  if (!count) return { ok: false, error: "This entry no longer exists." };
  return { ok: true };
}

/** Moves an entry one place up or down; the whole timeline is renumbered 0, 1, 2… */
export async function moveMilestone(id: string, direction: "up" | "down"): Promise<ActionResult> {
  await requireAdmin();
  if (!uuid.safeParse(id).success) return { ok: false, error: "Unknown record." };
  const supabase = await createSupabaseServerClient();
  const { data: me } = await supabase.from("project_milestones").select("project_id").eq("id", id).maybeSingle();
  if (!me) return { ok: false, error: "This entry no longer exists." };
  const { data: all } = await supabase
    .from("project_milestones")
    .select("id, sort_order")
    .eq("project_id", me.project_id)
    .order("sort_order")
    .order("milestone_date", { nullsFirst: false })
    .order("created_at");
  const ids = (all ?? []).map((m) => m.id);
  const i = ids.indexOf(id);
  const j = direction === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= ids.length) return { ok: true };
  [ids[i], ids[j]] = [ids[j], ids[i]];
  const current = new Map((all ?? []).map((m) => [m.id, m.sort_order]));
  for (const [order, mid] of ids.entries()) {
    if (current.get(mid) === order) continue;
    const { error } = await supabase.from("project_milestones").update({ sort_order: order }).eq("id", mid);
    if (error) return { ok: false, ...describeDbError(error) };
  }
  return { ok: true };
}

/** Puts the timeline in date order (entries without a date go last). */
export async function sortMilestonesByDate(projectId: string): Promise<ActionResult> {
  await requireAdmin();
  if (!uuid.safeParse(projectId).success) return { ok: false, error: "Unknown record." };
  const supabase = await createSupabaseServerClient();
  const { data: all } = await supabase
    .from("project_milestones")
    .select("id, sort_order")
    .eq("project_id", projectId)
    .order("milestone_date", { nullsFirst: false })
    .order("sort_order");
  for (const [order, m] of (all ?? []).entries()) {
    if (m.sort_order === order) continue;
    const { error } = await supabase.from("project_milestones").update({ sort_order: order }).eq("id", m.id);
    if (error) return { ok: false, ...describeDbError(error) };
  }
  return { ok: true, message: "Timeline put in date order." };
}
