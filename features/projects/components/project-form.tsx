"use client";

import { useActionState, useEffect, useId } from "react";
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
import { Label } from "@/components/ui/label";
import type { ActionResult } from "@/lib/cms/results";
import { NIGERIAN_STATES, PROJECT_STATUS_LABEL } from "../labels";

export type ProjectValues = {
  title: string;
  slug: string;
  company_id: string;
  sector_id: string | null;
  project_status: string;
  summary: string | null;
  description: unknown;
  location_name: string | null;
  state: string | null;
  country: string;
  latitude: number | string | null;
  longitude: number | string | null;
  start_date: string | null;
  end_date: string | null;
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
};

type Option = { id: string; name: string; status: string };

function DateField({ name, label, defaultValue, error, hint }: { name: string; label: string; defaultValue?: string | null; error?: string; hint?: string }) {
  const id = useId();
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={name} type="date" defaultValue={defaultValue ?? ""} aria-invalid={Boolean(error)} className="bg-white" />
      {error || hint ? <p className={error ? "text-xs text-destructive" : "text-xs text-muted-foreground"}>{error ?? hint}</p> : null}
    </div>
  );
}

export function ProjectForm({
  action,
  project,
  companies,
  sectors,
  cover = null,
  defaultCompanyId,
}: {
  action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
  project?: ProjectValues;
  companies: Option[];
  sectors: Option[];
  cover?: PickedMedia | null;
  defaultCompanyId?: string;
}) {
  const [result, formAction] = useActionState(action, null);
  const router = useRouter();
  const errors = result && !result.ok ? (result.fieldErrors ?? {}) : {};
  const stateId = useId();

  useEffect(() => {
    if (!result) return;
    if (result.ok) {
      toast.success(result.message ?? "Saved.");
      router.refresh();
    } else toast.error(result.error);
  }, [result, router]);

  // Archived choices aren't offered, except the ones already chosen.
  const offer = (list: Option[], current?: string | null) =>
    list
      .filter((c) => c.status !== "archived" || c.id === current)
      .map((c) => ({ value: c.id, label: `${c.name}${c.status === "archived" ? " (archived)" : ""}` }));

  return (
    <ActionForm action={formAction} className="space-y-6" noValidate>
      {result && !result.ok && !result.fieldErrors ? <FormAlert error={result.error} /> : null}

      <Panel title="The project">
        <NameAndSlugFields
          nameField="title"
          nameLabel="Project name"
          defaultName={project?.title}
          defaultSlug={project?.slug}
          nameError={errors.title}
          slugError={errors.slug}
          urlPrefix="/projects/"
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            name="company_id"
            label="Business behind the project"
            required
            placeholder="Choose…"
            options={offer(companies, project?.company_id)}
            defaultValue={project?.company_id ?? defaultCompanyId ?? ""}
            error={errors.company_id}
            hint={companies.length ? undefined : "Add the business under Companies first."}
          />
          <SelectField
            name="sector_id"
            label="Sector (optional)"
            placeholder="None"
            options={offer(sectors, project?.sector_id)}
            defaultValue={project?.sector_id ?? ""}
            error={errors.sector_id}
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <SelectField
            name="project_status"
            label="Stage"
            options={Object.entries(PROJECT_STATUS_LABEL).map(([value, label]) => ({ value, label }))}
            defaultValue={project?.project_status ?? "planned"}
            error={errors.project_status}
          />
          <DateField name="start_date" label="Start date (optional)" defaultValue={project?.start_date} error={errors.start_date} hint="Only if confirmed." />
          <DateField name="end_date" label="End date (optional)" defaultValue={project?.end_date} error={errors.end_date} hint="Completion or expected completion." />
        </div>
      </Panel>

      <Panel title="Description">
        <TextAreaField
          name="summary"
          label="Summary"
          hint="One or two sentences for lists and cards."
          maxLength={400}
          rows={3}
          defaultValue={project?.summary}
          error={errors.summary}
        />
        <RichTextEditor
          name="description"
          label="Full description"
          defaultValue={project?.description ?? undefined}
          error={errors.description}
        />
      </Panel>

      <Panel title="Location" description="Where the project is. The map position is optional and used later for the website's project map.">
        <TextField
          name="location_name"
          label="Place (optional)"
          hint="e.g. a town, site or facility name."
          maxLength={200}
          defaultValue={project?.location_name}
          error={errors.location_name}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={stateId}>State (optional)</Label>
            <Input id={stateId} name="state" list={`${stateId}-list`} defaultValue={project?.state ?? ""} maxLength={100} className="bg-white" />
            <datalist id={`${stateId}-list`}>
              {NIGERIAN_STATES.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
            <p className={errors.state ? "text-xs text-destructive" : "text-xs text-muted-foreground"}>
              {errors.state ?? "Pick a Nigerian state or type another region."}
            </p>
          </div>
          <TextField name="country" label="Country" required maxLength={100} defaultValue={project?.country ?? "Nigeria"} error={errors.country} />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            name="latitude"
            label="Latitude (optional)"
            hint="e.g. 12.002179"
            defaultValue={project?.latitude === null || project?.latitude === undefined ? "" : String(Number(project.latitude))}
            error={errors.latitude}
          />
          <TextField
            name="longitude"
            label="Longitude (optional)"
            hint="e.g. 8.591956"
            defaultValue={project?.longitude === null || project?.longitude === undefined ? "" : String(Number(project.longitude))}
            error={errors.longitude}
          />
        </div>
      </Panel>

      <Panel title="Image">
        <MediaPicker name="cover_media_id" label="Cover image" hint="Shown at the top of the project's page and on cards." initial={cover} error={errors.cover_media_id} />
      </Panel>

      <Panel title="Display and search engines">
        <TextField name="sort_order" label="Display order" type="number" defaultValue={project?.sort_order ?? 0} error={errors.sort_order} hint="Lower numbers appear first." />
        <TextField name="seo_title" label="SEO title" maxLength={70} defaultValue={project?.seo_title} error={errors.seo_title} />
        <TextAreaField name="seo_description" label="SEO description" maxLength={160} rows={2} defaultValue={project?.seo_description} error={errors.seo_description} />
      </Panel>

      <div className="flex items-center gap-3">
        <SubmitButton pendingText="Saving…" className="w-auto px-6">
          {project ? "Save changes" : "Create project"}
        </SubmitButton>
        <Button asChild variant="ghost">
          <Link href="/admin/projects">Cancel</Link>
        </Button>
      </div>
    </ActionForm>
  );
}
