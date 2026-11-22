"use client";

import { useActionState, useEffect, useId, useState } from "react";
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
import { Input } from "@/components/ui/input";
import type { ActionResult } from "@/lib/cms/results";
import { NEWS_TYPE_LABEL } from "../labels";

export type NewsValues = {
  title: string;
  slug: string;
  news_type: string;
  excerpt: string | null;
  body: unknown;
  author_name: string | null;
  is_featured: boolean;
  seo_title: string | null;
  seo_description: string | null;
  company_ids: string[];
};

type Option = { id: string; name: string; status: string };

/** Tick the companies an item is about. Archived companies only appear if already ticked. */
function CompanyTags({ companies, initial, error }: { companies: Option[]; initial: string[]; error?: string }) {
  const [selected, setSelected] = useState(() => new Set(initial));
  const [filter, setFilter] = useState("");
  const filterId = useId();
  const shown = companies.filter(
    (c) => (c.status !== "archived" || selected.has(c.id)) && c.name.toLowerCase().includes(filter.trim().toLowerCase()),
  );
  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="space-y-3">
      {/* Ticked companies hidden by the filter are still sent. */}
      {[...selected]
        .filter((id) => !shown.some((c) => c.id === id))
        .map((id) => (
          <input key={id} type="hidden" name="company_ids" value={id} />
        ))}
      {companies.length > 8 ? (
        <Input
          id={filterId}
          aria-label="Filter companies"
          placeholder="Filter companies"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-white"
        />
      ) : null}
      {companies.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No companies yet.{" "}
          <Link href="/admin/companies/new" className="text-indigo underline">
            Add companies
          </Link>
        </p>
      ) : (
        <ul className="grid max-h-64 gap-1 overflow-y-auto sm:grid-cols-2">
          {shown.map((c) => (
            <li key={c.id}>
              <label className="flex cursor-pointer items-center gap-2 px-1 py-1 text-sm hover:bg-ivory/50">
                <input
                  type="checkbox"
                  name="company_ids"
                  value={c.id}
                  checked={selected.has(c.id)}
                  onChange={() => toggle(c.id)}
                  className="size-4 accent-indigo"
                />
                {c.name}
                {c.status === "archived" ? <span className="text-xs text-muted-foreground">(archived)</span> : null}
              </label>
            </li>
          ))}
        </ul>
      )}
      <p className={error ? "text-xs text-destructive" : "text-xs text-muted-foreground"}>
        {error ?? `${selected.size} selected. Tagged companies can show the item on their pages.`}
      </p>
    </div>
  );
}

export function NewsForm({
  action,
  item,
  companies,
  cover = null,
  defaultCompanyId,
}: {
  action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
  item?: NewsValues;
  companies: Option[];
  cover?: PickedMedia | null;
  defaultCompanyId?: string;
}) {
  const [result, formAction] = useActionState(action, null);
  const router = useRouter();
  const errors = result && !result.ok ? (result.fieldErrors ?? {}) : {};
  const featuredId = useId();

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

      <Panel title="The item">
        <NameAndSlugFields
          nameField="title"
          nameLabel="Headline"
          defaultName={item?.title}
          defaultSlug={item?.slug}
          nameError={errors.title}
          slugError={errors.slug}
          urlPrefix="/news/"
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            name="news_type"
            label="Kind"
            options={Object.entries(NEWS_TYPE_LABEL).map(([value, label]) => ({ value, label }))}
            defaultValue={item?.news_type ?? "article"}
            error={errors.news_type}
          />
          <TextField
            name="author_name"
            label="Author or source (optional)"
            hint="e.g. “VECTIS Communications”."
            maxLength={120}
            defaultValue={item?.author_name}
            error={errors.author_name}
          />
        </div>
        <label htmlFor={featuredId} className="flex cursor-pointer items-start gap-3 text-sm">
          <input
            id={featuredId}
            type="checkbox"
            name="is_featured"
            defaultChecked={item?.is_featured ?? false}
            className="mt-0.5 size-4 accent-indigo"
          />
          <span>
            <span className="font-medium text-graphite">Feature this item</span>
            <span className="block text-xs text-muted-foreground">Featured items are given prominence on the website&apos;s news pages.</span>
          </span>
        </label>
      </Panel>

      <Panel title="Text">
        <TextAreaField
          name="excerpt"
          label="Excerpt"
          hint="One or two sentences shown in lists and when shared."
          maxLength={400}
          rows={3}
          defaultValue={item?.excerpt}
          error={errors.excerpt}
        />
        <RichTextEditor name="body" label="Full text" defaultValue={item?.body ?? undefined} error={errors.body} />
      </Panel>

      <Panel title="Companies mentioned" description="Which VECTIS businesses or other companies the item is about.">
        <CompanyTags
          companies={companies}
          initial={item?.company_ids ?? (defaultCompanyId ? [defaultCompanyId] : [])}
          error={errors.company_ids}
        />
      </Panel>

      <Panel title="Image">
        <MediaPicker name="cover_media_id" label="Cover image" hint="Shown at the top of the item and on cards." initial={cover} error={errors.cover_media_id} />
      </Panel>

      <Panel title="Search engines">
        <TextField name="seo_title" label="SEO title" maxLength={70} defaultValue={item?.seo_title} error={errors.seo_title} />
        <TextAreaField name="seo_description" label="SEO description" maxLength={160} rows={2} defaultValue={item?.seo_description} error={errors.seo_description} />
      </Panel>

      <div className="flex items-center gap-3">
        <SubmitButton pendingText="Saving…" className="w-auto px-6">
          {item ? "Save changes" : "Create item"}
        </SubmitButton>
        <Button asChild variant="ghost">
          <Link href="/admin/news">Cancel</Link>
        </Button>
      </div>
    </ActionForm>
  );
}
