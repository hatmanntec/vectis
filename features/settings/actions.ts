"use server";

import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { describeDbError, type ActionResult } from "@/lib/cms/results";
import { readSettingsForm, SOCIAL_NETWORKS } from "./schema";
import { siteChanged } from "@/lib/cms/site-cache";

export async function updateSettings(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = readSettingsForm(formData);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) fieldErrors[String(i.path[0])] ??= i.message;
    return { ok: false, error: "Please correct the highlighted fields.", fieldErrors };
  }

  const { linkedin, x, facebook, instagram, youtube, ...rest } = parsed.data;
  const links = { linkedin, x, facebook, instagram, youtube };
  // Store only the networks that have an address.
  const social_links = Object.fromEntries(
    SOCIAL_NETWORKS.map((n) => [n.key, links[n.key]]).filter(([, v]) => Boolean(v)),
  ) as Record<string, string>;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("website_settings")
    .update({ ...rest, social_links })
    .eq("id", 1)
    .select("id");
  if (error) return { ok: false, ...describeDbError(error) };
  if (!data?.length) return { ok: false, error: "The settings could not be saved. Try signing in again." };
  siteChanged();
  return { ok: true, message: "Settings saved." };
}
