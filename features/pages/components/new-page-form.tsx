"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ActionForm } from "@/components/cms/action-form";
import { NameAndSlugFields } from "@/components/cms/fields";
import { Panel } from "@/components/cms/page-parts";
import { SubmitButton } from "@/components/cms/form-bits";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/lib/cms/results";

export function NewPageForm({ action }: { action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult> }) {
  const [result, formAction] = useActionState(action, null);
  const errors = result && !result.ok ? (result.fieldErrors ?? {}) : {};
  useEffect(() => {
    if (result && !result.ok) toast.error(result.error);
  }, [result]);
  return (
    <ActionForm action={formAction} className="space-y-6" noValidate>
      <Panel title="New page" description="Give it a title and address; the text is written on the next screen.">
        <NameAndSlugFields nameLabel="Page title" nameError={errors.name} slugError={errors.slug} urlPrefix="/" />
      </Panel>
      <div className="flex items-center gap-3">
        <SubmitButton pendingText="Creating…" className="w-auto px-6">
          Create page
        </SubmitButton>
        <Button asChild variant="ghost">
          <Link href="/admin/pages">Cancel</Link>
        </Button>
      </div>
    </ActionForm>
  );
}
