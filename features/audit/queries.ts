import "server-only";
import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { pageRange, searchPattern, type ListConfig, type ListParams } from "@/lib/cms/list";

/** Friendly names for the database tables that appear in the audit trail. */
export const AUDIT_TABLES: Record<string, string> = {
  companies: "Company",
  company_sectors: "Company sector link",
  company_relationships: "Company relationship",
  investments: "Investment",
  investment_private_details: "Investment (confidential details)",
  projects: "Project",
  project_milestones: "Project milestone",
  news: "News item",
  news_companies: "News company tag",
  leadership: "Leadership profile",
  leadership_affiliations: "Leadership company role",
  pages: "Website page",
  media: "Media file",
  media_links: "Gallery / document link",
  sectors: "Sector",
  website_settings: "Website settings",
  admin_profiles: "Administrator",
  enquiries: "Enquiry",
};

export const AUDIT_LIST: ListConfig = {
  sortable: ["occurred_at"],
  defaultDir: "desc",
  filters: {
    table: Object.keys(AUDIT_TABLES),
    action: ["insert", "update", "delete"],
  },
};

export async function listAuditEntries(params: ListParams) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("audit_logs")
    .select("id, occurred_at, actor_email, action, table_name, record_id, record_label, changes", { count: "exact" });

  if (params.q) {
    const p = searchPattern(params.q);
    query = query.or(`record_label.ilike.${p},actor_email.ilike.${p}`);
  }
  if (params.filters.table) query = query.eq("table_name", params.filters.table);
  if (params.filters.action) query = query.eq("action", params.filters.action as "insert");

  const [from, to] = pageRange(params.page);
  const { data, count, error } = await query
    .order("occurred_at", { ascending: params.dir === "asc" })
    .order("id", { ascending: params.dir === "asc" })
    .range(from, to);
  if (error) throw new Error(`Could not load the audit log: ${error.message}`);
  return { rows: data ?? [], total: count ?? 0 };
}
