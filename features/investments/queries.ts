import "server-only";
import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { pageRange, searchPattern, type ListConfig, type ListParams } from "@/lib/cms/list";
import { STATUS_FILTERS } from "@/lib/cms/status";
import { getMediaByIds } from "@/features/media/queries";

export const INVESTMENT_LIST: ListConfig = {
  sortable: ["updated_at", "investment_date", "investment_status", "status", "sort_order"],
  defaultDir: "desc",
  statuses: STATUS_FILTERS,
  filters: {
    nature: ["portfolio_investment", "equity_stake", "joint_venture", "strategic_investment", "other"],
    investment_status: ["active", "pending", "exited"],
  },
};

type Supabase = Awaited<ReturnType<typeof createSupabaseServerClient>>;

async function companyNames(supabase: Supabase, ids: string[]) {
  const unique = [...new Set(ids)];
  if (!unique.length) return new Map<string, { name: string; status: string; logo_media_id: string | null }>();
  const { data } = await supabase.from("companies").select("id, name, status, logo_media_id").in("id", unique);
  return new Map((data ?? []).map((c) => [c.id, c]));
}

export async function listInvestments(params: ListParams) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("investments")
    .select(
      "id, slug, nature, investment_status, investment_date, status, published_at, updated_at, investor_company_id, investee_company_id, logo_media_id",
      { count: "exact" },
    );

  if (params.q) {
    const p = searchPattern(params.q);
    // Search by either company's name, as well as the web address and summary.
    const { data: matches } = await supabase.from("companies").select("id").ilike("name", p).limit(200);
    const ids = (matches ?? []).map((m) => m.id);
    const byCompany = ids.length
      ? `,investor_company_id.in.(${ids.join(",")}),investee_company_id.in.(${ids.join(",")})`
      : "";
    query = query.or(`slug.ilike.${p},summary.ilike.${p}${byCompany}`);
  }
  query = params.status ? query.eq("status", params.status as "draft") : query.neq("status", "archived");
  if (params.filters.nature) query = query.eq("nature", params.filters.nature as "other");
  if (params.filters.investment_status) query = query.eq("investment_status", params.filters.investment_status as "active");

  const [from, to] = pageRange(params.page);
  const { data, count, error } = await query
    .order(params.sort, { ascending: params.dir === "asc", nullsFirst: false })
    .order("id")
    .range(from, to);
  if (error) throw new Error(`Could not load investments: ${error.message}`);
  const rows = data ?? [];

  const names = await companyNames(supabase, rows.flatMap((r) => [r.investor_company_id, r.investee_company_id]));
  const logos = await getMediaByIds(
    rows.map((r) => r.logo_media_id ?? names.get(r.investee_company_id)?.logo_media_id ?? null),
  );
  return {
    rows: rows.map((r) => {
      const logoId = r.logo_media_id ?? names.get(r.investee_company_id)?.logo_media_id ?? null;
      return {
        ...r,
        investor: names.get(r.investor_company_id)?.name ?? "Unknown",
        investee: names.get(r.investee_company_id)?.name ?? "Unknown",
        logoUrl: logoId ? (logos.get(logoId)?.previewUrl ?? null) : null,
      };
    }),
    total: count ?? 0,
  };
}

export async function getInvestment(id: string) {
  await requireAdmin();
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = await createSupabaseServerClient();
  const [{ data: inv }, { data: priv }] = await Promise.all([
    supabase.from("investments").select("*").eq("id", id).maybeSingle(),
    supabase.from("investment_private_details").select("*").eq("investment_id", id).maybeSingle(),
  ]);
  if (!inv) return null;
  const names = await companyNames(supabase, [inv.investor_company_id, inv.investee_company_id]);
  return {
    ...inv,
    investor: names.get(inv.investor_company_id) ?? null,
    investee: names.get(inv.investee_company_id) ?? null,
    privateDetails: priv,
  };
}

/** Companies to choose from: investors must be part of VECTIS; investees can be any company. */
export async function investmentCompanyOptions() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("companies").select("id, name, classification, status").order("name");
  const all = data ?? [];
  return {
    investors: all.filter((c) => c.classification !== "external"),
    investees: all,
  };
}

/** Investments a company has made or received (shown on the company's page). */
export async function companyInvestments(companyId: string) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("investments")
    .select("id, nature, investment_status, status, published_at, investor_company_id, investee_company_id")
    .or(`investor_company_id.eq.${companyId},investee_company_id.eq.${companyId}`)
    .order("updated_at", { ascending: false });
  const rows = data ?? [];
  const names = await companyNames(supabase, rows.flatMap((r) => [r.investor_company_id, r.investee_company_id]));
  return rows.map((r) => ({
    ...r,
    made: r.investor_company_id === companyId,
    otherName: names.get(r.investor_company_id === companyId ? r.investee_company_id : r.investor_company_id)?.name ?? "Unknown",
  }));
}
