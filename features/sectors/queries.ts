import "server-only";
import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { pageRange, searchPattern, type ListConfig, type ListParams } from "@/lib/cms/list";
import { STATUS_FILTERS } from "@/lib/cms/status";

/** Reading sectors for the CMS. Every function checks the administrator first. */

export const SECTOR_LIST: ListConfig = {
  sortable: ["sort_order", "name", "updated_at", "status"],
  defaultDir: "asc",
  statuses: STATUS_FILTERS,
};

export async function listSectors(params: ListParams) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("sectors")
    .select("id, name, slug, status, published_at, updated_at, sort_order", { count: "exact" });

  if (params.q) {
    const p = searchPattern(params.q);
    query = query.or(`name.ilike.${p},slug.ilike.${p}`);
  }
  // Archived records are hidden unless the "Archived" filter is chosen.
  query = params.status ? query.eq("status", params.status as "draft") : query.neq("status", "archived");

  query = query.order(params.sort, { ascending: params.dir === "asc" });
  if (params.sort !== "name") query = query.order("name", { ascending: true });

  const [from, to] = pageRange(params.page);
  const { data, count, error } = await query.range(from, to);
  if (error) throw new Error(`Could not load sectors: ${error.message}`);
  return { rows: data ?? [], total: count ?? 0 };
}

export async function getSector(id: string) {
  await requireAdmin();
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("sectors").select("*").eq("id", id).maybeSingle();
  return data;
}

/** How many records use this sector (shown before deleting). */
export async function sectorUsage(id: string) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const [companies, projects] = await Promise.all([
    supabase.from("company_sectors").select("company_id", { count: "exact", head: true }).eq("sector_id", id),
    supabase.from("projects").select("id", { count: "exact", head: true }).eq("sector_id", id),
  ]);
  return { companies: companies.count ?? 0, projects: projects.count ?? 0 };
}
