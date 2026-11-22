import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Archive, ArchiveRestore, EyeOff, Send, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/cms/page-parts";
import { StatusBadge } from "@/components/cms/status-badge";
import { ConfirmAction } from "@/components/cms/confirm-action";
import { formatDateTime } from "@/lib/cms/status";
import { getSector, sectorUsage } from "@/features/sectors/queries";
import { deleteSector, setSectorStatus, updateSector } from "@/features/sectors/actions";
import { SectorForm } from "@/features/sectors/components/sector-form";
import { getMediaByIds } from "@/features/media/queries";

export const metadata: Metadata = { title: "Edit sector" };

export default function EditSectorPage({ params }: PageProps<"/admin/sectors/[id]">) {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
      <Editor params={params} />
    </Suspense>
  );
}

async function Editor({ params }: { params: PageProps<"/admin/sectors/[id]">["params"] }) {
  const { id } = await params;
  const sector = await getSector(id);
  if (!sector) notFound();
  const coverMedia = (await getMediaByIds([sector.cover_media_id])).get(sector.cover_media_id ?? "");
  const cover = coverMedia
    ? { id: coverMedia.id, file_name: coverMedia.file_name, alt_text: coverMedia.alt_text, previewUrl: coverMedia.previewUrl }
    : null;

  return (
    <>
      <PageHeader
        title={sector.name}
        breadcrumb={{ href: "/admin/sectors", label: "Sectors" }}
        actions={<StatusBadge status={sector.status} publishedAt={sector.published_at} />}
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <SectorForm action={updateSector.bind(null, sector.id)} sector={sector} cover={cover} />

        <aside className="space-y-6">
          <section className="border border-border bg-white">
            <h2 className="border-b border-border px-5 py-4 font-sans text-sm font-semibold text-graphite">Publishing</h2>
            <div className="flex flex-col gap-2 px-5 py-5 [&_button]:w-full [&_button]:justify-start">
              {sector.status === "draft" ? (
                <ConfirmAction
                  action={setSectorStatus.bind(null, sector.id, "published")}
                  label="Publish"
                  icon={<Send aria-hidden />}
                  variant="default"
                  successMessage="Published."
                />
              ) : null}
              {sector.status === "published" ? (
                <ConfirmAction
                  action={setSectorStatus.bind(null, sector.id, "draft")}
                  label="Unpublish"
                  icon={<EyeOff aria-hidden />}
                  successMessage="Moved back to draft."
                  confirm={{
                    title: "Unpublish this sector?",
                    description: "It will disappear from the website until you publish it again.",
                    confirmLabel: "Unpublish",
                  }}
                />
              ) : null}
              {sector.status !== "archived" ? (
                <ConfirmAction
                  action={setSectorStatus.bind(null, sector.id, "archived")}
                  label="Archive"
                  icon={<Archive aria-hidden />}
                  successMessage="Archived."
                  confirm={{
                    title: "Archive this sector?",
                    description: "It will be hidden everywhere. You can restore it later from the Archived filter.",
                    confirmLabel: "Archive",
                  }}
                />
              ) : (
                <>
                  <ConfirmAction
                    action={setSectorStatus.bind(null, sector.id, "draft")}
                    label="Restore as draft"
                    icon={<ArchiveRestore aria-hidden />}
                    successMessage="Restored as a draft."
                  />
                  <Suspense>
                    <DeleteButton id={sector.id} name={sector.name} />
                  </Suspense>
                </>
              )}
            </div>
          </section>

          <section className="border border-border bg-white px-5 py-4 text-xs text-muted-foreground">
            <dl className="space-y-2">
              <div className="flex justify-between gap-2"><dt>Created</dt><dd>{formatDateTime(sector.created_at)}</dd></div>
              <div className="flex justify-between gap-2"><dt>Last changed</dt><dd>{formatDateTime(sector.updated_at)}</dd></div>
              <div className="flex justify-between gap-2"><dt>Published</dt><dd>{formatDateTime(sector.published_at)}</dd></div>
              {sector.archived_at ? (
                <div className="flex justify-between gap-2"><dt>Archived</dt><dd>{formatDateTime(sector.archived_at)}</dd></div>
              ) : null}
            </dl>
          </section>
        </aside>
      </div>
    </>
  );
}

async function DeleteButton({ id, name }: { id: string; name: string }) {
  const usage = await sectorUsage(id);
  const inUse =
    usage.companies + usage.projects > 0
      ? ` It is currently linked to ${usage.companies} compan${usage.companies === 1 ? "y" : "ies"} and ${usage.projects} project${usage.projects === 1 ? "" : "s"}.`
      : "";
  return (
    <ConfirmAction
      action={deleteSector.bind(null, id)}
      label="Delete permanently"
      icon={<Trash2 aria-hidden />}
      variant="destructive"
      successMessage="Deleted."
      confirm={{
        title: `Delete "${name}" permanently?`,
        description: `This cannot be undone.${inUse}`,
        confirmLabel: "Delete permanently",
        destructive: true,
      }}
    />
  );
}
