import type { Metadata } from "next";
import { Suspense } from "react";
import { ForgotForm } from "./forgot-form";

export const metadata: Metadata = { title: "Reset your password" };

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="text-2xl">Reset your password</h1>
      <p className="mt-2 mb-6 text-sm text-muted-foreground">
        Enter your administrator email address and we&apos;ll send you a link to choose a new password. You&apos;ll
        still need your authenticator app afterwards.
      </p>
      <Suspense>
        <ForgotForm />
      </Suspense>
    </>
  );
}
