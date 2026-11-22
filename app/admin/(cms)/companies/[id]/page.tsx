import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/cms/page-parts";
import { StatusBadge } from "@/components/cms/status-badge";
import { PublishingPanel } from "@/components/cms/publishing-panel";
import { AttachmentsPanel } from "@/components/cms/attachments-panel";
import { companyOptions, companyUsage, getCompany, listRelationships, sectorOptions } from "@/features/companies/queries";
import {
  addRelationship,
  deleteCompany,
  removeRelationship,
  setCompanyStatus,
  setRelationshipVisibility,
  updateCompany,
} from "@/features/companies/actions";
import { CompanyForm } from "@/features/companies/components/company-form";
import { RelationshipsPanel } from "@/features/companies/components/relationships-panel";
import { CLASSIFICATION_LABEL } from "@/features/companies/labels";
import { getMediaByIds, listAttachments, toPicked } from "@/features/media/queries";
import { addMediaLink, moveMediaLink, removeMediaLink } from "@/features/media/link-actions";
import { companyInvestments } from "@/features/investments/queries";
import { CompanyInvestmentsPanel } from "@/features/investments/components/company-investments-panel";
import { companyProjects } from "@/features/projects/queries";
import { CompanyProjectsPanel } from "@/features/projects/components/company-projects-panel";
import { companyNews } from "@/features/news/queries";
import { CompanyNewsPanel } from "@/features/news/components/company-news-panel";
import { companyLeadership } from "@/features/leadership/queries";
import { CompanyLeadershipPanel } from "@/features/leadership/components/company-leadership-panel";

export const metadata: Metadata = { title: "Edit company" };

export default function EditCompanyPage({ params }: PageProps<"/admin/companies/[id]">) {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
      <Editor params={params} />
    </Suspense>
  );
}

async function Editor({ params }: { params: PageProps<"/admin/companies/[id]">["params"] }) {
  const { id } = await params;
  const company = await getCompany(id);
  if (!company) notFound();

  const [companies, sectors, media, usage, relationships, gallery, documents, investments, projects, news, people] = await Promise.all([
    companyOptions(),
    sectorOptions(),
    getMediaByIds([company.logo_media_id, company.cover_media_id]),
    companyUsage(company.id),
    listRelationships(company.id),
    listAttachments("companies", company.id, "gallery"),
    listAttachments("companies", company.id, "document"),
    companyInvestments(company.id),
    companyProjects(company.id),
    companyNews(company.id),
    companyLeadership(company.id),
  ]);

  const parent = companies.find((c) => c.id === company.parent_company_id);
  const blockers = [
    usage.children ? `${usage.children} compan${usage.children === 1 ? "y sits" : "ies sit"} under it` : null,
    usage.investments ? `${usage.investments} investment${usage.investments === 1 ? "" : "s"}` : null,
    usage.projects ? `${usage.projects} project${usage.projects === 1 ? "" : "s"}` : null,
  ].filter(Boolean);
  const deleteWarning = blockers.length
    ? `It can't be deleted yet: ${blockers.join(", ")}. Move or remove those first.`
    : "Its sector links, gallery, documents and links with other companies are removed with it; the files stay in the media library.";
  const publishWarning =
    parent && parent.status !== "published"
      ? `Its parent organisation (${parent.name}) isn't published yet; the link will show once it is.`
      : undefined;

  return (
    <>
      <PageHeader
        title={company.name}
        description={`${CLASSIFICATION_LABEL[company.classification]}${parent ? ` · sits under ${parent.name}` : ""}`}
        breadcrumb={{ href: "/admin/companies", label: "Companies" }}
        actions={<StatusBadge status={company.status} publishedAt={company.published_at} />}
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="space-y-6">
          <CompanyForm
            action={updateCompany.bind(null, company.id)}
            company={company}
            companies={companies}
            sectors={sectors}
            logo={toPicked(media, company.logo_media_id)}
            cover={toPicked(media, company.cover_media_id)}
          />
          <RelationshipsPanel
            relationships={relationships}
            companies={companies.filter((c) => c.id !== company.id && c.status !== "archived")}
            add={addRelationship.bind(null, company.id)}
            setVisible={setRelationshipVisibility}
            remove={removeRelationship}
          />
          <CompanyInvestmentsPanel
            companyId={company.id}
            canInvest={company.classification !== "external"}
            rows={investments}
          />
          <CompanyProjectsPanel companyId={company.id} rows={projects} />
          <CompanyNewsPanel companyId={company.id} rows={news} />
          <CompanyLeadershipPanel rows={people} />
          <AttachmentsPanel
            title="Gallery"
            description="Public photographs shown on the company's page, in this order."
            kind="image"
            items={gallery}
            add={addMediaLink.bind(null, "companies", company.id, "gallery")}
            remove={removeMediaLink}
            move={moveMediaLink}
          />
          <AttachmentsPanel
            title="Supporting documents"
            description="Brochures, reports and other files. Public files can be downloaded from the website; private ones are for administrators only."
            kind="document"
            items={documents}
            add={addMediaLink.bind(null, "companies", company.id, "document")}
            remove={removeMediaLink}
            move={moveMediaLink}
          />
        </div>
        <div className="space-y-6">
          <PublishingPanel
            noun="company"
            record={company}
            setStatus={setCompanyStatus.bind(null, company.id)}
            remove={deleteCompany.bind(null, company.id)}
            deleteWarning={deleteWarning}
            publishWarning={publishWarning}
          />
          <section className="border border-border bg-white px-5 py-4 text-sm">
            <h2 className="mb-2 font-sans text-sm font-semibold text-graphite">Connected records</h2>
            <dl className="space-y-1 text-xs text-muted-foreground">
              <div className="flex justify-between"><dt>Companies under it</dt><dd>{usage.children}</dd></div>
              <div className="flex justify-between"><dt>Investments</dt><dd>{usage.investments}</dd></div>
              <div className="flex justify-between"><dt>Projects</dt><dd>{usage.projects}</dd></div>
            </dl>
          </section>
        </div>
      </div>
    </>
  );
}
