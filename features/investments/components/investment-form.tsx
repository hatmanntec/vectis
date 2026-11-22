"use client";

import { useActionState, useEffect, useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ActionForm } from "@/components/cms/action-form";
import { TextAreaField, TextField } from "@/components/cms/fields";
import { SelectField } from "@/components/cms/select-field";
import { MediaPicker, type PickedMedia } from "@/components/cms/media-picker";
import { RichTextEditor } from "@/components/cms/rich-text-editor";
import { Panel } from "@/components/cms/page-parts";
import { FormAlert, SubmitButton } from "@/components/cms/form-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { slugify } from "@/lib/cms/status";
import type { ActionResult } from "@/lib/cms/results";
import { INVESTMENT_STATUS_LABEL, NATURE_LABEL } from "../labels";

export type InvestmentValues = {
  investor_company_id: string;
  investee_company_id: string;
  nature: string;
  nature_note: string | null;
  investment_status: string;
  investment_date: string | null;
  slug: string;
  summary: string | null;
  description: unknown;
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
};

type CompanyOption = { id: string; name: string; status: string };

export function InvestmentForm({
  action,
  investment,
  investors,
  investees,
  logo = null,
  defaultInvestorId,
}: {
  action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
  investment?: InvestmentValues;
  investors: CompanyOption[];
  investees: CompanyOption[];
  logo?: PickedMedia | null;
  defaultInvestorId?: string;
}) {
  const [result, formAction] = useActionState(action, null);
  const router = useRouter();
  const errors = result && !result.ok ? (result.fieldErrors ?? {}) : {};
  const slugId = useId();

  const [investeeId, setInvesteeId] = useState(investment?.investee_company_id ?? "");
  const [slug, setSlug] = useState(investment?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(investment?.slug));

  useEffect(() => {
    if (!result) return;
    if (result.ok) {
      toast.success(result.message ?? "Saved.");
      router.refresh();
    } else toast.error(result.error);
  }, [result, router]);

  // Archived companies aren't offered, except the ones already chosen.
  const offer = (list: CompanyOption[], current?: string) =>
    list
      .filter((c) => c.status !== "archived" || c.id === current)
      .map((c) => ({ value: c.id, label: `${c.name}${c.status === "archived" ? " (archived)" : ""}` }));

  return (
    <ActionForm action={formAction} className="space-y-6" noValidate>
      {result && !result.ok && !result.fieldErrors ? <FormAlert error={result.error} /> : null}

      <Panel
        title="The investment"
        description="Records that a VECTIS entity has invested in a company. It never means ownership on its own; describe the relationship exactly as VECTIS states it."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            name="investor_company_id"
            label="Investor (VECTIS entity)"
            required
            placeholder="Choose…"
            options={offer(investors, investment?.investor_company_id)}
            defaultValue={investment?.investor_company_id ?? defaultInvestorId ?? ""}
            error={errors.investor_company_id}
            hint={investors.length ? undefined : "Add VECTIS and its businesses under Companies first."}
          />
          <SelectField
            name="investee_company_id"
            label="Invested in"
            required
            placeholder="Choose…"
            options={offer(investees, investment?.investee_company_id)}
            value={investeeId}
            onChange={(v) => {
              setInvesteeId(v);
              if (!slugTouched) setSlug(slugify(investees.find((c) => c.id === v)?.name ?? ""));
            }}
            error={errors.investee_company_id}
            hint="Add the company under Companies first (as an Outside company) if it isn't listed."
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            name="nature"
            label="Nature of the investment"
            required
            placeholder="Choose…"
            options={Object.entries(NATURE_LABEL).map(([value, label]) => ({ value, label }))}
            defaultValue={investment?.nature}
            error={errors.nature}
          />
          <SelectField
            name="investment_status"
            label="Investment status"
            options={Object.entries(INVESTMENT_STATUS_LABEL).map(([value, label]) => ({ value, label }))}
            defaultValue={investment?.investment_status ?? "active"}
            error={errors.investment_status}
          />
        </div>
        <TextField
          name="nature_note"
          label="Relationship in VECTIS's own words (optional)"
          hint="e.g. “Minority shareholding” or “Investment relationship”. Shown with the nature."
          maxLength={300}
          defaultValue={investment?.nature_note}
          error={errors.nature_note}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="investment-date">Investment date (optional)</Label>
            <Input id="investment-date" name="investment_date" type="date" defaultValue={investment?.investment_date ?? ""} className="bg-white" />
            <p className={errors.investment_date ? "text-xs text-destructive" : "text-xs text-muted-foreground"}>
              {errors.investment_date ?? "Only if confirmed."}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor={slugId}>
              Web address <span className="text-copper" aria-hidden>*</span>
            </Label>
            <div className="flex items-stretch">
              <span className="inline-flex items-center border border-r-0 border-input bg-muted px-3 text-xs text-muted-foreground">
                /investments/
              </span>
              <Input
                id={slugId}
                name="slug"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value.toLowerCase());
                }}
                aria-invalid={Boolean(errors.slug)}
                className="rounded-l-none bg-white font-mono text-sm"
              />
            </div>
            <p className={errors.slug ? "text-xs text-destructive" : "text-xs text-muted-foreground"}>
              {errors.slug ?? "Filled in from the company invested in; you can change it."}
            </p>
          </div>
        </div>
      </Panel>

      <Panel title="Description">
        <TextAreaField
          name="summary"
          label="Summary"
          hint="One or two sentences for lists and cards."
          maxLength={400}
          rows={3}
          defaultValue={investment?.summary}
          error={errors.summary}
        />
        <RichTextEditor
          name="description"
          label="Full description"
          defaultValue={investment?.description ?? undefined}
          error={errors.description}
        />
      </Panel>

      <Panel title="Image">
        <MediaPicker
          name="logo_media_id"
          label="Logo"
          hint="Leave empty to use the logo of the company invested in."
          initial={logo}
          error={errors.logo_media_id}
        />
      </Panel>

      <Panel title="Display and search engines">
        <TextField
          name="sort_order"
          label="Display order"
          type="number"
          defaultValue={investment?.sort_order ?? 0}
          error={errors.sort_order}
          hint="Lower numbers appear first."
        />
        <TextField name="seo_title" label="SEO title" maxLength={70} defaultValue={investment?.seo_title} error={errors.seo_title} />
        <TextAreaField
          name="seo_description"
          label="SEO description"
          maxLength={160}
          rows={2}
          defaultValue={investment?.seo_description}
          error={errors.seo_description}
        />
      </Panel>

      <div className="flex items-center gap-3">
        <SubmitButton pendingText="Saving…" className="w-auto px-6">
          {investment ? "Save changes" : "Create investment"}
        </SubmitButton>
        <Button asChild variant="ghost">
          <Link href="/admin/investments">Cancel</Link>
        </Button>
      </div>
    </ActionForm>
  );
}
