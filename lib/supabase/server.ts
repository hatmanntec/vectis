import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { supabaseEnv } from "./env";

/**
 * Supabase client for code that runs on the server (pages, server actions,
 * route handlers) on behalf of the person making the request.
 *
 * It reads that person's login session from their cookies, so the database
 * applies the right rules: an administrator sees CMS data, a visitor sees
 * only published content.
 *
 * Create a new one for every request; never share it between requests.
 */
export async function createSupabaseServerClient() {
  const { url, key } = supabaseEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Pages cannot set cookies while rendering. That is fine: the
          // session is refreshed by proxy.ts (added in M3) before the page runs.
        }
      },
    },
  });
}
