import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/cms/page-parts";
import { requireAdmin } from "@/lib/auth/admin";
import { SectorForm } from "@/features/sectors/components/sector-form";
import { createSector } from "@/features/sectors/actions";

export const metadata: Metadata = { title: "New sector" };

export default function NewSectorPage() {
  return (
    <>
      <PageHeader
        title="New sector"
        description="New sectors are saved as drafts. Publish when ready."
        breadcrumb={{ href: "/admin/sectors", label: "Sectors" }}
      />
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
        <Gate />
      </Suspense>
    </>
  );
}

async function Gate() {
  await requireAdmin();
  return <SectorForm action={createSector} />;
}
