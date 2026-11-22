/**
 * Reads the two public Supabase settings and stops with a clear message if
 * either is missing, instead of failing later with a confusing error.
 *
 * Both values are safe to expose in the browser: Row Level Security in the
 * database decides what they can read. The secret service-role key is never
 * used by this application.
 */
export function supabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (see docs/SETUP.md).",
    );
  }

  return { url, key };
}
