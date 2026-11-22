"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormAlert, SubmitButton } from "@/components/cms/form-bits";
import { updatePassword, type FormState } from "@/lib/auth/actions";
import { ActionForm } from "@/components/cms/action-form";

export function ResetForm() {
  const [state, action] = useActionState<FormState, FormData>(updatePassword, {});

  return (
    <ActionForm action={action} className="space-y-5" noValidate>
      <FormAlert error={state.error} />
      <div className="space-y-2">
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={12}
          maxLength={72}
          required
          autoFocus
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm">Type it again</Label>
        <Input id="confirm" name="confirm" type="password" autoComplete="new-password" required />
      </div>
      <SubmitButton pendingText="Saving…">Save new password</SubmitButton>
    </ActionForm>
  );
}
