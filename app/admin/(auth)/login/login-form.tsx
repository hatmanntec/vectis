"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormAlert, SubmitButton } from "@/components/cms/form-bits";
import { signIn, type FormState } from "@/lib/auth/actions";

export function LoginForm() {
  const next = useSearchParams().get("next") ?? "";
  const [state, action] = useActionState<FormState, FormData>(signIn, {});

  return (
    <form action={action} className="space-y-5" noValidate>
      <input type="hidden" name="next" value={next} />
      <FormAlert error={state.error} />

      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input id="email" name="email" type="email" autoComplete="username" required autoFocus />
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <Label htmlFor="password">Password</Label>
          <Link
            href="/admin/forgot-password"
            className="text-xs text-indigo underline-offset-4 hover:underline"
          >
            Forgotten password?
          </Link>
        </div>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>

      <SubmitButton pendingText="Signing in…">Sign in</SubmitButton>
    </form>
  );
}
