import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * The CMS access check: the "front door" for every CMS page and action.
 *
 * Works out, on the server, where the person stands:
 *   signed_out  no valid login
 *   not_admin   logged in, but not an active VECTIS administrator
 *   needs_mfa   an administrator who hasn't completed two-step login yet
 *   ok          an administrator with two-step login: full CMS access
 *
 * The database applies the same rules again (Row Level Security), so even a
 * mistake here could not expose or change data.
 *
 * `cache` makes repeated calls in one request reuse the first answer.
 */

export type AdminContext = {
  userId: string;
  email: string | null;
  fullName: string;
  role: string;
};

type AccessResult =
  | { status: "signed_out" }
  | { status: "not_admin" }
  | { status: "needs_mfa" }
  | { status: "ok"; admin: AdminContext };

export const getAdminAccess = cache(async (): Promise<AccessResult> => {
  const supabase = await createSupabaseServerClient();

  // getClaims() checks the login token's signature; it is never just trusted.
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (error || !claims?.sub) return { status: "signed_out" };

  // Admins may always read their own profile (any login level), which lets us
  // tell a non-admin apart from an admin who still needs two-step login.
  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("full_name, role, is_active")
    .eq("id", claims.sub)
    .maybeSingle();

  if (!profile || !profile.is_active) return { status: "not_admin" };
  if (claims.aal !== "aal2") return { status: "needs_mfa" };

  return {
    status: "ok",
    admin: {
      userId: claims.sub,
      email: typeof claims.email === "string" ? claims.email : null,
      fullName: profile.full_name,
      role: profile.role,
    },
  };
});

/**
 * Use at the top of every CMS page and every CMS server action.
 * Sends anyone without full access to the right place, otherwise returns
 * the administrator's details.
 */
export async function requireAdmin(): Promise<AdminContext> {
  const access = await getAdminAccess();
  switch (access.status) {
    case "signed_out":
      redirect("/admin/login");
    case "not_admin":
      redirect("/admin/no-access");
    case "needs_mfa":
      redirect("/admin/verify");
    case "ok":
      return access.admin;
  }
}

/**
 * Only allow redirects to CMS pages on this site after login, so a crafted
 * link like /admin/login?next=https://evil.example can't send the
 * administrator somewhere else.
 */
export function safeNextPath(value: unknown, fallback = "/admin"): string {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/admin") || value.startsWith("//") || value.includes("\\")) return fallback;
  if (value.startsWith("/admin/login") || value.startsWith("/admin/auth")) return fallback;
  return value;
}
