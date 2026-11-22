"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, CircleAlert, Loader2, Upload } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import {
  BUCKET_LABEL,
  checkFile,
  defaultCategory,
  formatBytes,
  isImage,
  storagePath,
  type Bucket,
} from "@/lib/media/rules";
import { discardUpload, registerUpload } from "../actions";
import { cn } from "@/lib/utils";

type Item = { key: string; name: string; size: number; state: "waiting" | "uploading" | "done" | "error"; message?: string };

/** Reads an image's width and height in the browser, before uploading. */
async function imageSize(file: File): Promise<{ width: number | null; height: number | null }> {
  if (!isImage(file.type)) return { width: null, height: null };
  try {
    const bmp = await createImageBitmap(file);
    const size = { width: bmp.width, height: bmp.height };
    bmp.close();
    return size;
  } catch {
    return { width: null, height: null };
  }
}

/**
 * Upload one or more files. Each file goes straight from the browser to
 * Supabase Storage (so large files don't pass through the website server),
 * then is registered in the library. If registering fails, the stored file
 * is removed again so nothing is left behind.
 */
export function Uploader({
  onUploaded,
  fixedBucket,
  imagesOnly = false,
  compact = false,
}: {
  onUploaded?: (id: string) => void;
  fixedBucket?: Bucket;
  imagesOnly?: boolean;
  compact?: boolean;
}) {
  const [bucket, setBucket] = useState<Bucket>(fixedBucket ?? "public-media");
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const set = (key: string, patch: Partial<Item>) =>
    setItems((list) => list.map((i) => (i.key === key ? { ...i, ...patch } : i)));

  async function uploadAll(files: File[]) {
    if (!files.length) return;
    setBusy(true);
    const queue = files.map((f, n) => ({ file: f, key: `${Date.now()}-${n}-${f.name}` }));
    setItems((list) => [...queue.map((q) => ({ key: q.key, name: q.file.name, size: q.file.size, state: "waiting" as const })), ...list]);

    const supabase = createSupabaseBrowserClient();
    let ok = 0;
    for (const { file, key } of queue) {
      const problem =
        imagesOnly && !isImage(file.type) ? "Please choose a JPG, PNG or WebP image." : checkFile(bucket, file.type, file.size);
      if (problem) {
        set(key, { state: "error", message: problem });
        continue;
      }
      set(key, { state: "uploading" });
      const category = defaultCategory(file.type);
      const path = storagePath(category, file.type, bucket, crypto.randomUUID(), new Date().getFullYear());
      const { width, height } = await imageSize(file);

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, { contentType: file.type, cacheControl: "31536000", upsert: false });
      if (uploadError) {
        set(key, { state: "error", message: "The upload was refused. Check you're still signed in and try again." });
        continue;
      }

      const result = await registerUpload({
        bucket,
        path,
        file_name: file.name.slice(0, 255),
        mime_type: file.type,
        size_bytes: file.size,
        width,
        height,
        category,
      });
      if (!result.ok || !result.id) {
        await discardUpload(bucket, path);
        set(key, { state: "error", message: result.ok ? "Could not save the file details." : result.error });
        continue;
      }
      set(key, { state: "done" });
      ok += 1;
      onUploaded?.(result.id);
    }
    setBusy(false);
    if (ok) {
      toast.success(ok === 1 ? "File uploaded." : `${ok} files uploaded.`);
      router.refresh();
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-4">
      {!fixedBucket ? (
        <fieldset className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <legend className="sr-only">Who can see the uploaded files</legend>
          {(["public-media", "private-files"] as const).map((b) => (
            <label key={b} className="flex items-center gap-2">
              <input type="radio" name="bucket" value={b} checked={bucket === b} onChange={() => setBucket(b)} disabled={busy} />
              {BUCKET_LABEL[b]}
            </label>
          ))}
        </fieldset>
      ) : null}

      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!busy) uploadAll(Array.from(e.dataTransfer.files));
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center border border-dashed bg-white text-center transition-colors",
          compact ? "px-4 py-6" : "px-6 py-10",
          dragging ? "border-copper bg-copper/5" : "border-steel hover:border-indigo",
          busy && "pointer-events-none opacity-60",
        )}
      >
        <Upload className="size-6 text-steel" aria-hidden />
        <span className="mt-2 text-sm font-medium text-graphite">Drop files here or click to choose</span>
        <span className="mt-1 text-xs text-muted-foreground">
          {imagesOnly
            ? "JPG, PNG or WebP, up to 10 MB"
            : bucket === "public-media"
              ? "JPG, PNG, WebP up to 10 MB · PDF up to 25 MB"
              : "Images up to 10 MB · PDF, Word, Excel up to 25 MB"}
        </span>
        <input
          ref={inputRef}
          type="file"
          multiple={!compact}
          className="sr-only"
          aria-label="Choose files to upload"
          accept={imagesOnly ? "image/jpeg,image/png,image/webp" : undefined}
          disabled={busy}
          onChange={(e) => uploadAll(Array.from(e.target.files ?? []))}
        />
      </label>

      {items.length ? (
        <ul className="divide-y divide-border border border-border bg-white text-sm" aria-live="polite">
          {items.map((i) => (
            <li key={i.key} className="flex items-start gap-3 px-4 py-2">
              {i.state === "done" ? (
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-teal" aria-label="Uploaded" />
              ) : i.state === "error" ? (
                <CircleAlert className="mt-0.5 size-4 shrink-0 text-destructive" aria-label="Failed" />
              ) : (
                <Loader2 className="mt-0.5 size-4 shrink-0 animate-spin text-muted-foreground" aria-label="Uploading" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-graphite">{i.name}</p>
                <p className={cn("text-xs", i.state === "error" ? "text-destructive" : "text-muted-foreground")}>
                  {i.state === "error" ? i.message : `${formatBytes(i.size)} · ${i.state === "done" ? "uploaded" : i.state}`}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
