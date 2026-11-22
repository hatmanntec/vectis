"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ActionForm } from "@/components/cms/action-form";
import { NameAndSlugFields, TextAreaField, TextField } from "@/components/cms/fields";
import { SelectField } from "@/components/cms/select-field";
import { MediaPicker, type PickedMedia } from "@/components/cms/media-picker";
import { RichTextEditor } from "@/components/cms/rich-text-editor";
import { Panel } from "@/components/cms/page-parts";
import { FormAlert, SubmitButton } from "@/components/cms/form-bits";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/lib/cms/results";
import { CATEGORY_LABEL } from "../labels";

export type LeaderValues = {
  full_name: string;
  slug: string;
  job_title: string | null;
  category: string;
  biography: unknown;
  display_order: number;
  seo_title: string | null;
  seo_description: string | null;
};

export function LeaderForm({
  action,
  leader,
  photo = null,
}: {
  action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
  leader?: LeaderValues;
  photo?: PickedMedia | null;
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
    <ActionForm action={formAction} className="space-y-6" noValidate>
      {result && !result.ok && !result.fieldErrors ? <FormAlert error={result.error} /> : null}

      <Panel title="The person" description="Enter names and titles exactly as VECTIS confirms them.">
        <NameAndSlugFields
          nameField="full_name"
          nameLabel="Full name (with any titles)"
          nameMax={160}
          defaultName={leader?.full_name}
          defaultSlug={leader?.slug}
          nameError={errors.full_name}
          slugError={errors.slug}
          urlPrefix="/leadership/"
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            name="job_title"
            label="Position"
            hint="e.g. “Chairman” or “Group Managing Director”."
            maxLength={160}
            defaultValue={leader?.job_title}
            error={errors.job_title}
          />
          <SelectField
            name="category"
            label="Appears under"
            required
            placeholder="Choose…"
            options={Object.entries(CATEGORY_LABEL).map(([value, label]) => ({ value, label }))}
            defaultValue={leader?.category ?? ""}
            error={errors.category}
          />
        </div>
        <TextField
          name="display_order"
          label="Display order"
          type="number"
          defaultValue={leader?.display_order ?? 0}
          error={errors.display_order}
          hint="Order within the group. Lower numbers appear first (e.g. the Chairman as 0)."
        />
      </Panel>

      <Panel title="Biography">
        <RichTextEditor name="biography" label="Biography" defaultValue={leader?.biography ?? undefined} error={errors.biography} />
      </Panel>

      <Panel title="Photo">
        <MediaPicker
          name="photo_media_id"
          label="Portrait"
          hint="An approved, professional portrait. Square or upright photos work best."
          initial={photo}
          error={errors.photo_media_id}
        />
      </Panel>

      <Panel title="Search engines">
        <TextField name="seo_title" label="SEO title" maxLength={70} defaultValue={leader?.seo_title} error={errors.seo_title} />
        <TextAreaField name="seo_description" label="SEO description" maxLength={160} rows={2} defaultValue={leader?.seo_description} error={errors.seo_description} />
      </Panel>

      <div className="flex items-center gap-3">
        <SubmitButton pendingText="Saving…" className="w-auto px-6">
          {leader ? "Save changes" : "Create profile"}
        </SubmitButton>
        <Button asChild variant="ghost">
          <Link href="/admin/leadership">Cancel</Link>
        </Button>
      </div>
    </ActionForm>
  );
}
