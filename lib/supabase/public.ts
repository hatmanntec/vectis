import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { supabaseEnv } from "./env";

/**
 * Supabase client for reading PUBLISHED content on the public website.
 *
 * It never carries anyone's login, so the database always treats it as an
 * anonymous visitor: it can only ever see published content, even if an
 * administrator happens to be viewing the page. Because it doesn't depend on
 * cookies, pages that use it can be cached and served quickly.
 */
export function createSupabasePublicClient() {
  const { url, key } = supabaseEnv();
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
