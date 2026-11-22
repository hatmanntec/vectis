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
  // Read the cookies first: this marks the page as "per visitor", so Next.js
  // never tries to run it ahead of time during the build.
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
