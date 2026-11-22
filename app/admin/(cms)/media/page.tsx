import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { FileText, ImageIcon, Lock, SearchX } from "lucide-react";
import { ListToolbar } from "@/components/cms/list-toolbar";
import { EmptyState, PageHeader, Pagination, Panel, TableSkeleton } from "@/components/cms/page-parts";
import { parseListParams } from "@/lib/cms/list";
import { CATEGORY_LABEL, formatBytes, isImage } from "@/lib/media/rules";
import { requireAdmin } from "@/lib/auth/admin";
import { listMedia, MEDIA_LIST } from "@/features/media/queries";
import { Uploader } from "@/features/media/components/uploader";

export const metadata: Metadata = { title: "Media library" };

const PATH = "/admin/media";

export default function MediaPage({ searchParams }: PageProps<"/admin/media">) {
  return (
    <>
      <PageHeader
        title="Media library"
        description="Logos, photographs and documents. Public files can appear on the website; private files are only visible to administrators."
      />
      <div className="mb-8">
        <Panel title="Upload files" description="Every file gets a unique stored name, so uploads never overwrite each other.">
          <Suspense fallback={<div className="h-32" />}>
            <UploaderGate />
          </Suspense>
        </Panel>
      </div>
      <Suspense>
        <ListToolbar
          searchPlaceholder="Search by file name, alt text or caption"
          filters={[
            {
              name: "category",
              label: "Type",
              options: Object.entries(CATEGORY_LABEL).map(([value, label]) => ({ value, label })),
            },
            {
              name: "bucket",
              label: "Visibility",
              options: [
                { value: "public-media", label: "Public" },
                { value: "private-files", label: "Private" },
              ],
            },
          ]}
        />
      </Suspense>
      <Suspense fallback={<TableSkeleton />}>
        <MediaGrid searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function UploaderGate() {
  await requireAdmin();
  return <Uploader />;
}

async function MediaGrid({ searchParams }: { searchParams: PageProps<"/admin/media">["searchParams"] }) {
  const params = parseListParams(await searchParams, MEDIA_LIST);
  const { rows, total } = await listMedia(params);

  if (rows.length === 0) {
    return params.q || Object.keys(params.filters).length ? (
      <EmptyState icon={SearchX} title="No files match" description="Try a different search or filter." />
    ) : (
      <EmptyState icon={ImageIcon} title="No files yet" description="Upload logos, photographs and documents above." />
    );
  }

  return (
    <>
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {rows.map((m) => (
          <li key={m.id}>
            <Link href={`${PATH}/${m.id}`} className="group block border border-border bg-white hover:border-indigo">
              <div className="flex aspect-[4/3] items-center justify-center overflow-hidden bg-ivory/60">
                {m.previewUrl && isImage(m.mime_type) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.previewUrl} alt={m.alt_text ?? ""} loading="lazy" className="h-full w-full object-contain" />
                ) : (
                  <FileText className="size-10 text-steel" aria-hidden />
                )}
              </div>
              <div className="border-t border-border px-3 py-2">
                <p className="truncate text-sm font-medium text-graphite group-hover:text-indigo" title={m.file_name}>
                  {m.file_name}
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  {m.bucket === "private-files" ? <Lock className="size-3" aria-label="Private" /> : null}
                  {CATEGORY_LABEL[m.category]} · {formatBytes(m.size_bytes)}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <Pagination pathname={PATH} params={params} total={total} />
    </>
  );
}
