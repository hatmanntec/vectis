import "server-only";
import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { pageRange, searchPattern, type ListConfig, type ListParams } from "@/lib/cms/list";

export const ENQUIRY_LIST: ListConfig = {
  sortable: ["created_at", "name"],
  defaultDir: "desc",
  filters: { read: ["unread", "read"] },
};

export async function listEnquiries(params: ListParams) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("enquiries")
    .select("id, name, email, organisation, subject, message, is_read, created_at", { count: "exact" });
  if (params.q) {
    const p = searchPattern(params.q);
    query = query.or(`name.ilike.${p},email.ilike.${p},organisation.ilike.${p},subject.ilike.${p},message.ilike.${p}`);
  }
  if (params.filters.read) query = query.eq("is_read", params.filters.read === "read");
  const [from, to] = pageRange(params.page);
  const { data, count, error } = await query
    .order(params.sort, { ascending: params.dir === "asc" })
    .order("id")
    .range(from, to);
  if (error) throw new Error(`Could not load enquiries: ${error.message}`);
  return { rows: data ?? [], total: count ?? 0 };
}

export async function getEnquiry(id: string) {
  await requireAdmin();
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("enquiries")
    .select("id, name, email, phone, organisation, subject, message, is_read, created_at")
    .eq("id", id)
    .maybeSingle();
  return data;
}
