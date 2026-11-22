"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useActionFormPending } from "@/components/cms/action-form";

/** A submit button that shows a spinner and blocks double-clicks while saving. */
export function SubmitButton({
  children,
  pendingText,
  className,
}: {
  children: React.ReactNode;
  pendingText: string;
  className?: string;
}) {
  // Works inside a plain form and inside ActionForm.
  const status = useFormStatus();
  const actionFormPending = useActionFormPending();
  const pending = status.pending || actionFormPending;
  return (
    <Button type="submit" disabled={pending} aria-disabled={pending} className={cn("w-full", className)}>
      {pending ? (
        <>
          <Loader2 className="animate-spin" aria-hidden />
          {pendingText}
        </>
      ) : (
        children
      )}
    </Button>
  );
}

/** An error or confirmation message, announced to screen readers. */
export function FormAlert({ error, message }: { error?: string; message?: string }) {
  if (!error && !message) return null;
  return (
    <p
      role={error ? "alert" : "status"}
      className={cn(
        "border-l-2 px-3 py-2 text-sm leading-relaxed",
        error ? "border-destructive bg-destructive/5 text-destructive" : "border-teal bg-teal/5 text-teal",
      )}
    >
      {error ?? message}
    </p>
  );
}
