import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAdminAccess, safeNextPath } from "@/lib/auth/admin";
import { EnrolForm } from "./enrol-form";

export const metadata: Metadata = { title: "Set up two-step verification" };

export default function SetupTwoStepPage({ searchParams }: PageProps<"/admin/setup-two-step">) {
  return (
    <>
      <h1 className="text-2xl">Set up two-step verification</h1>
      <p className="mt-2 mb-6 text-sm text-muted-foreground">
        The CMS needs a code from an authenticator app on your phone every time you sign in, as well as your
        password. This takes about two minutes, once.
      </p>
      <Suspense fallback={<p className="text-sm text-muted-foreground">Checking your sign-in…</p>}>
        <Gate searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Gate({ searchParams }: { searchParams: PageProps<"/admin/setup-two-step">["searchParams"] }) {
  const next = safeNextPath((await searchParams).next);
  const access = await getAdminAccess();

  if (access.status === "signed_out") redirect("/admin/login");
  if (access.status === "not_admin") redirect("/admin/no-access");
  if (access.status === "ok") redirect(next);

  // Already set up: this page must not allow adding a second authenticator.
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.mfa.listFactors();
  if (data?.totp.some((f) => f.status === "verified")) {
    redirect(`/admin/verify?next=${encodeURIComponent(next)}`);
  }

  return <EnrolForm next={next} />;
}
