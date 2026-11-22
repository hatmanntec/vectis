import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/cms/page-parts";
import { projectOptions } from "@/features/projects/queries";
import { createProject } from "@/features/projects/actions";
import { ProjectForm } from "@/features/projects/components/project-form";

export const metadata: Metadata = { title: "New project" };

export default function NewProjectPage({ searchParams }: PageProps<"/admin/projects/new">) {
  return (
    <>
      <PageHeader
        title="New project"
        description="Saved as a draft. The timeline, gallery and documents can be added after creating it."
        breadcrumb={{ href: "/admin/projects", label: "Projects" }}
      />
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
        <Form searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Form({ searchParams }: { searchParams: PageProps<"/admin/projects/new">["searchParams"] }) {
  const [{ company }, { companies, sectors }] = await Promise.all([searchParams, projectOptions()]);
  const preset = typeof company === "string" && companies.some((c) => c.id === company) ? company : undefined;
  return <ProjectForm action={createProject} companies={companies} sectors={sectors} defaultCompanyId={preset} />;
}
