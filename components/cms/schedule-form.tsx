"use client";

import { useActionState, useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CalendarClock } from "lucide-react";
import { ActionForm } from "@/components/cms/action-form";
import { SubmitButton } from "@/components/cms/form-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ActionResult } from "@/lib/cms/results";

/**
 * "Publish at a chosen time": a future time schedules the record, a past
 * time publishes it with that date. Times are Nigeria time (WAT).
 */
export function ScheduleForm({
  action,
  initial,
  label,
}: {
  action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
  /** "2026-12-01T09:00" in Nigeria time, or "". */
  initial: string;
  label: string;
}) {
  const [result, formAction] = useActionState(action, null);
  // The result showing when the box was opened. The box closes by itself once
  // a newer, successful result arrives; `undefined` means it is closed.
  const [openedWith, setOpenedWith] = useState<ActionResult | null | undefined>(undefined);
  const open = openedWith !== undefined && (result === openedWith || !result?.ok);
  const setOpen = (v: boolean) => setOpenedWith(v ? result : undefined);
  const router = useRouter();
  const id = useId();

  useEffect(() => {
    if (!result) return;
    if (result.ok) {
      toast.success(result.message ?? "Saved.");
      router.refresh();
    } else toast.error(result.error);
  }, [result, router]);

  if (!open) {
    return (
      <Button type="button" variant="ghost" onClick={() => setOpen(true)}>
        <CalendarClock aria-hidden />
        {label}
      </Button>
    );
  }
  return (
    <ActionForm action={formAction} className="space-y-2 border border-border bg-ivory/30 p-3" noValidate>
      <Label htmlFor={id} className="text-xs">
        Publication date and time (Nigeria time)
      </Label>
      <Input id={id} name="publish_at" type="datetime-local" defaultValue={initial} className="bg-white" />
      <p className="text-xs text-muted-foreground">
        A future time schedules it: it appears on the website by itself then. A past time publishes it now with that date.
      </p>
      {result && !result.ok && result !== openedWith ? <p className="text-xs text-destructive">{result.fieldErrors?.publish_at ?? result.error}</p> : null}
      <div className="flex flex-col gap-2">
        <SubmitButton pendingText="Saving…">
          Confirm
        </SubmitButton>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </ActionForm>
  );
}
