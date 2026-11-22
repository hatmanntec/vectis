import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Runs before every /admin request (Next.js 16 calls this file "proxy";
 * older versions called it "middleware").
 *
 * 1. Keeps the administrator's login session fresh (renews its cookies).
 * 2. Sends anyone who isn't signed in to the login page.
 * 3. Tells search engines never to index the CMS.
 *
 * This is only the first, quick check. Every CMS page and action checks
 * again on the server (requireAdmin), and the database checks a third time.
 */

// CMS pages anyone may open without being signed in.
const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/forgot-password", "/admin/auth/confirm"];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    return withNoIndex(new NextResponse("The CMS is not configured yet.", { status: 503 }));
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, cacheHeaders) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        // Responses that renew login cookies must never be cached and shared.
        Object.entries(cacheHeaders).forEach(([k, v]) => response.headers.set(k, v));
      },
    },
  });

  // Checks the login token and renews it if needed. Must run on every request.
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims?.sub);

  const path = request.nextUrl.pathname;
  const isPublic = PUBLIC_ADMIN_PATHS.some((p) => path === p || path.startsWith(`${p}/`));

  if (!signedIn && !isPublic) {
    const login = request.nextUrl.clone();
    login.pathname = "/admin/login";
    login.search = path === "/admin" ? "" : `?next=${encodeURIComponent(path)}`;
    const redirect = NextResponse.redirect(login);
    // Keep any cookie clean-up the auth library asked for.
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return withNoIndex(redirect);
  }

  return withNoIndex(response);
}

function withNoIndex(res: NextResponse) {
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  res.headers.set("Cache-Control", "private, no-store");
  return res;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
