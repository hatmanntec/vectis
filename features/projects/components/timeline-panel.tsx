"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, CalendarArrowDown, Pencil, Plus, Trash2 } from "lucide-react";
import { ActionForm } from "@/components/cms/action-form";
import { TextAreaField, TextField } from "@/components/cms/fields";
import { SubmitButton } from "@/components/cms/form-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDate } from "@/lib/cms/status";
import type { ActionResult } from "@/lib/cms/results";

export type Milestone = {
  id: string;
  title: string;
  description: string | null;
  milestone_date: string | null;
};

type FormAction = (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;

/** The fields of one timeline entry, used for adding and editing. */
function MilestoneForm({
  action,
  values,
  submitLabel,
  onDone,
  onCancel,
}: {
  action: FormAction;
  values?: Milestone;
  submitLabel: string;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [result, formAction] = useActionState(action, null);
  const router = useRouter();
  const errors = result && !result.ok ? (result.fieldErrors ?? {}) : {};
  // Kept in a ref so the effect below runs once per result, not on every render.
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  });

  useEffect(() => {
    if (!result) return;
    if (result.ok) {
      toast.success(result.message ?? "Saved.");
      router.refresh();
      done.current();
    } else toast.error(result.error);
  }, [result, router]);

  return (
    <ActionForm action={formAction} className="space-y-4 border border-border bg-ivory/30 p-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_11rem]">
        <TextField name="title" label="What happened or will happen" required maxLength={200} defaultValue={values?.title} error={errors.title} />
        <div className="space-y-2">
          <Label htmlFor={`${values?.id ?? "new"}-date`}>Date (optional)</Label>
          <Input
            id={`${values?.id ?? "new"}-date`}
            name="milestone_date"
            type="date"
            defaultValue={values?.milestone_date ?? ""}
            aria-invalid={Boolean(errors.milestone_date)}
            className="bg-white"
          />
          {errors.milestone_date ? <p className="text-xs text-destructive">{errors.milestone_date}</p> : null}
        </div>
      </div>
      <TextAreaField name="description" label="Details (optional)" maxLength={2000} rows={2} defaultValue={values?.description} error={errors.description} />
      <div className="flex items-center gap-2">
        <SubmitButton pendingText="Saving…" className="w-auto px-5">
          {submitLabel}
        </SubmitButton>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </ActionForm>
  );
}

/**
 * The project's timeline: entries in order, each editable in place,
 * movable up and down, and removable (after a confirmation).
 */
export function TimelinePanel({
  items,
  add,
  update,
  remove,
  move,
  sortByDate,
}: {
  items: Milestone[];
  add: FormAction;
  update: (id: string, prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
  remove: (id: string) => Promise<ActionResult>;
  move: (id: string, direction: "up" | "down") => Promise<ActionResult>;
  sortByDate: () => Promise<ActionResult>;
}) {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [removing, setRemoving] = useState<Milestone | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  const run = (fn: () => Promise<ActionResult>, success?: string) =>
    start(async () => {
      const r = await fn();
      if (!r.ok) toast.error(r.error);
      else if (success ?? r.message) toast.success(success ?? r.message!);
      router.refresh();
    });

  return (
    <section className="border border-border bg-white" aria-label="Timeline">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h2 className="font-sans text-sm font-semibold text-graphite">Timeline</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Key stages shown on the project&apos;s page, in this order. Shown whenever the project is.
          </p>
        </div>
        <div className="flex gap-2">
          {items.length > 1 ? (
            <Button type="button" variant="ghost" size="sm" disabled={pending} onClick={() => run(sortByDate)}>
              <CalendarArrowDown aria-hidden />
              Date order
            </Button>
          ) : null}
          {!adding ? (
            <Button type="button" variant="outline" size="sm" onClick={() => { setAdding(true); setEditing(null); }}>
              <Plus aria-hidden />
              Add to timeline
            </Button>
          ) : null}
        </div>
      </div>

      <div className="space-y-3 px-5 py-5">
        {items.length === 0 && !adding ? <p className="text-sm text-muted-foreground">No timeline entries yet.</p> : null}
        {items.length ? (
          <ol className="space-y-3">
            {items.map((m, i) =>
              editing === m.id ? (
                <li key={m.id}>
                  <MilestoneForm
                    action={update.bind(null, m.id)}
                    values={m}
                    submitLabel="Save entry"
                    onDone={() => setEditing(null)}
                    onCancel={() => setEditing(null)}
                  />
                </li>
              ) : (
                <li key={m.id} className="flex items-start gap-3 border-l-2 border-copper/60 pl-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-copper">{m.milestone_date ? formatDate(m.milestone_date) : "No date"}</p>
                    <p className="text-sm font-medium text-graphite">{m.title}</p>
                    {m.description ? <p className="mt-0.5 text-xs whitespace-pre-line text-muted-foreground">{m.description}</p> : null}
                  </div>
                  <div className="flex shrink-0 items-center">
                    <Button type="button" variant="ghost" size="icon" aria-label={`Move "${m.title}" up`} disabled={pending || i === 0} onClick={() => run(() => move(m.id, "up"))}>
                      <ArrowUp aria-hidden />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" aria-label={`Move "${m.title}" down`} disabled={pending || i === items.length - 1} onClick={() => run(() => move(m.id, "down"))}>
                      <ArrowDown aria-hidden />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" aria-label={`Edit "${m.title}"`} onClick={() => { setEditing(m.id); setAdding(false); }}>
                      <Pencil aria-hidden />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" aria-label={`Remove "${m.title}"`} disabled={pending} onClick={() => setRemoving(m)}>
                      <Trash2 aria-hidden />
                    </Button>
                  </div>
                </li>
              ),
            )}
          </ol>
        ) : null}
        {adding ? (
          <MilestoneForm action={add} submitLabel="Add entry" onDone={() => setAdding(false)} onCancel={() => setAdding(false)} />
        ) : null}
      </div>

      <AlertDialog open={removing !== null} onOpenChange={(o) => !o && setRemoving(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this timeline entry?</AlertDialogTitle>
            <AlertDialogDescription>&ldquo;{removing?.title}&rdquo; will be removed from the project&apos;s timeline.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const m = removing;
                setRemoving(null);
                if (m) run(() => remove(m.id), "Timeline entry removed.");
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
