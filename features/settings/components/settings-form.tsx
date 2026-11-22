"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TextAreaField, TextField } from "@/components/cms/fields";
import { MediaPicker, type PickedMedia } from "@/components/cms/media-picker";
import { Panel } from "@/components/cms/page-parts";
import { FormAlert, SubmitButton } from "@/components/cms/form-bits";
import type { ActionResult } from "@/lib/cms/results";
import { SOCIAL_NETWORKS } from "../schema";

export type SettingsValues = {
  site_name: string;
  tagline: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_address: string | null;
  seo_default_title: string | null;
  seo_default_description: string | null;
  social_links: Record<string, string>;
  logo: PickedMedia | null;
  ogImage: PickedMedia | null;
};

export function SettingsForm({
  action,
  values,
}: {
  action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
  values: SettingsValues;
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
    <form action={formAction} className="space-y-6" noValidate>
      {result && !result.ok && !result.fieldErrors ? <FormAlert error={result.error} /> : null}

      <Panel title="Website">
        <TextField name="site_name" label="Website name" required maxLength={80} defaultValue={values.site_name} error={errors.site_name} />
        <TextField name="tagline" label="Tagline" maxLength={200} defaultValue={values.tagline} error={errors.tagline} />
      </Panel>

      <Panel
        title="Brand"
        description="The official VECTIS logo is built into the website and is always used unless you choose an approved alternative version here."
      >
        <MediaPicker
          name="logo_media_id"
          label="Approved alternative logo (optional)"
          hint="Only for an approved version supplied by VECTIS, such as a transparent logo. Leave empty to use the official master logo."
          initial={values.logo}
          error={errors.logo_media_id}
        />
      </Panel>

      <Panel title="Contact details" description="Shown on the Contact page and in the website footer.">
        <TextField name="contact_email" label="Email" type="email" defaultValue={values.contact_email} error={errors.contact_email} />
        <TextField name="contact_phone" label="Telephone" maxLength={40} defaultValue={values.contact_phone} error={errors.contact_phone} />
        <TextAreaField name="contact_address" label="Address" maxLength={500} rows={3} defaultValue={values.contact_address} error={errors.contact_address} />
      </Panel>

      <Panel title="Social media" description="Full addresses, e.g. https://www.linkedin.com/company/… Leave empty to hide a network.">
        {SOCIAL_NETWORKS.map((n) => (
          <TextField
            key={n.key}
            name={n.key}
            label={n.label}
            type="url"
            defaultValue={values.social_links[n.key] ?? ""}
            error={errors[n.key]}
          />
        ))}
      </Panel>

      <Panel title="Search engines and sharing" description="Used for any page that doesn't set its own.">
        <TextField name="seo_default_title" label="Default title" maxLength={70} defaultValue={values.seo_default_title} error={errors.seo_default_title} />
        <TextAreaField
          name="seo_default_description"
          label="Default description"
          maxLength={160}
          rows={2}
          defaultValue={values.seo_default_description}
          error={errors.seo_default_description}
        />
        <MediaPicker
          name="og_image_media_id"
          label="Default sharing image"
          hint="Shown when a page is shared on social media or messaging apps. Ideal size 1200 × 630 pixels."
          initial={values.ogImage}
          error={errors.og_image_media_id}
        />
      </Panel>

      <SubmitButton pendingText="Saving…" className="w-auto px-6">
        Save settings
      </SubmitButton>
    </form>
  );
}
