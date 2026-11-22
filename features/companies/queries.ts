import "server-only";
import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { pageRange, searchPattern, type ListConfig, type ListParams } from "@/lib/cms/list";
import { STATUS_FILTERS } from "@/lib/cms/status";
import { getMediaByIds } from "@/features/media/queries";

export const COMPANY_LIST: ListConfig = {
  sortable: ["name", "classification", "status", "updated_at", "sort_order"],
  defaultDir: "asc",
  statuses: STATUS_FILTERS,
  filters: { classification: ["group", "business", "subsidiary", "external"] },
};

const isId = (id: string) => /^[0-9a-f-]{36}$/i.test(id);

export async function listCompanies(params: ListParams) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("companies")
    .select("id, name, slug, classification, status, published_at, updated_at, parent_company_id, logo_media_id", {
      count: "exact",
    });
  if (params.q) {
    const p = searchPattern(params.q);
    query = query.or(`name.ilike.${p},slug.ilike.${p},short_description.ilike.${p}`);
  }
  query = params.status ? query.eq("status", params.status as "draft") : query.neq("status", "archived");
  if (params.filters.classification) query = query.eq("classification", params.filters.classification as "group");

  query = query.order(params.sort, { ascending: params.dir === "asc" });
  if (params.sort !== "name") query = query.order("name", { ascending: true });
  const [from, to] = pageRange(params.page);
  const { data, count, error } = await query.range(from, to);
  if (error) throw new Error(`Could not load companies: ${error.message}`);
  const rows = data ?? [];

  // Names of parent organisations and logo thumbnails, in two extra look-ups.
  const parentIds = [...new Set(rows.map((r) => r.parent_company_id).filter((x): x is string => Boolean(x)))];
  const [parents, logos] = await Promise.all([
    parentIds.length
      ? supabase.from("companies").select("id, name").in("id", parentIds).then((r) => r.data ?? [])
      : Promise.resolve([]),
    getMediaByIds(rows.map((r) => r.logo_media_id)),
  ]);
  const parentName = new Map(parents.map((p) => [p.id, p.name]));

  return {
    rows: rows.map((r) => ({
      ...r,
      parentName: r.parent_company_id ? (parentName.get(r.parent_company_id) ?? null) : null,
      logoUrl: r.logo_media_id ? (logos.get(r.logo_media_id)?.previewUrl ?? null) : null,
    })),
    total: count ?? 0,
  };
}

export async function getCompany(id: string) {
  await requireAdmin();
  if (!isId(id)) return null;
  const supabase = await createSupabaseServerClient();
  const [{ data: company }, { data: sectors }] = await Promise.all([
    supabase.from("companies").select("*").eq("id", id).maybeSingle(),
    supabase.from("company_sectors").select("sector_id, is_primary").eq("company_id", id),
  ]);
  if (!company) return null;
  return {
    ...company,
    sector_ids: (sectors ?? []).map((s) => s.sector_id),
    primary_sector_id: (sectors ?? []).find((s) => s.is_primary)?.sector_id ?? null,
  };
}

/** Companies to choose from (parent organisation, relationships). */
export async function companyOptions() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("companies")
    .select("id, name, classification, status")
    .order("name");
  return data ?? [];
}

export async function sectorOptions() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("sectors").select("id, name, status").neq("status", "archived").order("sort_order").order("name");
  return data ?? [];
}

/** What depends on this company (shown before deleting). */
export async function companyUsage(id: string) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const count = (r: { count: number | null }) => r.count ?? 0;
  const [children, investments, projects] = await Promise.all([
    supabase.from("companies").select("id", { count: "exact", head: true }).eq("parent_company_id", id).then(count),
    supabase
      .from("investments")
      .select("id", { count: "exact", head: true })
      .or(`investor_company_id.eq.${id},investee_company_id.eq.${id}`)
      .then(count),
    supabase.from("projects").select("id", { count: "exact", head: true }).eq("company_id", id).then(count),
  ]);
  return { children, investments, projects };
}

export async function listRelationships(id: string) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("company_relationships")
    .select("id, from_company_id, to_company_id, relationship_type, description, start_date, end_date, status")
    .or(`from_company_id.eq.${id},to_company_id.eq.${id}`)
    .order("created_at");
  const rows = data ?? [];
  const otherIds = [...new Set(rows.map((r) => (r.from_company_id === id ? r.to_company_id : r.from_company_id)))];
  const { data: others } = otherIds.length
    ? await supabase.from("companies").select("id, name").in("id", otherIds)
    : { data: [] as { id: string; name: string }[] };
  const name = new Map((others ?? []).map((o) => [o.id, o.name]));
  return rows.map((r) => {
    const otherId = r.from_company_id === id ? r.to_company_id : r.from_company_id;
    return {
      id: r.id,
      otherId,
      otherName: name.get(otherId) ?? "Unknown company",
      type: r.relationship_type,
      description: r.description,
      start_date: r.start_date,
      end_date: r.end_date,
      visible: r.status === "published",
    };
  });
}
