import "server-only";
import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Figures for the dashboard. Every number is counted from the database at the
 * moment the page loads; nothing is estimated or made up.
 */

type Supabase = Awaited<ReturnType<typeof createSupabaseServerClient>>;

const CONTENT_TABLES = ["sectors", "companies", "investments", "projects", "news", "leadership", "pages"] as const;
type ContentTable = (typeof CONTENT_TABLES)[number];

const TITLE_COLUMN: Record<ContentTable, string> = {
  sectors: "name",
  companies: "name",
  investments: "slug",
  projects: "title",
  news: "title",
  leadership: "full_name",
  pages: "title",
};

export const TABLE_LABEL: Record<ContentTable, string> = {
  sectors: "Sector",
  companies: "Company",
  investments: "Investment",
  projects: "Project",
  news: "News",
  leadership: "Leadership",
  pages: "Website page",
};

async function countActive(supabase: Supabase, table: "companies" | "investments" | "projects") {
  const { count } = await supabase.from(table).select("id", { count: "exact", head: true }).neq("status", "archived");
  return count ?? 0;
}

export async function getDashboardData() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const now = new Date().toISOString();

  const [companies, investments, projects, publishedNews, unreadEnquiries, ...draftCounts] = await Promise.all([
    countActive(supabase, "companies"),
    countActive(supabase, "investments"),
    countActive(supabase, "projects"),
    supabase
      .from("news")
      .select("id", { count: "exact", head: true })
      .eq("status", "published")
      .lte("published_at", now)
      .then((r) => r.count ?? 0),
    supabase
      .from("enquiries")
      .select("id", { count: "exact", head: true })
      .eq("is_read", false)
      .then((r) => r.count ?? 0),
    ...CONTENT_TABLES.map((t) =>
      supabase
        .from(t)
        .select("id", { count: "exact", head: true })
        .eq("status", "draft")
        .then((r) => r.count ?? 0),
    ),
  ]);

  const drafts = draftCounts.reduce((a, b) => a + b, 0);
  const draftsByTable = Object.fromEntries(CONTENT_TABLES.map((t, i) => [t, draftCounts[i]])) as Record<ContentTable, number>;

  // Recently changed records: the newest few from each content table, merged.
  const recentLists = await Promise.all(
    CONTENT_TABLES.map(async (t) => {
      const { data } = await supabase
        .from(t)
        .select(`id, status, published_at, updated_at, ${TITLE_COLUMN[t]}`)
        .order("updated_at", { ascending: false })
        .limit(6);
      return ((data ?? []) as unknown as Record<string, string | null>[]).map((r) => ({
        table: t,
        id: r.id as string,
        title: (r[TITLE_COLUMN[t]] ?? "Untitled") as string,
        status: r.status as "draft" | "published" | "archived",
        publishedAt: r.published_at,
        updatedAt: r.updated_at as string,
      }));
    }),
  );
  const recentRecords = recentLists
    .flat()
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 6);

  const { data: activity } = await supabase
    .from("audit_logs")
    .select("id, occurred_at, actor_email, action, table_name, record_label")
    .order("occurred_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(8);

  return {
    counts: { companies, investments, projects, publishedNews, drafts, unreadEnquiries },
    draftsByTable,
    recentRecords,
    activity: activity ?? [],
  };
}
