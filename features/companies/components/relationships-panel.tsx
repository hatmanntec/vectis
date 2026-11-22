"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/cms/form-bits";
import { ConfirmAction } from "@/components/cms/confirm-action";
import { formatDate } from "@/lib/cms/status";
import type { ActionResult } from "@/lib/cms/results";
import { RELATIONSHIP_LABEL, type RelationshipType } from "../labels";
import { ActionForm } from "@/components/cms/action-form";

type Rel = {
  id: string;
  otherId: string;
  otherName: string;
  type: RelationshipType;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  visible: boolean;
};

/**
 * Links between this company and others that are NOT investments and NOT
 * ownership: strategic partners, joint ventures, affiliates.
 */
export function RelationshipsPanel({
  relationships,
  companies,
  add,
  setVisible,
  remove,
}: {
  relationships: Rel[];
  companies: { id: string; name: string }[];
  add: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
  setVisible: (id: string, visible: boolean) => Promise<ActionResult>;
  remove: (id: string) => Promise<ActionResult>;
}) {
  const [adding, setAdding] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [result, formAction] = useActionState(async (prev: ActionResult | null, formData: FormData) => {
    const r = await add(prev, formData);
    if (r.ok) {
      toast.success(r.message ?? "Saved.");
      formRef.current?.reset();
      setAdding(false);
      router.refresh();
    } else toast.error(r.error);
    return r;
  }, null);
  const errors = result && !result.ok ? (result.fieldErrors ?? {}) : {};

  const run = (fn: () => Promise<ActionResult>) =>
    start(async () => {
      const r = await fn();
      if (r.ok) toast.success(r.message ?? "Done.");
      else toast.error(r.error);
      router.refresh();
    });

  return (
    <section className="border border-border bg-white" aria-label="Links with other companies">
      <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
        <div>
          <h2 className="font-sans text-sm font-semibold text-graphite">Links with other companies</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Partnerships and joint ventures. These never mean ownership; investments are recorded separately.
          </p>
        </div>
        {!adding ? (
          <Button type="button" variant="outline" size="sm" onClick={() => setAdding(true)}>
            <Plus aria-hidden />
            Add link
          </Button>
        ) : null}
      </div>

      {relationships.length === 0 && !adding ? (
        <p className="px-5 py-6 text-sm text-muted-foreground">No links recorded.</p>
      ) : null}

      {relationships.length ? (
        <ul className="divide-y divide-border">
          {relationships.map((r) => (
            <li key={r.id} className="flex flex-wrap items-start gap-3 px-5 py-3 text-sm">
              <div className="min-w-0 flex-1">
                <p>
                  <span className="text-muted-foreground">{RELATIONSHIP_LABEL[r.type]}:</span>{" "}
                  <Link href={`/admin/companies/${r.otherId}`} className="font-medium text-indigo hover:underline">
                    {r.otherName}
                  </Link>
                </p>
                {r.description ? <p className="mt-0.5 text-xs text-muted-foreground">{r.description}</p> : null}
                {r.start_date || r.end_date ? (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {r.start_date ? `From ${formatDate(r.start_date)}` : ""}
                    {r.end_date ? ` until ${formatDate(r.end_date)}` : ""}
                  </p>
                ) : null}
              </div>
              <span className={r.visible ? "text-xs text-teal" : "text-xs text-muted-foreground"}>
                {r.visible ? "Shown on website" : "Hidden"}
              </span>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={pending}
                  onClick={() => run(() => setVisible(r.id, !r.visible))}
                  aria-label={r.visible ? `Hide the link with ${r.otherName}` : `Show the link with ${r.otherName}`}
                >
                  {r.visible ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
                  {r.visible ? "Hide" : "Show"}
                </Button>
                <ConfirmAction
                  action={() => remove(r.id)}
                  label="Remove"
                  icon={<X aria-hidden />}
                  variant="ghost"
                  successMessage="Link removed."
                  confirm={{
                    title: `Remove the link with ${r.otherName}?`,
                    description: "Only the link is removed. Both companies stay exactly as they are.",
                    confirmLabel: "Remove link",
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {adding ? (
        <ActionForm ref={formRef} action={formAction} className="space-y-4 border-t border-border bg-ivory/30 px-5 py-5" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="rel-company">Other company</Label>
              <select id="rel-company" name="to_company_id" defaultValue="" className="h-9 w-full border border-input bg-white px-3 text-sm">
                <option value="" disabled>
                  Choose…
                </option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.to_company_id ? <p className="text-xs text-destructive">{errors.to_company_id}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="rel-type">Type of link</Label>
              <select id="rel-type" name="relationship_type" defaultValue="" className="h-9 w-full border border-input bg-white px-3 text-sm">
                <option value="" disabled>
                  Choose…
                </option>
                {Object.entries(RELATIONSHIP_LABEL).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
              {errors.relationship_type ? <p className="text-xs text-destructive">{errors.relationship_type}</p> : null}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="rel-description">Short description (optional)</Label>
            <Textarea id="rel-description" name="description" rows={2} maxLength={1000} className="bg-white" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="rel-start">Start date (optional)</Label>
              <Input id="rel-start" name="start_date" type="date" className="bg-white" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rel-end">End date (optional)</Label>
              <Input id="rel-end" name="end_date" type="date" className="bg-white" />
              {errors.end_date ? <p className="text-xs text-destructive">{errors.end_date}</p> : null}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="visible" />
            Show this link on the website (only once both companies are published)
          </label>
          <div className="flex gap-2">
            <SubmitButton pendingText="Adding…" className="w-auto px-5">
              Add link
            </SubmitButton>
            <Button type="button" variant="ghost" onClick={() => setAdding(false)}>
              Cancel
            </Button>
          </div>
        </ActionForm>
      ) : null}
    </section>
  );
}
