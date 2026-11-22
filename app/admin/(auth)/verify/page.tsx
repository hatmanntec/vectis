import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAdminAccess, safeNextPath } from "@/lib/auth/admin";
import { VerifyForm } from "./verify-form";

export const metadata: Metadata = { title: "Two-step verification" };

export default function VerifyPage({ searchParams }: PageProps<"/admin/verify">) {
  return (
    <>
      <h1 className="text-2xl">Two-step verification</h1>
      <p className="mt-2 mb-6 text-sm text-muted-foreground">
        Open your authenticator app and enter the 6-digit code shown for <strong>VECTIS CMS</strong>.
      </p>
      <Suspense fallback={<p className="text-sm text-muted-foreground">Checking your sign-in…</p>}>
        <Gate searchParams={searchParams} />
      </Suspense>
    </>
  );
}

/** Only someone signed in with a password, who has an authenticator set up, belongs here. */
async function Gate({ searchParams }: { searchParams: PageProps<"/admin/verify">["searchParams"] }) {
  const next = safeNextPath((await searchParams).next);
  const access = await getAdminAccess();

  if (access.status === "signed_out") redirect("/admin/login");
  if (access.status === "not_admin") redirect("/admin/no-access");
  if (access.status === "ok") redirect(next);

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.mfa.listFactors();
  if (!data?.totp.some((f) => f.status === "verified")) {
    redirect(`/admin/setup-two-step?next=${encodeURIComponent(next)}`);
  }

  return <VerifyForm next={next} />;
}
