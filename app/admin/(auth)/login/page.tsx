import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <>
      <h1 className="text-2xl">Sign in</h1>
      <p className="mt-2 mb-6 text-sm text-muted-foreground">
        Enter your administrator email address and password.
      </p>
      <Suspense>
        <LoginForm />
      </Suspense>
    </>
  );
}
