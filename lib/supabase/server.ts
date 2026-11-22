import "server-only";
import { cookies } from "next/headers";
import { connection } from "next/server";
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
  // Signed-in pages are always prepared fresh for each visit: never during the
  // build, and never in background pre-loading (the login check reads the
  // current time to see whether the session has expired).
  await connection();
  const cookieStore = await cookies();
  const { url, key } = supabaseEnv();

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
