import "server-only";
import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** All website pages: core pages first (in the site's order), then extra pages by title. */
export async function listPages(showArchived: boolean) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  let query = supabase.from("pages").select("id, page_key, template, title, slug, is_system, status, published_at, updated_at");
  query = showArchived ? query.eq("status", "archived") : query.neq("status", "archived");
  const { data, error } = await query.order("title");
  if (error) throw new Error(`Could not load pages: ${error.message}`);
  const order = ["home", "about", "history", "businesses", "investment-philosophy", "governance", "leadership", "contact"];
  return (data ?? []).sort((a, b) => {
    if (a.is_system !== b.is_system) return a.is_system ? -1 : 1;
    if (a.is_system) return order.indexOf(a.page_key) - order.indexOf(b.page_key);
    return a.title.localeCompare(b.title);
  });
}

export async function getPage(id: string) {
  await requireAdmin();
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("pages").select("*").eq("id", id).maybeSingle();
  return data;
}
