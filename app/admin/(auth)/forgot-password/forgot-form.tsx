"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormAlert, SubmitButton } from "@/components/cms/form-bits";
import { requestPasswordReset, type FormState } from "@/lib/auth/actions";
import { ActionForm } from "@/components/cms/action-form";

export function ForgotForm() {
  const expired = useSearchParams().get("expired") === "1";
  const [state, action] = useActionState<FormState, FormData>(requestPasswordReset, {});

  return (
    <ActionForm action={action} className="space-y-5" noValidate>
      {expired && !state.message && !state.error ? (
        <FormAlert error="That reset link has expired or was already used. Request a new one below." />
      ) : (
        <FormAlert error={state.error} message={state.message} />
      )}
      {!state.message && (
        <>
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input id="email" name="email" type="email" autoComplete="username" required autoFocus />
          </div>
          <SubmitButton pendingText="Sending…">Send reset link</SubmitButton>
        </>
      )}
      <p className="text-center">
        <Link href="/admin/login" className="text-xs text-indigo underline-offset-4 hover:underline">
          Back to sign in
        </Link>
      </p>
    </ActionForm>
  );
}
