"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, FileText, Lock, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PickerDialog } from "@/components/cms/media-picker";
import type { ActionResult } from "@/lib/cms/results";

export type AttachmentItem = {
  linkId: string;
  file_name: string;
  bucket: string;
  alt_text: string | null;
  previewUrl: string | null;
};

/**
 * A record's gallery (public images) or supporting documents: add from the
 * library (or upload), put in order, remove. Removing never deletes the file
 * from the library.
 */
export function AttachmentsPanel({
  title,
  description,
  kind,
  items,
  add,
  remove,
  move,
}: {
  title: string;
  description: string;
  kind: "image" | "document";
  items: AttachmentItem[];
  add: (mediaId: string) => Promise<ActionResult>;
  remove: (linkId: string) => Promise<ActionResult>;
  move: (linkId: string, direction: "up" | "down") => Promise<ActionResult>;
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();

  const run = (fn: () => Promise<ActionResult>, quiet = false) =>
    start(async () => {
      const r = await fn();
      if (!r.ok) toast.error(r.error);
      else if (!quiet && r.message) toast.success(r.message);
      router.refresh();
    });

  return (
    <section className="border border-border bg-white" aria-label={title}>
      <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
        <div>
          <h2 className="font-sans text-sm font-semibold text-graphite">{title}</h2>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)} disabled={pending}>
          <Plus aria-hidden />
          {kind === "image" ? "Add image" : "Add document"}
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="px-5 py-6 text-sm text-muted-foreground">
          {kind === "image" ? "No images in the gallery yet." : "No documents attached yet."}
        </p>
      ) : (
        <ol className={kind === "image" ? "grid grid-cols-2 gap-3 p-5 sm:grid-cols-3" : "divide-y divide-border"}>
          {items.map((item, i) => (
            <li
              key={item.linkId}
              className={kind === "image" ? "border border-border" : "flex items-center gap-3 px-5 py-3"}
            >
              {kind === "image" ? (
                <div className="flex aspect-[4/3] items-center justify-center overflow-hidden bg-ivory/60">
                  {item.previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.previewUrl} alt={item.alt_text ?? ""} className="h-full w-full object-cover" />
                  ) : null}
                </div>
              ) : (
                <FileText className="size-5 shrink-0 text-steel" aria-hidden />
              )}
              <div className={kind === "image" ? "flex items-center gap-1 border-t border-border px-2 py-1" : "flex min-w-0 flex-1 items-center gap-1"}>
                <span className="flex min-w-0 flex-1 items-center gap-1 text-xs text-graphite">
                  {item.bucket === "private-files" ? <Lock className="size-3 shrink-0" aria-label="Private" /> : null}
                  <span className="truncate" title={item.file_name}>{item.file_name}</span>
                </span>
                <IconButton label={`Move ${item.file_name} up`} disabled={pending || i === 0} onClick={() => run(() => move(item.linkId, "up"), true)}>
                  <ArrowUp />
                </IconButton>
                <IconButton
                  label={`Move ${item.file_name} down`}
                  disabled={pending || i === items.length - 1}
                  onClick={() => run(() => move(item.linkId, "down"), true)}
                >
                  <ArrowDown />
                </IconButton>
                <IconButton label={`Remove ${item.file_name}`} disabled={pending} onClick={() => run(() => remove(item.linkId))}>
                  <X />
                </IconButton>
              </div>
            </li>
          ))}
        </ol>
      )}

      <PickerDialog
        open={open}
        onOpenChange={setOpen}
        kind={kind}
        title={kind === "image" ? "Add an image to the gallery" : "Attach a document"}
        onPick={(m) => {
          setOpen(false);
          run(() => add(m.id));
        }}
      />
    </section>
  );
}

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex size-7 shrink-0 items-center justify-center text-muted-foreground hover:bg-ivory hover:text-indigo disabled:opacity-30 [&_svg]:size-3.5"
    >
      {children}
    </button>
  );
}
