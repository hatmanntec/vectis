"use client";

import { useActionState, useEffect, useId } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TextAreaField, TextField } from "@/components/cms/fields";
import { SubmitButton } from "@/components/cms/form-bits";
import { Label } from "@/components/ui/label";
import { CATEGORY_LABEL } from "@/lib/media/rules";
import type { ActionResult } from "@/lib/cms/results";

export function MediaDetailsForm({
  action,
  media,
  image,
}: {
  action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
  media: { alt_text: string | null; caption: string | null; category: string };
  image: boolean;
}) {
  const [result, formAction] = useActionState(action, null);
  const router = useRouter();
  const categoryId = useId();
  const errors = result && !result.ok ? (result.fieldErrors ?? {}) : {};

  useEffect(() => {
    if (!result) return;
    if (result.ok) {
      toast.success(result.message ?? "Saved.");
      router.refresh();
    } else toast.error(result.error);
  }, [result, router]);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {image ? (
        <TextField
          name="alt_text"
          label="Alternative text"
          hint="Describe the image for people who can't see it, and for search engines (e.g. “Drilling platform at dusk”)."
          maxLength={300}
          defaultValue={media.alt_text}
          error={errors.alt_text}
        />
      ) : (
        <input type="hidden" name="alt_text" value={media.alt_text ?? ""} />
      )}
      <TextAreaField name="caption" label="Caption" maxLength={500} rows={2} defaultValue={media.caption} error={errors.caption} />
      <div className="space-y-2">
        <Label htmlFor={categoryId}>Type</Label>
        <select
          id={categoryId}
          name="category"
          defaultValue={media.category}
          className="h-9 w-full border border-input bg-white px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          {Object.entries(CATEGORY_LABEL).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </div>
      <SubmitButton pendingText="Saving…" className="w-auto px-6">
        Save details
      </SubmitButton>
    </form>
  );
}
