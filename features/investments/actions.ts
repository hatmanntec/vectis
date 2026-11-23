"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { describeDbError, type ActionResult } from "@/lib/cms/results";
import type { Json } from "@/types/database";
import { privateDetailsSchema, readInvestmentForm } from "./schema";
import { siteChanged } from "@/lib/cms/site-cache";

/**
 * Saving, publishing, archiving and deleting investments, and their
 * confidential details. Each action checks the administrator itself.
 */

const uuid = z.string().uuid();
type Supabase = Awaited<ReturnType<typeof createSupabaseServerClient>>;

function fieldErrors(issues: z.core.$ZodIssue[]) {
  const out: Record<string, string> = {};
  for (const i of issues) out[String(i.path[0] ?? "form")] ??= i.message;
  return out;
}

/** The investor must be part of VECTIS (the group, a business or a subsidiary). */
async function investorProblem(supabase: Supabase, investorId: string): Promise<string | null> {
  const { data } = await supabase.from("companies").select("classification").eq("id", investorId).maybeSingle();
  if (!data) return "That company no longer exists.";
  return data.classification === "external" ? "The investor must be VECTIS or one of its businesses." : null;
}

export async function createInvestment(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = readInvestmentForm(formData);
  if (!parsed.success) {
    return { ok: false, error: "Please correct the highlighted fields.", fieldErrors: fieldErrors(parsed.error.issues) };
  }
  const supabase = await createSupabaseServerClient();
  const problem = await investorProblem(supabase, parsed.data.investor_company_id);
  if (problem) return { ok: false, error: problem, fieldErrors: { investor_company_id: problem } };

  const { description, ...fields } = parsed.data;
  const { data, error } = await supabase
    .from("investments")
    .insert({ ...fields, description: description as Json })
    .select("id")
    .single();
  if (error || !data) return { ok: false, ...describeDbError(error, { slug: "web address" }) };
  siteChanged();
  redirect(`/admin/investments/${data.id}?notice=created`);
}

export async function updateInvestment(id: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  if (!uuid.safeParse(id).success) return { ok: false, error: "Unknown record." };
  const parsed = readInvestmentForm(formData);
  if (!parsed.success) {
    return { ok: false, error: "Please correct the highlighted fields.", fieldErrors: fieldErrors(parsed.error.issues) };
  }
  const supabase = await createSupabaseServerClient();
  const problem = await investorProblem(supabase, parsed.data.investor_company_id);
  if (problem) return { ok: false, error: problem, fieldErrors: { investor_company_id: problem } };

  const { description, ...fields } = parsed.data;
  const { data, error } = await supabase
    .from("investments")
    .update({ ...fields, description: description as Json })
    .eq("id", id)
    .select("id");
  if (error) return { ok: false, ...describeDbError(error, { slug: "web address" }) };
  if (!data?.length) return { ok: false, error: "This investment no longer exists." };
  siteChanged();
  return { ok: true, message: "Changes saved." };
}

export async function setInvestmentStatus(id: string, status: "published" | "draft" | "archived"): Promise<ActionResult> {
  await requireAdmin();
  if (!uuid.safeParse(id).success) return { ok: false, error: "Unknown record." };
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("investments").update({ status }).eq("id", id).select("id");
  if (error) return { ok: false, ...describeDbError(error) };
  if (!data?.length) return { ok: false, error: "This investment no longer exists." };
  siteChanged();
  return { ok: true };
}

export async function deleteInvestment(id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!uuid.safeParse(id).success) return { ok: false, error: "Unknown record." };
  const supabase = await createSupabaseServerClient();
  const { error, count } = await supabase.from("investments").delete({ count: "exact" }).eq("id", id);
  if (error) return { ok: false, ...describeDbError(error) };
  if (!count) return { ok: false, error: "This investment no longer exists." };
  siteChanged();
  redirect("/admin/investments?notice=deleted");
}

/**
 * Saves (or clears) the confidential figures. Stored in a separate table that
 * the website can never read.
 */
export async function savePrivateDetails(investmentId: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  if (!uuid.safeParse(investmentId).success) return { ok: false, error: "Unknown record." };
  const parsed = privateDetailsSchema.safeParse({
    stake_percentage: String(formData.get("stake_percentage") ?? ""),
    amount: String(formData.get("amount") ?? ""),
    currency: String(formData.get("currency") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  });
  if (!parsed.success) {
    return { ok: false, error: "Please correct the highlighted fields.", fieldErrors: fieldErrors(parsed.error.issues) };
  }
  const values = parsed.data;
  if (values.amount !== null && values.currency === null) {
    return { ok: false, error: "Please correct the highlighted fields.", fieldErrors: { currency: "Choose the currency of the amount." } };
  }

  const supabase = await createSupabaseServerClient();
  const empty = Object.values(values).every((v) => v === null);
  if (empty) {
    const { error } = await supabase.from("investment_private_details").delete().eq("investment_id", investmentId);
    if (error) return { ok: false, ...describeDbError(error) };
    siteChanged();
    return { ok: true, message: "Confidential details cleared." };
  }

  const { data: updated, error: updateError } = await supabase
    .from("investment_private_details")
    .update(values)
    .eq("investment_id", investmentId)
    .select("investment_id");
  if (updateError) return { ok: false, ...describeDbError(updateError) };
  if (!updated?.length) {
    const { error } = await supabase.from("investment_private_details").insert({ investment_id: investmentId, ...values });
    if (error) return { ok: false, ...describeDbError(error) };
  }
  siteChanged();
  return { ok: true, message: "Confidential details saved." };
}
