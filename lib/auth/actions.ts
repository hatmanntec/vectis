"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeNextPath } from "./admin";

/**
 * Login, password reset and sign-out.
 * Everything runs on the server; the browser never talks to Supabase
 * directly for these steps. Messages are deliberately general, so they don't
 * help someone guess which emails or passwords are valid.
 */

export type FormState = { error?: string; message?: string };

const emailSchema = z.string().trim().toLowerCase().email().max(254);

async function siteUrl(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
  if (configured) return configured;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

// ---------------------------------------------------------------------------
// 1. Sign in
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

  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("is_active")
    .eq("id", data.user.id)
    .maybeSingle();
  if (!profile?.is_active) {
    await supabase.auth.signOut();
    return { error: "This account does not have access to the VECTIS CMS." };
  }

  redirect(safeNextPath(formData.get("next")));
}

// ---------------------------------------------------------------------------
// 2. Forgotten password
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
  if (!claimsData?.claims?.sub) redirect("/admin/login");

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    if (error.code === "same_password") return { error: "Choose a password you haven't used here before." };
    if (error.code === "weak_password") return { error: "That password is too easy to guess. Try a longer one." };
    return { error: "The password could not be changed. Please try again." };
  }

  redirect("/admin");
}

// ---------------------------------------------------------------------------
// 3. Sign out
// ---------------------------------------------------------------------------

export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
