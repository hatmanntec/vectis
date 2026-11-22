"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { supabaseEnv } from "./env";

/**
 * Supabase client for code that runs in the browser (interactive CMS
 * screens, e.g. file uploads with a progress bar). It shares the login
 * session with the server client through cookies.
 */
export function createSupabaseBrowserClient() {
  const { url, key } = supabaseEnv();
  return createBrowserClient<Database>(url, key);
}
