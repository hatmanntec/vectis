"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormAlert, SubmitButton } from "@/components/cms/form-bits";
import { verifyCode, signOut, type FormState } from "@/lib/auth/actions";

export function VerifyForm({ next }: { next: string }) {
  const [state, action] = useActionState<FormState, FormData>(verifyCode, {});

  return (
    <>
      <form action={action} className="space-y-5" noValidate>
        <input type="hidden" name="next" value={next} />
        <FormAlert error={state.error} />
        <div className="space-y-2">
          <Label htmlFor="code">6-digit code</Label>
          <Input
            id="code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6}"
            maxLength={6}
            required
            autoFocus
            className="text-center font-mono text-lg tracking-[0.4em]"
          />
        </div>
        <SubmitButton pendingText="Checking…">Verify and continue</SubmitButton>
      </form>
      <form action={signOut} className="mt-6 text-center">
        <button type="submit" className="text-xs text-muted-foreground underline-offset-4 hover:underline">
          Cancel and sign out
        </button>
      </form>
    </>
  );
}
