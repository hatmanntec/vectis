import "server-only";
import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { pageRange, searchPattern, type ListConfig, type ListParams } from "@/lib/cms/list";
import { STATUS_FILTERS } from "@/lib/cms/status";
import { getMediaByIds } from "@/features/media/queries";

export const PROJECT_LIST: ListConfig = {
  sortable: ["title", "updated_at", "start_date", "project_status", "status", "sort_order"],
  defaultDir: "desc",
  statuses: STATUS_FILTERS,
  filters: {
    project_status: ["planned", "in_progress", "completed", "on_hold"],
  },
};

export async function listProjects(params: ListParams) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("projects")
    .select(
      "id, title, slug, project_status, location_name, state, start_date, status, published_at, updated_at, company_id, sector_id, cover_media_id",
      { count: "exact" },
    );

  if (params.q) {
    const p = searchPattern(params.q);
    // Also find projects by the name of the business behind them.
    const { data: matches } = await supabase.from("companies").select("id").ilike("name", p).limit(200);
    const ids = (matches ?? []).map((m) => m.id);
    const byCompany = ids.length ? `,company_id.in.(${ids.join(",")})` : "";
    query = query.or(`title.ilike.${p},slug.ilike.${p},location_name.ilike.${p},state.ilike.${p}${byCompany}`);
  }
  query = params.status ? query.eq("status", params.status as "draft") : query.neq("status", "archived");
  if (params.filters.project_status) query = query.eq("project_status", params.filters.project_status as "planned");

  const [from, to] = pageRange(params.page);
  const { data, count, error } = await query
    .order(params.sort, { ascending: params.dir === "asc", nullsFirst: false })
    .order("id")
    .range(from, to);
  if (error) throw new Error(`Could not load projects: ${error.message}`);
  const rows = data ?? [];

  const companyIds = [...new Set(rows.map((r) => r.company_id))];
  const { data: companies } = companyIds.length
    ? await supabase.from("companies").select("id, name").in("id", companyIds)
    : { data: [] as { id: string; name: string }[] };
  const companyName = new Map((companies ?? []).map((c) => [c.id, c.name]));
  const covers = await getMediaByIds(rows.map((r) => r.cover_media_id));

  return {
    rows: rows.map((r) => ({
      ...r,
      companyName: companyName.get(r.company_id) ?? "Unknown",
      coverUrl: r.cover_media_id ? (covers.get(r.cover_media_id)?.previewUrl ?? null) : null,
    })),
    total: count ?? 0,
  };
}

export async function getProject(id: string) {
  await requireAdmin();
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
  if (!data) return null;
  const { data: company } = await supabase.from("companies").select("id, name, status").eq("id", data.company_id).maybeSingle();
  return { ...data, company };
}

/** Businesses and sectors to choose from. Archived ones are filtered out in the form, except the current choice. */
export async function projectOptions() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const [{ data: companies }, { data: sectors }] = await Promise.all([
    supabase.from("companies").select("id, name, classification, status").order("name"),
    supabase.from("sectors").select("id, name, status").order("sort_order").order("name"),
  ]);
  return { companies: companies ?? [], sectors: sectors ?? [] };
}

export async function listMilestones(projectId: string) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("project_milestones")
    .select("id, title, description, milestone_date, sort_order")
    .eq("project_id", projectId)
    .order("sort_order")
    .order("milestone_date", { nullsFirst: false })
    .order("created_at");
  return data ?? [];
}

/** Projects run by a company (shown on the company's page). */
export async function companyProjects(companyId: string) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("projects")
    .select("id, title, project_status, status, published_at")
    .eq("company_id", companyId)
    .order("sort_order")
    .order("title");
  return data ?? [];
}
