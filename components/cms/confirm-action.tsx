"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/lib/cms/results";

/**
 * A button that runs a server action, optionally after a "Are you sure?"
 * dialog. Shows a notification with the result and refreshes the page.
 */
export function ConfirmAction({
  action,
  label,
  icon,
  variant = "outline",
  confirm,
  successMessage,
}: {
  action: () => Promise<ActionResult>;
  label: string;
  icon?: React.ReactNode;
  variant?: "default" | "outline" | "destructive" | "secondary" | "ghost";
  /** Leave out to run immediately without a dialog. */
  confirm?: { title: string; description: string; confirmLabel: string; destructive?: boolean };
  successMessage: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function run() {
    startTransition(async () => {
      const result = await action();
      setOpen(false);
      if (result.ok) {
        // The button knows what the administrator just did, so its wording wins.
        toast.success(successMessage);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  const button = (
    <Button type="button" variant={variant} size="sm" disabled={pending} onClick={confirm ? undefined : run}>
      {pending ? <Loader2 className="animate-spin" aria-hidden /> : icon}
      {label}
    </Button>
  );

  if (!confirm) return button;

  return (
    <AlertDialog open={open} onOpenChange={(o) => !pending && setOpen(o)}>
      <AlertDialogTrigger asChild>{button}</AlertDialogTrigger>
      <AlertDialogContent className="rounded-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-serif text-xl text-indigo">{confirm.title}</AlertDialogTitle>
          <AlertDialogDescription>{confirm.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={pending}
            onClick={(e) => {
              e.preventDefault(); // keep the dialog open until the action finishes
              run();
            }}
            className={confirm.destructive ? "bg-destructive text-white hover:bg-destructive/90" : undefined}
          >
            {pending ? <Loader2 className="animate-spin" aria-hidden /> : null}
            {confirm.confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
