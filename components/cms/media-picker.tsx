"use client";

import { useCallback, useEffect, useId, useState, useTransition } from "react";
import { FileText, ImageIcon, Lock, Loader2, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { pickerSearch } from "@/features/media/actions";
import { Uploader } from "@/features/media/components/uploader";
import { cn } from "@/lib/utils";

export type PickedMedia = {
  id: string;
  file_name: string;
  alt_text: string | null;
  previewUrl: string | null;
  bucket?: string;
  mime_type?: string;
};

/**
 * "Choose image" field for forms. Saves the chosen file's id in a hidden
 * field called `name`. Offers images from the public part of the library,
 * plus uploading a new one on the spot.
 */
export function MediaPicker({
  name,
  label,
  hint,
  initial,
  error,
}: {
  name: string;
  label: string;
  hint?: string;
  initial: PickedMedia | null;
  error?: string;
}) {
  const [selected, setSelected] = useState<PickedMedia | null>(initial);
  const [open, setOpen] = useState(false);
  const labelId = useId();

  return (
    <div className="space-y-2" role="group" aria-labelledby={labelId}>
      <p id={labelId} className="text-sm leading-none font-medium select-none">
        {label}
      </p>
      <input type="hidden" name={name} value={selected?.id ?? ""} />
      <div className="flex items-center gap-4 border border-input bg-white p-3">
        <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden border border-border bg-ivory/60">
          {selected?.previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={selected.previewUrl} alt={selected.alt_text ?? ""} className="h-full w-full object-contain" />
          ) : (
            <ImageIcon className="size-6 text-steel" aria-hidden />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-graphite">{selected ? selected.file_name : "No image chosen"}</p>
          <div className="mt-2 flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(true)}
              aria-label={`${selected ? "Change" : "Choose image"}: ${label}`}
            >
              {selected ? "Change" : "Choose image"}
            </Button>
            {selected ? (
              <Button type="button" variant="ghost" size="sm" onClick={() => setSelected(null)} aria-label={`Remove: ${label}`}>
                <X aria-hidden />
                Remove
              </Button>
            ) : null}
          </div>
        </div>
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}

      <PickerDialog
        open={open}
        onOpenChange={setOpen}
        onPick={(m) => {
          setSelected(m);
          setOpen(false);
        }}
        title={label}
        kind="image"
      />
    </div>
  );
}

/** The library dialog, for images or for documents. Also used by galleries. */
export function PickerDialog({
  open,
  onOpenChange,
  onPick,
  title,
  kind,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onPick: (m: PickedMedia) => void;
  title: string;
  kind: "image" | "document";
}) {
  const noun = kind === "image" ? "image" : "document";
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<PickedMedia[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, startLoading] = useTransition();

  const load = useCallback(
    (search: string, p: number, autoPickId?: string) =>
      startLoading(async () => {
        const res = await pickerSearch(search, p, kind);
        setItems(res.items);
        setTotal(res.total);
        if (autoPickId) {
          const found = res.items.find((i) => i.id === autoPickId);
          if (found) onPick(found);
        }
      }),
    [onPick, kind],
  );

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => load(q.trim(), page), q ? 300 : 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, q, page]);

  const pages = Math.max(1, Math.ceil(total / 12));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-sm sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-indigo">{title}</DialogTitle>
          <DialogDescription>Choose {kind === "image" ? "an image" : "a document"} from the library, or upload a new one.</DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            type="search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder={`Search ${noun}s`}
            aria-label={`Search ${noun}s`}
            className="pl-9"
          />
        </div>

        <div className="relative min-h-40">
          {loading ? (
            <Loader2 className="absolute top-4 right-4 size-4 animate-spin text-muted-foreground" aria-label="Loading" />
          ) : null}
          {items.length === 0 && !loading ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {q ? `No ${noun}s match.` : kind === "image" ? "No public images in the library yet. Upload one below." : "No documents in the library yet. Upload one below."}
            </p>
          ) : (
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {items.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => onPick(m)}
                    className={cn("group block w-full border border-border text-left hover:border-indigo focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none")}
                    aria-label={`Choose ${m.file_name}`}
                  >
                    <span className="flex aspect-square items-center justify-center overflow-hidden bg-ivory/60">
                      {kind === "image" && m.previewUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.previewUrl} alt="" loading="lazy" className="h-full w-full object-contain" />
                      ) : (
                        <FileText className="size-8 text-steel" aria-hidden />
                      )}
                    </span>
                    <span className="flex items-center gap-1 truncate border-t border-border px-2 py-1 text-xs text-graphite">
                      {m.bucket === "private-files" ? <Lock className="size-3 shrink-0" aria-label="Private" /> : null}
                      <span className="truncate">{m.file_name}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {pages > 1 ? (
          <div className="flex items-center justify-end gap-2 text-sm">
            <Button type="button" variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => setPage(page - 1)}>
              Previous
            </Button>
            <span className="text-muted-foreground">
              {page} / {pages}
            </span>
            <Button type="button" variant="outline" size="sm" disabled={page >= pages || loading} onClick={() => setPage(page + 1)}>
              Next
            </Button>
          </div>
        ) : null}

        <div className="border-t border-border pt-4">
          <p className="mb-2 text-sm font-medium text-graphite">Upload a new {noun}</p>
          <Uploader
            compact
            imagesOnly={kind === "image"}
            fixedBucket={kind === "image" ? "public-media" : undefined}
            onUploaded={(newId) => {
              setQ("");
              setPage(1);
              load("", 1, newId);
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
