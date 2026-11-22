import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ExternalLink, FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel } from "@/components/cms/page-parts";
import { ConfirmAction } from "@/components/cms/confirm-action";
import { CopyField } from "@/components/cms/copy-field";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/cms/status";
import { BUCKET_LABEL, CATEGORY_LABEL, formatBytes, isImage } from "@/lib/media/rules";
import { getMedia, mediaUsage } from "@/features/media/queries";
import { deleteMedia, updateMediaDetails } from "@/features/media/actions";
import { MediaDetailsForm } from "@/features/media/components/media-details-form";

export const metadata: Metadata = { title: "File details" };

export default function MediaItemPage({ params }: PageProps<"/admin/media/[id]">) {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
      <Item params={params} />
    </Suspense>
  );
}

async function Item({ params }: { params: PageProps<"/admin/media/[id]">["params"] }) {
  const { id } = await params;
  const media = await getMedia(id);
  if (!media) notFound();

  const image = isImage(media.mime_type);
  // Private files open through a link that expires after 1 hour.
  let openUrl = media.previewUrl;
  if (media.bucket === "private-files") {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.storage.from("private-files").createSignedUrl(media.path, 3600);
    openUrl = data?.signedUrl ?? null;
  }
  const uses = await mediaUsage(media.id);

  return (
    <>
      <PageHeader title={media.file_name} breadcrumb={{ href: "/admin/media", label: "Media library" }} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">
          <div className="flex min-h-64 items-center justify-center border border-border bg-white p-4">
            {image && media.previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={media.previewUrl} alt={media.alt_text ?? ""} className="max-h-[28rem] w-auto object-contain" />
            ) : (
              <FileText className="size-16 text-steel" aria-hidden />
            )}
          </div>
          <Panel title="Details">
            <MediaDetailsForm action={updateMediaDetails.bind(null, media.id)} media={media} image={image} />
          </Panel>
        </div>

        <aside className="space-y-6">
          <section className="border border-border bg-white px-5 py-4 text-sm">
            <dl className="space-y-2">
              <Row label="Visibility" value={BUCKET_LABEL[media.bucket]} />
              <Row label="Type" value={`${CATEGORY_LABEL[media.category]} · ${media.mime_type.split("/")[1]?.toUpperCase().slice(0, 12)}`} />
              <Row label="Size" value={formatBytes(media.size_bytes)} />
              {media.width && media.height ? <Row label="Dimensions" value={`${media.width} × ${media.height} px`} /> : null}
              <Row label="Uploaded" value={formatDateTime(media.created_at)} />
            </dl>
            {openUrl ? (
              <Button asChild variant="outline" size="sm" className="mt-4 w-full">
                <a href={openUrl} target="_blank" rel="noreferrer">
                  <ExternalLink aria-hidden />
                  Open file
                </a>
              </Button>
            ) : null}
          </section>

          {media.bucket === "public-media" && media.previewUrl ? (
            <section className="space-y-2 border border-border bg-white px-5 py-4">
              <h2 className="font-sans text-sm font-semibold text-graphite">Public address</h2>
              <CopyField value={media.previewUrl} label="Public address of this file" />
            </section>
          ) : null}

          <section className="border border-border bg-white">
            <h2 className="border-b border-border px-5 py-4 font-sans text-sm font-semibold text-graphite">Where it&apos;s used</h2>
            {uses.length === 0 ? (
              <p className="px-5 py-4 text-sm text-muted-foreground">Not used anywhere yet.</p>
            ) : (
              <ul className="divide-y divide-border text-sm">
                {uses.map((u, i) => (
                  <li key={i} className="px-5 py-3">
                    <span className="block text-xs text-muted-foreground">{u.where}</span>
                    {u.href ? (
                      <Link href={u.href} className="text-indigo hover:underline">
                        {u.name}
                      </Link>
                    ) : (
                      <span className="text-graphite">{u.name}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="border border-border bg-white px-5 py-4">
            {uses.length ? (
              <p className="text-xs text-muted-foreground">
                This file can&apos;t be deleted while it&apos;s in use. Remove it from the places listed above first.
              </p>
            ) : (
              <ConfirmAction
                action={deleteMedia.bind(null, media.id)}
                label="Delete file"
                icon={<Trash2 aria-hidden />}
                variant="destructive"
                successMessage="Deleted."
                confirm={{
                  title: `Delete "${media.file_name}"?`,
                  description: "The file is removed from the library and from storage. This cannot be undone.",
                  confirmLabel: "Delete permanently",
                  destructive: true,
                }}
              />
            )}
          </section>
        </aside>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right text-graphite">{value}</dd>
    </div>
  );
}
