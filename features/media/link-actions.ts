"use server";

import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { describeDbError, type ActionResult } from "@/lib/cms/results";
import { isImage } from "@/lib/media/rules";
import type { Database } from "@/types/database";
import { OWNER_COLUMN, type LinkOwner } from "./link-owners";

/**
 * Galleries and supporting documents: attaching library files to a record
 * (company, investment, project, news item, leadership profile).
 */

const uuid = z.string().uuid();

export async function addMediaLink(
  owner: LinkOwner,
  ownerId: string,
  role: "gallery" | "document",
  mediaId: string,
): Promise<ActionResult> {
  await requireAdmin();
  if (!(owner in OWNER_COLUMN) || !uuid.safeParse(ownerId).success || !uuid.safeParse(mediaId).success) {
    return { ok: false, error: "Unknown record." };
  }
  if (role !== "gallery" && role !== "document") return { ok: false, error: "Unknown list." };
  const supabase = await createSupabaseServerClient();
  const column = OWNER_COLUMN[owner];

  const { data: media } = await supabase.from("media").select("bucket, mime_type").eq("id", mediaId).maybeSingle();
  if (!media) return { ok: false, error: "That file no longer exists." };
  if (role === "gallery" && (!isImage(media.mime_type) || media.bucket !== "public-media")) {
    return { ok: false, error: "Galleries can only contain public images." };
  }

  const { data: existing } = await supabase
    .from("media_links")
    .select("media_id, sort_order")
    .eq(column, ownerId)
    .eq("role", role);
  if ((existing ?? []).some((e) => e.media_id === mediaId)) {
    return { ok: false, error: "That file is already in this list." };
  }
  const next = Math.max(-1, ...(existing ?? []).map((e) => e.sort_order)) + 1;

  const row: Database["public"]["Tables"]["media_links"]["Insert"] = { media_id: mediaId, role, sort_order: next };
  row[column] = ownerId;
  const { error } = await supabase.from("media_links").insert(row);
  if (error) return { ok: false, ...describeDbError(error) };
  return { ok: true, message: role === "gallery" ? "Added to the gallery." : "Document attached." };
}

export async function removeMediaLink(linkId: string): Promise<ActionResult> {
  await requireAdmin();
  if (!uuid.safeParse(linkId).success) return { ok: false, error: "Unknown item." };
  const supabase = await createSupabaseServerClient();
  const { error, count } = await supabase.from("media_links").delete({ count: "exact" }).eq("id", linkId);
  if (error) return { ok: false, ...describeDbError(error) };
  if (!count) return { ok: false, error: "That item was already removed." };
  return { ok: true, message: "Removed. The file stays in the media library." };
}

/** Moves an item one place up or down in its list. */
export async function moveMediaLink(linkId: string, direction: "up" | "down"): Promise<ActionResult> {
  await requireAdmin();
  if (!uuid.safeParse(linkId).success) return { ok: false, error: "Unknown item." };
  const supabase = await createSupabaseServerClient();

  const { data: link } = await supabase.from("media_links").select("*").eq("id", linkId).maybeSingle();
  if (!link) return { ok: false, error: "That item no longer exists." };
  const owner = (Object.entries(OWNER_COLUMN) as [LinkOwner, (typeof OWNER_COLUMN)[LinkOwner]][]).find(
    ([, col]) => link[col] !== null,
  );
  if (!owner) return { ok: false, error: "That item no longer exists." };
  const [, column] = owner;

  const { data: siblings } = await supabase
    .from("media_links")
    .select("id, sort_order, created_at")
    .eq(column, link[column] as string)
    .eq("role", link.role)
    .order("sort_order")
    .order("created_at");
  const list = siblings ?? [];
  const i = list.findIndex((s) => s.id === linkId);
  const j = direction === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= list.length) return { ok: true };

  [list[i], list[j]] = [list[j], list[i]];
  // Renumber the whole list so the order is always clean.
  for (const [n, item] of list.entries()) {
    if (item.sort_order !== n) {
      const { error } = await supabase.from("media_links").update({ sort_order: n }).eq("id", item.id);
      if (error) return { ok: false, ...describeDbError(error) };
    }
  }
  return { ok: true };
}
