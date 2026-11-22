import "server-only";
import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { pageRange, searchPattern, type ListConfig, type ListParams } from "@/lib/cms/list";
import { getMediaByIds } from "@/features/media/queries";
import { NEWS_TYPES } from "./labels";

export const NEWS_LIST: ListConfig = {
  sortable: ["published_at", "updated_at", "title", "status"],
  defaultDir: "desc",
  // "scheduled" = published with a date still in the future.
  statuses: ["draft", "scheduled", "published", "archived"],
  filters: {
    news_type: NEWS_TYPES,
    featured: ["yes"],
  },
};

export async function listNews(params: ListParams) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const now = new Date().toISOString();

  let query = supabase
    .from("news")
    .select("id, title, slug, news_type, is_featured, author_name, status, published_at, updated_at, cover_media_id", {
      count: "exact",
    });

  if (params.q) {
    const p = searchPattern(params.q);
    query = query.or(`title.ilike.${p},slug.ilike.${p},excerpt.ilike.${p},author_name.ilike.${p}`);
  }
  if (params.status === "scheduled") query = query.eq("status", "published").gt("published_at", now);
  else if (params.status === "published") query = query.eq("status", "published").lte("published_at", now);
  else if (params.status) query = query.eq("status", params.status as "draft");
  else query = query.neq("status", "archived");
  if (params.filters.news_type) query = query.eq("news_type", params.filters.news_type as "article");
  if (params.filters.featured) query = query.eq("is_featured", true);

  const [from, to] = pageRange(params.page);
  const { data, count, error } = await query
    .order(params.sort, { ascending: params.dir === "asc", nullsFirst: false })
    .order("updated_at", { ascending: false })
    .order("id")
    .range(from, to);
  if (error) throw new Error(`Could not load news: ${error.message}`);
  const rows = data ?? [];
  const covers = await getMediaByIds(rows.map((r) => r.cover_media_id));
  return {
    rows: rows.map((r) => ({ ...r, coverUrl: r.cover_media_id ? (covers.get(r.cover_media_id)?.previewUrl ?? null) : null })),
    total: count ?? 0,
  };
}

export async function getNews(id: string) {
  await requireAdmin();
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = await createSupabaseServerClient();
  const [{ data }, { data: tags }] = await Promise.all([
    supabase.from("news").select("*").eq("id", id).maybeSingle(),
    supabase.from("news_companies").select("company_id").eq("news_id", id),
  ]);
  if (!data) return null;
  return { ...data, company_ids: (tags ?? []).map((t) => t.company_id) };
}

/** Companies that can be tagged (archived ones are hidden in the form unless already tagged). */
export async function newsCompanyOptions() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("companies").select("id, name, status").order("name");
  return data ?? [];
}

/** News items tagged with a company (shown on the company's page). */
export async function companyNews(companyId: string) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { data: tags } = await supabase.from("news_companies").select("news_id").eq("company_id", companyId);
  const ids = (tags ?? []).map((t) => t.news_id);
  if (!ids.length) return [];
  const { data } = await supabase
    .from("news")
    .select("id, title, news_type, status, published_at")
    .in("id", ids)
    .order("published_at", { ascending: false, nullsFirst: true })
    .limit(20);
  return data ?? [];
}
