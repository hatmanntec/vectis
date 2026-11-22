"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeNextPath } from "./admin";

/**
 * Login, two-step verification, password reset and sign-out.
 * Everything runs on the server; the browser never talks to Supabase
 * directly for these steps. Messages are deliberately general, so they don't
 * help someone guess which emails or passwords are valid.
 */

export type FormState = { error?: string; message?: string };

export type EnrolState = FormState & {
  factorId?: string;
  qrCode?: string;
  secret?: string;
};

const emailSchema = z.string().trim().toLowerCase().email().max(254);
const codeSchema = z.string().trim().regex(/^\d{6}$/);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function siteUrl(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
  if (configured) return configured;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/** Is the signed-in person an active administrator? (any login level) */
async function isActiveAdmin(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>, userId: string) {
  const { data } = await supabase
    .from("admin_profiles")
    .select("is_active")
    .eq("id", userId)
    .maybeSingle();
  return Boolean(data?.is_active);
}

async function verifiedTotpFactorId(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>) {
  const { data } = await supabase.auth.mfa.listFactors();
  return data?.totp.find((f) => f.status === "verified")?.id ?? null;
}

// ---------------------------------------------------------------------------
// 1. Email + password
// ---------------------------------------------------------------------------

const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(200),
});

export async function signIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Enter your email address and password." };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.user) {
    if (error?.code === "over_request_rate_limit") {
      return { error: "Too many attempts. Please wait a few minutes and try again." };
    }
    return { error: "The email address or password is incorrect." };
  }

  if (!(await isActiveAdmin(supabase, data.user.id))) {
    await supabase.auth.signOut();
    return { error: "This account does not have access to the VECTIS CMS." };
  }

  const next = safeNextPath(formData.get("next"));
  const factorId = await verifiedTotpFactorId(supabase);
  const step = factorId ? "/admin/verify" : "/admin/setup-two-step";
  redirect(`${step}?next=${encodeURIComponent(next)}`);
}

// ---------------------------------------------------------------------------
// 2a. First-time setup of the authenticator app
// ---------------------------------------------------------------------------

export async function startEnrolment(): Promise<EnrolState> {
  const supabase = await createSupabaseServerClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) redirect("/admin/login");
  if (!(await isActiveAdmin(supabase, userId))) redirect("/admin/no-access");

  // If an authenticator is already set up, a password alone must never be
  // enough to add another one: send them to enter their code instead.
  if (await verifiedTotpFactorId(supabase)) redirect("/admin/verify");

  // Clear any half-finished earlier attempt, then start a fresh one.
  const { data: factors } = await supabase.auth.mfa.listFactors();
  for (const f of factors?.all ?? []) {
    if (f.status !== "verified") await supabase.auth.mfa.unenroll({ factorId: f.id });
  }

  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: "totp",
    friendlyName: "VECTIS CMS",
    issuer: "VECTIS CMS",
  });
  if (error || !data) {
    return { error: "Two-step setup could not be started. Please try again." };
  }

  return { factorId: data.id, qrCode: toSafeSvgDataUrl(data.totp.qr_code), secret: data.totp.secret };
}

/**
 * Supabase returns the QR code as raw SVG text inside a data URL. Browsers can
 * refuse that form (a "#" in the SVG cuts it short), so convert it to the
 * base64 form every browser accepts. If it is not an SVG, show no image; the
 * typed setup key still works.
 */
function toSafeSvgDataUrl(qr: string): string | undefined {
  const comma = qr.indexOf(",");
  const meta = qr.slice(0, comma);
  if (comma < 0 || !meta.startsWith("data:image/svg+xml")) return undefined;
  if (meta.includes(";base64")) return qr;

  let svg = qr.slice(comma + 1);
  if (/%3C/i.test(svg)) {
    try {
      svg = decodeURIComponent(svg);
    } catch {
      return undefined;
    }
  }
  return `data:image/svg+xml;base64,${Buffer.from(svg, "utf8").toString("base64")}`;
}

const confirmEnrolmentSchema = z.object({
  factorId: z.string().uuid(),
  code: codeSchema,
});

export async function confirmEnrolment(prev: EnrolState, formData: FormData): Promise<EnrolState> {
  const parsed = confirmEnrolmentSchema.safeParse({
    factorId: formData.get("factorId"),
    code: formData.get("code"),
  });
  if (!parsed.success) return { ...prev, error: "Enter the 6-digit code from your authenticator app." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.mfa.challengeAndVerify(parsed.data);
  if (error) {
    return {
      ...prev,
      error: "That code didn't work. Codes change every 30 seconds: enter the newest one.",
    };
  }

  redirect(safeNextPath(formData.get("next")));
}

// ---------------------------------------------------------------------------
// 2b. Every later login: enter the 6-digit code
// ---------------------------------------------------------------------------

export async function verifyCode(_prev: FormState, formData: FormData): Promise<FormState> {
  const code = codeSchema.safeParse(formData.get("code"));
  if (!code.success) return { error: "Enter the 6-digit code from your authenticator app." };

  const supabase = await createSupabaseServerClient();
  const factorId = await verifiedTotpFactorId(supabase);
  if (!factorId) redirect("/admin/setup-two-step");

  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code: code.data });
  if (error) {
    if (error.code === "over_request_rate_limit") {
      return { error: "Too many attempts. Please wait a few minutes and try again." };
    }
    return { error: "That code didn't work. Codes change every 30 seconds: enter the newest one." };
  }

  redirect(safeNextPath(formData.get("next")));
}

// ---------------------------------------------------------------------------
// 3. Forgotten password
// ---------------------------------------------------------------------------

export async function requestPasswordReset(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = emailSchema.safeParse(formData.get("email"));
  if (!email.success) return { error: "Enter a valid email address." };

  const supabase = await createSupabaseServerClient();
  await supabase.auth.resetPasswordForEmail(email.data, {
    redirectTo: `${await siteUrl()}/admin/auth/confirm?next=/admin/reset-password`,
  });

  // Same answer whether or not the address exists.
  return {
    message:
      "If that address belongs to a VECTIS administrator, a reset link is on its way. " +
      "Open it on this device; it can be used once and expires after a short time.",
  };
}

const newPasswordSchema = z
  .object({
    password: z.string().min(12).max(72),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"] });

export async function updatePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = newPasswordSchema.safeParse({
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) {
    const mismatch = parsed.error.issues.some((i) => i.path[0] === "confirm");
    return {
      error: mismatch
        ? "The two passwords don't match."
        : "Use at least 12 characters (and no more than 72).",
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;
  if (!claims?.sub) redirect("/admin/login");

  // With an authenticator set up, changing the password also needs the code.
  if (claims.aal !== "aal2" && (await verifiedTotpFactorId(supabase))) {
    redirect("/admin/verify?next=/admin/reset-password");
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    if (error.code === "same_password") return { error: "Choose a password you haven't used here before." };
    if (error.code === "weak_password") return { error: "That password is too easy to guess. Try a longer one." };
    return { error: "The password could not be changed. Please try again." };
  }

  redirect("/admin");
}

// ---------------------------------------------------------------------------
// 4. Sign out
// ---------------------------------------------------------------------------

export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
