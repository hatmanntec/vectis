import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getAdminAccess } from "@/lib/auth/admin";
import { ResetForm } from "./reset-form";

export const metadata: Metadata = { title: "Choose a new password" };

export default function ResetPasswordPage() {
  return (
    <>
      <h1 className="text-2xl">Choose a new password</h1>
      <p className="mt-2 mb-6 text-sm text-muted-foreground">
        Use at least 12 characters. A short sentence you&apos;ll remember works well.
      </p>
      <Suspense fallback={<p className="text-sm text-muted-foreground">Checking your link…</p>}>
        <Gate />
      </Suspense>
    </>
  );
}

async function Gate() {
  const access = await getAdminAccess();
  if (access.status === "signed_out") redirect("/admin/forgot-password?expired=1");
  if (access.status === "not_admin") redirect("/admin/no-access");
  return <ResetForm />;
}
