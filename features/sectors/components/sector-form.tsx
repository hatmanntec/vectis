"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { NameAndSlugFields, TextAreaField, TextField } from "@/components/cms/fields";
import { Panel } from "@/components/cms/page-parts";
import { FormAlert, SubmitButton } from "@/components/cms/form-bits";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/lib/cms/results";

type SectorValues = {
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
};

export function SectorForm({
  action,
  sector,
}: {
  action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
  sector?: SectorValues;
}) {
  const [result, formAction] = useActionState(action, null);
  const router = useRouter();
  const errors = result && !result.ok ? (result.fieldErrors ?? {}) : {};

  useEffect(() => {
    if (!result) return;
    if (result.ok) {
      toast.success(result.message ?? "Saved.");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }, [result, router]);

  return (
    <form action={formAction} className="space-y-6" noValidate>
      {result && !result.ok && !result.fieldErrors ? <FormAlert error={result.error} /> : null}

      <Panel title="Details">
        <NameAndSlugFields
          nameLabel="Sector name"
          nameMax={120}
          defaultName={sector?.name}
          defaultSlug={sector?.slug}
          nameError={errors.name}
          slugError={errors.slug}
          urlPrefix="/industries/"
        />
        <TextAreaField
          name="description"
          label="Description"
          hint="A short introduction shown on the sector's page."
          maxLength={2000}
          rows={5}
          defaultValue={sector?.description}
          error={errors.description}
        />
        <TextField
          name="sort_order"
          label="Display order"
          type="number"
          hint="Lower numbers appear first on the website."
          defaultValue={sector?.sort_order ?? 0}
          error={errors.sort_order}
        />
      </Panel>

      <Panel title="Search engines" description="Optional. If left empty, the sector name and description are used.">
        <TextField name="seo_title" label="SEO title" maxLength={70} defaultValue={sector?.seo_title} error={errors.seo_title} />
        <TextAreaField
          name="seo_description"
          label="SEO description"
          maxLength={160}
          rows={2}
          defaultValue={sector?.seo_description}
          error={errors.seo_description}
        />
      </Panel>

      <div className="flex items-center gap-3">
        <SubmitButton pendingText="Saving…" className="w-auto px-6">
          {sector ? "Save changes" : "Create sector"}
        </SubmitButton>
        <Button asChild variant="ghost">
          <Link href="/admin/sectors">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
