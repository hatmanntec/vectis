import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/cms/page-parts";
import { StatusBadge } from "@/components/cms/status-badge";
import { PublishingPanel } from "@/components/cms/publishing-panel";
import { getSector, sectorUsage } from "@/features/sectors/queries";
import { deleteSector, setSectorStatus, updateSector } from "@/features/sectors/actions";
import { SectorForm } from "@/features/sectors/components/sector-form";
import { getMediaByIds, toPicked } from "@/features/media/queries";

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

  const [media, usage] = await Promise.all([getMediaByIds([sector.cover_media_id]), sectorUsage(sector.id)]);
  const inUse =
    usage.companies + usage.projects > 0
      ? `It is currently linked to ${usage.companies} compan${usage.companies === 1 ? "y" : "ies"} and ${usage.projects} project${usage.projects === 1 ? "" : "s"}.`
      : undefined;

  return (
    <>
      <PageHeader
        title={sector.name}
        breadcrumb={{ href: "/admin/sectors", label: "Sectors" }}
        actions={<StatusBadge status={sector.status} publishedAt={sector.published_at} />}
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <SectorForm action={updateSector.bind(null, sector.id)} sector={sector} cover={toPicked(media, sector.cover_media_id)} />
        <PublishingPanel
          noun="sector"
          record={sector}
          setStatus={setSectorStatus.bind(null, sector.id)}
          remove={deleteSector.bind(null, sector.id)}
          deleteWarning={inUse}
        />
      </div>
    </>
  );
}
