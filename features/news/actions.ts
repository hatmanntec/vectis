"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { describeDbError, type ActionResult } from "@/lib/cms/results";
import type { Json } from "@/types/database";
import { nigeriaTimeToIso, readNewsForm } from "./schema";

/**
 * Saving, publishing (now or at a chosen time), archiving and deleting news
 * items. Each action checks the administrator itself.
 */

const uuid = z.string().uuid();
type Supabase = Awaited<ReturnType<typeof createSupabaseServerClient>>;

function fieldErrors(issues: z.core.$ZodIssue[]) {
  const out: Record<string, string> = {};
  for (const i of issues) out[String(i.path[0] ?? "form")] ??= i.message;
  return out;
}

const INVALID = "Please correct the highlighted fields.";

/** Makes the item's company tags exactly `wanted`: removes the others, adds the missing ones. */
async function setTags(supabase: Supabase, newsId: string, wanted: string[]) {
  const { data: current, error: readError } = await supabase.from("news_companies").select("company_id").eq("news_id", newsId);
  if (readError) return readError;
  const have = new Set((current ?? []).map((c) => c.company_id));
  const want = new Set(wanted);
  const drop = [...have].filter((id) => !want.has(id));
  const add = [...want].filter((id) => !have.has(id));
  if (drop.length) {
    const { error } = await supabase.from("news_companies").delete().eq("news_id", newsId).in("company_id", drop);
    if (error) return error;
  }
  if (add.length) {
    const { error } = await supabase.from("news_companies").insert(add.map((company_id) => ({ news_id: newsId, company_id })));
    if (error) return error;
  }
  return null;
}

export async function createNews(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = readNewsForm(formData);
  if (!parsed.success) return { ok: false, error: INVALID, fieldErrors: fieldErrors(parsed.error.issues) };
  const supabase = await createSupabaseServerClient();
  const { body, company_ids, ...fields } = parsed.data;
  const { data, error } = await supabase
    .from("news")
    .insert({ ...fields, news_type: fields.news_type as "article", body: body as Json })
    .select("id")
    .single();
  if (error || !data) return { ok: false, ...describeDbError(error, { slug: "web address" }) };
  const tagError = await setTags(supabase, data.id, company_ids);
  redirect(`/admin/news/${data.id}?notice=${tagError ? "created_tags_failed" : "created"}`);
}

export async function updateNews(id: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  if (!uuid.safeParse(id).success) return { ok: false, error: "Unknown record." };
  const parsed = readNewsForm(formData);
  if (!parsed.success) return { ok: false, error: INVALID, fieldErrors: fieldErrors(parsed.error.issues) };
  const supabase = await createSupabaseServerClient();
  const { body, company_ids, ...fields } = parsed.data;
  const { data, error } = await supabase
    .from("news")
    .update({ ...fields, news_type: fields.news_type as "article", body: body as Json })
    .eq("id", id)
    .select("id");
  if (error) return { ok: false, ...describeDbError(error, { slug: "web address" }) };
  if (!data?.length) return { ok: false, error: "This item no longer exists." };
  const tagError = await setTags(supabase, id, company_ids);
  if (tagError) return { ok: false, error: "The item was saved, but its company tags could not be updated. Please try again." };
  return { ok: true, message: "Changes saved." };
}

/**
 * Publish / unpublish / archive. "Publish" means now: an item that was
 * scheduled for later is brought forward to the current time.
 */
export async function setNewsStatus(id: string, status: "published" | "draft" | "archived"): Promise<ActionResult> {
  await requireAdmin();
  if (!uuid.safeParse(id).success) return { ok: false, error: "Unknown record." };
  const supabase = await createSupabaseServerClient();
  const { data: current } = await supabase.from("news").select("published_at").eq("id", id).maybeSingle();
  if (!current) return { ok: false, error: "This item no longer exists." };
  const future = current.published_at && new Date(current.published_at).getTime() > Date.now();
  const change: { status: typeof status; published_at?: string | null } = { status };
  if (status === "published" && future) change.published_at = new Date().toISOString();
  // Cancelling a schedule forgets the future date, so "Publish" later means now.
  if (status === "draft" && future) change.published_at = null;
  const { data, error } = await supabase.from("news").update(change).eq("id", id).select("id");
  if (error) return { ok: false, ...describeDbError(error) };
  if (!data?.length) return { ok: false, error: "This item no longer exists." };
  return { ok: true };
}

/**
 * Publishes at a chosen date and time (Nigeria time). A future time
 * schedules the item: it appears on the website by itself at that moment.
 * A past time publishes it now, dated in the past (for older press releases).
 */
export async function publishNewsAt(id: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  if (!uuid.safeParse(id).success) return { ok: false, error: "Unknown record." };
  const iso = nigeriaTimeToIso(String(formData.get("publish_at") ?? ""));
  if (!iso) return { ok: false, error: "Enter a date and time.", fieldErrors: { publish_at: "Enter a date and time." } };
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("news").update({ status: "published", published_at: iso }).eq("id", id).select("id");
  if (error) return { ok: false, ...describeDbError(error) };
  if (!data?.length) return { ok: false, error: "This item no longer exists." };
  return {
    ok: true,
    message: new Date(iso).getTime() > Date.now() ? "Scheduled. It will appear on the website at that time." : "Published with that date.",
  };
}

export async function deleteNews(id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!uuid.safeParse(id).success) return { ok: false, error: "Unknown record." };
  const supabase = await createSupabaseServerClient();
  const { error, count } = await supabase.from("news").delete({ count: "exact" }).eq("id", id);
  if (error) return { ok: false, ...describeDbError(error) };
  if (!count) return { ok: false, error: "This item no longer exists." };
  redirect("/admin/news?notice=deleted");
}
