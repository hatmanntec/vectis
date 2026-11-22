"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import { ActionForm } from "@/components/cms/action-form";
import { TextAreaField, TextField } from "@/components/cms/fields";
import { SelectField } from "@/components/cms/select-field";
import { SubmitButton } from "@/components/cms/form-bits";
import type { ActionResult } from "@/lib/cms/results";
import { CURRENCIES } from "../labels";

/**
 * Confidential investment figures. Stored in a separate table that the
 * database never lets the public website read, even for published
 * investments. Leave everything empty and save to clear them.
 */
export function PrivateDetailsForm({
  action,
  values,
}: {
  action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
  values: { stake_percentage: number | null; amount: number | null; currency: string | null; notes: string | null } | null;
}) {
  const [result, formAction] = useActionState(action, null);
  const router = useRouter();
  const errors = result && !result.ok ? (result.fieldErrors ?? {}) : {};

  useEffect(() => {
    if (!result) return;
    if (result.ok) {
      toast.success(result.message ?? "Saved.");
      router.refresh();
    } else toast.error(result.error);
  }, [result, router]);

  return (
    <section className="border border-copper/40 bg-white" aria-label="Confidential details">
      <div className="flex items-start gap-3 border-b border-copper/30 bg-copper/5 px-5 py-4">
        <Lock className="mt-0.5 size-4 shrink-0 text-copper" aria-hidden />
        <div>
          <h2 className="font-sans text-sm font-semibold text-graphite">Confidential details</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            For administrators only. Never shown on the website, even when the investment is published.
          </p>
        </div>
      </div>
      <ActionForm action={formAction} className="space-y-5 px-5 py-5" noValidate>
        <div className="grid gap-5 sm:grid-cols-3">
          <TextField
            name="stake_percentage"
            label="Stake (%)"
            defaultValue={values?.stake_percentage ?? ""}
            error={errors.stake_percentage}
          />
          <TextField name="amount" label="Amount" defaultValue={values?.amount ?? ""} error={errors.amount} />
          <SelectField
            name="currency"
            label="Currency"
            placeholder="—"
            options={CURRENCIES.map((c) => ({ value: c, label: c }))}
            defaultValue={values?.currency ?? ""}
            error={errors.currency}
          />
        </div>
        <TextAreaField name="notes" label="Internal notes" maxLength={5000} rows={3} defaultValue={values?.notes} error={errors.notes} />
        <SubmitButton pendingText="Saving…" className="w-auto px-6">
          Save confidential details
        </SubmitButton>
      </ActionForm>
    </section>
  );
}
