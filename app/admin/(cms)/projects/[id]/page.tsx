import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/cms/page-parts";
import { StatusBadge } from "@/components/cms/status-badge";
import { PublishingPanel } from "@/components/cms/publishing-panel";
import { AttachmentsPanel } from "@/components/cms/attachments-panel";
import { getProject, listMilestones, projectOptions } from "@/features/projects/queries";
import {
  addMilestone,
  deleteProject,
  moveMilestone,
  removeMilestone,
  setProjectStatus,
  sortMilestonesByDate,
  updateMilestone,
  updateProject,
} from "@/features/projects/actions";
import { ProjectForm } from "@/features/projects/components/project-form";
import { TimelinePanel } from "@/features/projects/components/timeline-panel";
import { PROJECT_STATUS_LABEL, type ProjectStatus } from "@/features/projects/labels";
import { getMediaByIds, listAttachments, toPicked } from "@/features/media/queries";
import { addMediaLink, moveMediaLink, removeMediaLink } from "@/features/media/link-actions";

export const metadata: Metadata = { title: "Edit project" };

export default function EditProjectPage({ params }: PageProps<"/admin/projects/[id]">) {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
      <Editor params={params} />
    </Suspense>
  );
}

async function Editor({ params }: { params: PageProps<"/admin/projects/[id]">["params"] }) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  const [{ companies, sectors }, media, milestones, gallery, documents] = await Promise.all([
    projectOptions(),
    getMediaByIds([project.cover_media_id]),
    listMilestones(project.id),
    listAttachments("projects", project.id, "gallery"),
    listAttachments("projects", project.id, "document"),
  ]);

  const company = project.company;
  const publishWarning =
    company && company.status !== "published"
      ? `It only shows on the website once its business (${company.name}) is published.`
      : undefined;

  return (
    <>
      <PageHeader
        title={project.title}
        description={`${PROJECT_STATUS_LABEL[project.project_status as ProjectStatus]}${company ? ` · ${company.name}` : ""}`}
        breadcrumb={{ href: "/admin/projects", label: "Projects" }}
        actions={<StatusBadge status={project.status} publishedAt={project.published_at} />}
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="space-y-6">
          <ProjectForm
            action={updateProject.bind(null, project.id)}
            project={project}
            companies={companies}
            sectors={sectors}
            cover={toPicked(media, project.cover_media_id)}
          />
          <TimelinePanel
            items={milestones}
            add={addMilestone.bind(null, project.id)}
            update={updateMilestone}
            remove={removeMilestone}
            move={moveMilestone}
            sortByDate={sortMilestonesByDate.bind(null, project.id)}
          />
          <AttachmentsPanel
            title="Gallery"
            description="Public photographs shown on the project's page, in this order."
            kind="image"
            items={gallery}
            add={addMediaLink.bind(null, "projects", project.id, "gallery")}
            remove={removeMediaLink}
            move={moveMediaLink}
          />
          <AttachmentsPanel
            title="Supporting documents"
            description="Public files can be downloaded from the website; private ones are for administrators only."
            kind="document"
            items={documents}
            add={addMediaLink.bind(null, "projects", project.id, "document")}
            remove={removeMediaLink}
            move={moveMediaLink}
          />
        </div>
        <div className="space-y-6">
          <PublishingPanel
            noun="project"
            record={{ ...project, name: project.title }}
            setStatus={setProjectStatus.bind(null, project.id)}
            remove={deleteProject.bind(null, project.id)}
            deleteWarning="Its timeline, gallery and document links are removed with it; the files stay in the media library."
            publishWarning={publishWarning}
          />
          {company ? (
            <section className="border border-border bg-white px-5 py-4 text-sm">
              <h2 className="mb-2 font-sans text-sm font-semibold text-graphite">Business</h2>
              <Link href={`/admin/companies/${company.id}`} className="text-xs text-indigo hover:underline">
                {company.name}
              </Link>
            </section>
          ) : null}
        </div>
      </div>
    </>
  );
}
