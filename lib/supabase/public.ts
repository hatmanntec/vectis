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
  // While the site is being built without Supabase settings (e.g. a local
  // test build), read from nowhere: every list is empty and the home page
  // shows the holding message. On Vercel the settings are always present.
  if (process.env.NEXT_PHASE === "phase-production-build" && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return createClient<Database>("http://127.0.0.1:9", "not-configured", {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
  }
  const { url, key } = supabaseEnv();
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
