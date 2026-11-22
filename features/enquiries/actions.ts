"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { describeDbError, type ActionResult } from "@/lib/cms/results";

/** Marking enquiries read or unread, and deleting them. Each action checks the administrator. */

const uuid = z.string().uuid();

export async function setEnquiryRead(id: string, isRead: boolean): Promise<ActionResult> {
  await requireAdmin();
  if (!uuid.safeParse(id).success) return { ok: false, error: "Unknown enquiry." };
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("enquiries").update({ is_read: isRead }).eq("id", id).select("id");
  if (error) return { ok: false, ...describeDbError(error) };
  if (!data?.length) return { ok: false, error: "This enquiry no longer exists." };
  return { ok: true };
}

export async function deleteEnquiry(id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!uuid.safeParse(id).success) return { ok: false, error: "Unknown enquiry." };
  const supabase = await createSupabaseServerClient();
  const { error, count } = await supabase.from("enquiries").delete({ count: "exact" }).eq("id", id);
  if (error) return { ok: false, ...describeDbError(error) };
  if (!count) return { ok: false, error: "This enquiry no longer exists." };
  redirect("/admin/enquiries?notice=deleted");
}
