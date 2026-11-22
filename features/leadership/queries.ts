import "server-only";
import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { pageRange, searchPattern, type ListConfig, type ListParams } from "@/lib/cms/list";
import { STATUS_FILTERS } from "@/lib/cms/status";
import { getMediaByIds } from "@/features/media/queries";
import { CATEGORIES } from "./labels";

export const LEADERSHIP_LIST: ListConfig = {
  sortable: ["display_order", "full_name", "category", "status", "updated_at"],
  defaultDir: "asc",
  statuses: STATUS_FILTERS,
  filters: { category: CATEGORIES },
};

export async function listLeadership(params: ListParams) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("leadership")
    .select("id, full_name, slug, job_title, category, display_order, photo_media_id, status, published_at, updated_at", { count: "exact" });
  if (params.q) {
    const p = searchPattern(params.q);
    query = query.or(`full_name.ilike.${p},job_title.ilike.${p},slug.ilike.${p}`);
  }
  query = params.status ? query.eq("status", params.status as "draft") : query.neq("status", "archived");
  if (params.filters.category) query = query.eq("category", params.filters.category as "director");

  const [from, to] = pageRange(params.page);
  // By default: category order (board first), then display order, then name.
  if (params.sort === "display_order") query = query.order("category").order("display_order", { ascending: params.dir === "asc" });
  else query = query.order(params.sort, { ascending: params.dir === "asc", nullsFirst: false });
  const { data, count, error } = await query.order("full_name").order("id").range(from, to);
  if (error) throw new Error(`Could not load leadership: ${error.message}`);
  const rows = data ?? [];
  const photos = await getMediaByIds(rows.map((r) => r.photo_media_id));
  return {
    rows: rows.map((r) => ({ ...r, photoUrl: r.photo_media_id ? (photos.get(r.photo_media_id)?.previewUrl ?? null) : null })),
    total: count ?? 0,
  };
}

export async function getLeader(id: string) {
  await requireAdmin();
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("leadership").select("*").eq("id", id).maybeSingle();
  return data;
}

/** The companies a person holds roles in, in display order. */
export async function listRoles(leadershipId: string) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("leadership_affiliations")
    .select("company_id, role_title, sort_order")
    .eq("leadership_id", leadershipId)
    .order("sort_order")
    .order("created_at");
  const rows = data ?? [];
  const ids = rows.map((r) => r.company_id);
  const { data: companies } = ids.length
    ? await supabase.from("companies").select("id, name, status").in("id", ids)
    : { data: [] as { id: string; name: string; status: string }[] };
  const byId = new Map((companies ?? []).map((c) => [c.id, c]));
  return rows.map((r) => ({
    ...r,
    companyName: byId.get(r.company_id)?.name ?? "Unknown",
    companyStatus: byId.get(r.company_id)?.status ?? "draft",
  }));
}

export async function leadershipCompanyOptions() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("companies").select("id, name, status").neq("status", "archived").order("name");
  return data ?? [];
}

/** People with a role in a company (shown on the company's page). */
export async function companyLeadership(companyId: string) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { data: roles } = await supabase
    .from("leadership_affiliations")
    .select("leadership_id, role_title")
    .eq("company_id", companyId);
  const ids = (roles ?? []).map((r) => r.leadership_id);
  if (!ids.length) return [];
  const { data: people } = await supabase
    .from("leadership")
    .select("id, full_name, status, published_at")
    .in("id", ids)
    .order("full_name");
  const role = new Map((roles ?? []).map((r) => [r.leadership_id, r.role_title]));
  return (people ?? []).map((p) => ({ ...p, role_title: role.get(p.id) ?? null }));
}
