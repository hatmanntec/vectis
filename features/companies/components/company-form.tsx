"use client";

import { useActionState, useEffect, useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { NameAndSlugFields, TextAreaField, TextField } from "@/components/cms/fields";
import { MediaPicker, type PickedMedia } from "@/components/cms/media-picker";
import { RichTextEditor } from "@/components/cms/rich-text-editor";
import { Panel } from "@/components/cms/page-parts";
import { FormAlert, SubmitButton } from "@/components/cms/form-bits";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { ActionResult } from "@/lib/cms/results";
import { CLASSIFICATIONS, CLASSIFICATION_LABEL, type Classification } from "../labels";
import { ActionForm } from "@/components/cms/action-form";

export type CompanyValues = {
  id?: string;
  name: string;
  slug: string;
  classification: Classification;
  parent_company_id: string | null;
  short_description: string | null;
  full_description: unknown;
  established_year: number | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
  sector_ids: string[];
  primary_sector_id: string | null;
};

type Option = { id: string; name: string; classification?: Classification; status: string };

export function CompanyForm({
  action,
  company,
  companies,
  sectors,
  logo = null,
  cover = null,
}: {
  action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
  company?: CompanyValues;
  companies: Option[];
  sectors: Option[];
  logo?: PickedMedia | null;
  cover?: PickedMedia | null;
}) {
  const [result, formAction] = useActionState(action, null);
  const router = useRouter();
  const errors = result && !result.ok ? (result.fieldErrors ?? {}) : {};
  const [classification, setClassification] = useState<Classification | "">(company?.classification ?? "");
  const parentId = useId();

  useEffect(() => {
    if (!result) return;
    if (result.ok) {
      toast.success(result.message ?? "Saved.");
      router.refresh();
    } else toast.error(result.error);
  }, [result, router]);

  // Archived companies are not offered as new parents, but the CURRENT parent
  // is always listed, so saving never silently removes it.
  const parentChoices = companies.filter(
    (c) => c.id !== company?.id && (c.status !== "archived" || c.id === company?.parent_company_id),
  );

  return (
    <ActionForm action={formAction} className="space-y-6" noValidate>
      {result && !result.ok && !result.fieldErrors ? <FormAlert error={result.error} /> : null}

      <Panel title="Identity">
        <NameAndSlugFields
          nameLabel="Company name"
          defaultName={company?.name}
          defaultSlug={company?.slug}
          nameError={errors.name}
          slugError={errors.slug}
          urlPrefix="/businesses/"
        />

        <fieldset className="space-y-2">
          <legend className="text-sm leading-none font-medium">
            What kind of company is this? <span className="text-copper" aria-hidden>*</span>
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {CLASSIFICATIONS.map((c) => (
              <label
                key={c.value}
                className="flex cursor-pointer gap-3 border border-input bg-white p-3 text-sm has-[:checked]:border-indigo has-[:checked]:bg-indigo/5"
              >
                <input
                  type="radio"
                  name="classification"
                  value={c.value}
                  checked={classification === c.value}
                  onChange={() => setClassification(c.value)}
                  className="mt-0.5"
                />
                <span>
                  <span className="block font-medium text-graphite">{c.label}</span>
                  <span className="block text-xs text-muted-foreground">{c.help}</span>
                </span>
              </label>
            ))}
          </div>
          {errors.classification ? <p className="text-xs text-destructive">{errors.classification}</p> : null}
        </fieldset>

        <div className="space-y-2">
          <Label htmlFor={parentId}>Sits under (parent organisation)</Label>
          <select
            id={parentId}
            name="parent_company_id"
            defaultValue={company?.parent_company_id ?? ""}
            disabled={classification === "group"}
            aria-invalid={Boolean(errors.parent_company_id)}
            className="h-9 w-full border border-input bg-white px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50"
          >
            <option value="">— None —</option>
            {parentChoices.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.classification ? ` (${CLASSIFICATION_LABEL[c.classification]})` : ""}
                {c.status === "archived" ? " (archived)" : ""}
              </option>
            ))}
          </select>
          <p className={errors.parent_company_id ? "text-xs text-destructive" : "text-xs text-muted-foreground"}>
            {errors.parent_company_id ??
              (classification === "group"
                ? "The parent organisation is at the top of the group, so it has no parent."
                : "For VECTIS businesses, choose VECTIS. For subsidiaries, the company that owns them. Investments and partnerships are recorded separately and never imply ownership.")}
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            name="established_year"
            label="Year established"
            defaultValue={company?.established_year ?? ""}
            error={errors.established_year}
            hint="Leave empty if not confirmed."
          />
          <TextField
            name="sort_order"
            label="Display order"
            type="number"
            defaultValue={company?.sort_order ?? 0}
            error={errors.sort_order}
            hint="Lower numbers appear first."
          />
        </div>
      </Panel>

      <Panel title="Description">
        <TextAreaField
          name="short_description"
          label="Short description"
          hint="One or two sentences for lists and cards."
          maxLength={300}
          rows={3}
          defaultValue={company?.short_description}
          error={errors.short_description}
        />
        <RichTextEditor
          name="full_description"
          label="Full description"
          hint="Shown on the company's own page. Use headings and lists to keep it easy to read."
          defaultValue={company?.full_description ?? undefined}
          error={errors.full_description}
        />
      </Panel>

      <Panel title="Sectors" description="Tick every sector the company works in, and choose its main sector.">
        {sectors.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No sectors yet.{" "}
            <Link href="/admin/sectors/new" className="text-indigo underline">
              Add sectors
            </Link>{" "}
            first, then come back to assign them.
          </p>
        ) : (
          <SectorsField
            sectors={sectors}
            initialIds={company?.sector_ids ?? []}
            initialPrimary={company?.primary_sector_id ?? null}
            error={errors.primary_sector_id ?? errors.sector_ids}
          />
        )}
      </Panel>

      <Panel title="Images">
        <MediaPicker name="logo_media_id" label="Company logo" initial={logo} error={errors.logo_media_id} />
        <MediaPicker
          name="cover_media_id"
          label="Cover image"
          hint="A wide photograph shown at the top of the company's page."
          initial={cover}
          error={errors.cover_media_id}
        />
      </Panel>

      <Panel title="Contact details" description="Leave any of these empty if they shouldn't appear.">
        <TextField name="website" label="Website" type="url" defaultValue={company?.website} error={errors.website} />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField name="email" label="Email" type="email" defaultValue={company?.email} error={errors.email} />
          <TextField name="phone" label="Telephone" maxLength={40} defaultValue={company?.phone} error={errors.phone} />
        </div>
        <TextAreaField name="address" label="Address" maxLength={500} rows={3} defaultValue={company?.address} error={errors.address} />
      </Panel>

      <Panel title="Search engines" description="Optional. If left empty, the company name and short description are used.">
        <TextField name="seo_title" label="SEO title" maxLength={70} defaultValue={company?.seo_title} error={errors.seo_title} />
        <TextAreaField
          name="seo_description"
          label="SEO description"
          maxLength={160}
          rows={2}
          defaultValue={company?.seo_description}
          error={errors.seo_description}
        />
      </Panel>

      <div className="flex items-center gap-3">
        <SubmitButton pendingText="Saving…" className="w-auto px-6">
          {company ? "Save changes" : "Create company"}
        </SubmitButton>
        <Button asChild variant="ghost">
          <Link href="/admin/companies">Cancel</Link>
        </Button>
      </div>
    </ActionForm>
  );
}

function SectorsField({
  sectors,
  initialIds,
  initialPrimary,
  error,
}: {
  sectors: Option[];
  initialIds: string[];
  initialPrimary: string | null;
  error?: string;
}) {
  const [chosen, setChosen] = useState<Set<string>>(new Set(initialIds));
  const [primary, setPrimary] = useState<string | null>(initialPrimary);

  return (
    <div className="space-y-2">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-muted-foreground">
            <th className="pb-2 font-medium">Sector</th>
            <th className="w-24 pb-2 text-center font-medium">Main sector</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border border-y border-border">
          {sectors.map((s) => {
            const on = chosen.has(s.id);
            return (
              <tr key={s.id}>
                <td className="py-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="sector_ids"
                      value={s.id}
                      checked={on}
                      onChange={(e) => {
                        const next = new Set(chosen);
                        if (e.target.checked) next.add(s.id);
                        else {
                          next.delete(s.id);
                          if (primary === s.id) setPrimary(null);
                        }
                        setChosen(next);
                      }}
                    />
                    {s.name}
                    {s.status === "draft" ? <span className="text-xs text-muted-foreground">(draft)</span> : null}
                  </label>
                </td>
                <td className="py-2 text-center">
                  <input
                    type="radio"
                    name="primary_sector_id"
                    value={s.id}
                    checked={primary === s.id}
                    disabled={!on}
                    onChange={() => setPrimary(s.id)}
                    aria-label={`Make ${s.name} the main sector`}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {primary ? null : <input type="hidden" name="primary_sector_id" value="" />}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
