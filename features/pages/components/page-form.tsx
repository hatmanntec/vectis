"use client";

import { useActionState, useEffect, useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ActionForm } from "@/components/cms/action-form";
import { TextAreaField, TextField } from "@/components/cms/fields";
import { MediaPicker, type PickedMedia } from "@/components/cms/media-picker";
import { RichTextEditor } from "@/components/cms/rich-text-editor";
import { Panel } from "@/components/cms/page-parts";
import { FormAlert, SubmitButton } from "@/components/cms/form-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ActionResult } from "@/lib/cms/results";
import type { Template } from "../templates";
import { ItemsField } from "./items-field";

type Item = { heading: string; text: string };

export function PageForm({
  action,
  template,
  page,
  images,
}: {
  action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
  template: Template;
  page: {
    title: string;
    slug: string | null;
    is_system: boolean;
    content: Record<string, unknown>;
    seo_title: string | null;
    seo_description: string | null;
  };
  /** The chosen library images, by field key ("og_image" for the sharing image). */
  images: Record<string, PickedMedia | null>;
}) {
  const [result, formAction] = useActionState(action, null);
  const router = useRouter();
  const errors = result && !result.ok ? (result.fieldErrors ?? {}) : {};
  const slugId = useId();
  const [slug, setSlug] = useState(page.slug ?? "");

  useEffect(() => {
    if (!result) return;
    if (result.ok) {
      toast.success(result.message ?? "Saved.");
      router.refresh();
    } else toast.error(result.error);
  }, [result, router]);

  const c = page.content;
  const str = (k: string) => (typeof c[k] === "string" ? (c[k] as string) : "");

  return (
    <ActionForm action={formAction} className="space-y-6" noValidate>
      {result && !result.ok && !result.fieldErrors ? <FormAlert error={result.error} /> : null}

      <Panel title="Page" description={template.description}>
        <TextField name="title" label="Page title" required maxLength={200} defaultValue={page.title} error={errors.title} hint="Shown as the page heading and in the browser tab." />
        {page.is_system ? null : (
          <div className="space-y-2">
            <Label htmlFor={slugId}>
              Web address <span className="text-copper" aria-hidden>*</span>
            </Label>
            <div className="flex items-stretch">
              <span className="inline-flex items-center border border-r-0 border-input bg-muted px-3 text-xs text-muted-foreground">/</span>
              <Input
                id={slugId}
                name="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase())}
                aria-invalid={Boolean(errors.slug)}
                className="rounded-l-none bg-white font-mono text-sm"
              />
            </div>
            <p className={errors.slug ? "text-xs text-destructive" : "text-xs text-muted-foreground"}>
              {errors.slug ?? "Changing it later changes the page's address."}
            </p>
          </div>
        )}
      </Panel>

      {template.sections.map((section) => (
        <Panel key={section.title} title={section.title} description={section.description}>
          {section.fields.map((f) => {
            const name = `c.${f.key}`;
            const error = errors[name];
            switch (f.kind) {
              case "text":
                return <TextField key={f.key} name={name} label={f.label} hint={f.hint} maxLength={f.max} defaultValue={str(f.key)} error={error} />;
              case "textarea":
                return <TextAreaField key={f.key} name={name} label={f.label} hint={f.hint} maxLength={f.max} rows={3} defaultValue={str(f.key)} error={error} />;
              case "richtext":
                return <RichTextEditor key={f.key} name={name} label={f.label} defaultValue={c[f.key] ?? undefined} error={error} />;
              case "image":
                return <MediaPicker key={f.key} name={name} label={f.label} hint={f.hint} initial={images[f.key] ?? null} error={error} />;
              case "items":
                return (
                  <ItemsField
                    key={f.key}
                    name={name}
                    label={f.label}
                    itemLabel={f.itemLabel}
                    headingLabel={f.headingLabel}
                    textLabel={f.textLabel}
                    maxItems={f.maxItems}
                    hint={f.hint}
                    initial={Array.isArray(c[f.key]) ? (c[f.key] as Item[]) : []}
                    error={error}
                  />
                );
            }
          })}
        </Panel>
      ))}

      <Panel title="Search engines and sharing">
        <TextField name="seo_title" label="SEO title" maxLength={70} defaultValue={page.seo_title} error={errors.seo_title} />
        <TextAreaField name="seo_description" label="SEO description" maxLength={160} rows={2} defaultValue={page.seo_description} error={errors.seo_description} />
        <MediaPicker
          name="og_image_media_id"
          label="Sharing image"
          hint="Shown when the page is shared on social media. Leave empty to use the site's default."
          initial={images.og_image ?? null}
          error={errors.og_image_media_id}
        />
      </Panel>

      <div className="flex items-center gap-3">
        <SubmitButton pendingText="Saving…" className="w-auto px-6">
          Save changes
        </SubmitButton>
        <Button asChild variant="ghost">
          <Link href="/admin/pages">Back to pages</Link>
        </Button>
      </div>
    </ActionForm>
  );
}
