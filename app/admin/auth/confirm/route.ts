import { type NextRequest, NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/auth/admin";

/**
 * GET /admin/auth/confirm: where password-reset email links land.
 *
 * Supabase sends one of two kinds of link, and both are handled:
 *   ?code=...                    (standard email template)
 *   ?token_hash=...&type=...     (custom email template)
 * Either one is exchanged for a short login session, then the person is
 * taken to the "choose a new password" page.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const next = safeNextPath(params.get("next"), "/admin/reset-password");
  const supabase = await createSupabaseServerClient();

  const code = params.get("code");
  const tokenHash = params.get("token_hash");
  const type = params.get("type") as EmailOtpType | null;

  let ok = false;
  if (code) {
    ok = !(await supabase.auth.exchangeCodeForSession(code)).error;
  } else if (tokenHash && type) {
    ok = !(await supabase.auth.verifyOtp({ token_hash: tokenHash, type })).error;
  }

  const target = request.nextUrl.clone();
  target.search = "";
  if (ok) {
    target.pathname = next;
  } else {
    target.pathname = "/admin/forgot-password";
    target.searchParams.set("expired", "1");
  }
  return NextResponse.redirect(target);
}
