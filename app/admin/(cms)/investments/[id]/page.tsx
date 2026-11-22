import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/cms/page-parts";
import { StatusBadge } from "@/components/cms/status-badge";
import { PublishingPanel } from "@/components/cms/publishing-panel";
import { AttachmentsPanel } from "@/components/cms/attachments-panel";
import { getInvestment, investmentCompanyOptions } from "@/features/investments/queries";
import {
  deleteInvestment,
  savePrivateDetails,
  setInvestmentStatus,
  updateInvestment,
} from "@/features/investments/actions";
import { InvestmentForm } from "@/features/investments/components/investment-form";
import { PrivateDetailsForm } from "@/features/investments/components/private-details-form";
import { NATURE_LABEL, investmentTitle, type Nature } from "@/features/investments/labels";
import { getMediaByIds, listAttachments, toPicked } from "@/features/media/queries";
import { addMediaLink, moveMediaLink, removeMediaLink } from "@/features/media/link-actions";

export const metadata: Metadata = { title: "Edit investment" };

export default function EditInvestmentPage({ params }: PageProps<"/admin/investments/[id]">) {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
      <Editor params={params} />
    </Suspense>
  );
}

async function Editor({ params }: { params: PageProps<"/admin/investments/[id]">["params"] }) {
  const { id } = await params;
  const investment = await getInvestment(id);
  if (!investment) notFound();

  const [{ investors, investees }, media, gallery, documents] = await Promise.all([
    investmentCompanyOptions(),
    getMediaByIds([investment.logo_media_id]),
    listAttachments("investments", investment.id, "gallery"),
    listAttachments("investments", investment.id, "document"),
  ]);

  const investorName = investment.investor?.name ?? "Unknown";
  const investeeName = investment.investee?.name ?? "Unknown";
  const unpublished = [investment.investor, investment.investee]
    .filter((c) => c && c.status !== "published")
    .map((c) => c!.name);
  const publishWarning = unpublished.length
    ? `It only shows on the website once both companies are published. Not yet published: ${unpublished.join(" and ")}.`
    : undefined;

  const priv = investment.privateDetails;

  return (
    <>
      <PageHeader
        title={investmentTitle(investorName, investeeName)}
        description={NATURE_LABEL[investment.nature as Nature]}
        breadcrumb={{ href: "/admin/investments", label: "Investments" }}
        actions={<StatusBadge status={investment.status} publishedAt={investment.published_at} />}
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="space-y-6">
          <InvestmentForm
            action={updateInvestment.bind(null, investment.id)}
            investment={investment}
            investors={investors}
            investees={investees}
            logo={toPicked(media, investment.logo_media_id)}
          />
          <PrivateDetailsForm
            action={savePrivateDetails.bind(null, investment.id)}
            values={
              priv
                ? {
                    // Shown as plain numbers (12.5, not "12.50").
                    stake_percentage: priv.stake_percentage === null ? null : Number(priv.stake_percentage),
                    amount: priv.amount === null ? null : Number(priv.amount),
                    currency: priv.currency,
                    notes: priv.notes,
                  }
                : null
            }
          />
          <AttachmentsPanel
            title="Gallery"
            description="Public photographs shown on the investment's page, in this order."
            kind="image"
            items={gallery}
            add={addMediaLink.bind(null, "investments", investment.id, "gallery")}
            remove={removeMediaLink}
            move={moveMediaLink}
          />
          <AttachmentsPanel
            title="Supporting documents"
            description="Public files can be downloaded from the website; private ones are for administrators only."
            kind="document"
            items={documents}
            add={addMediaLink.bind(null, "investments", investment.id, "document")}
            remove={removeMediaLink}
            move={moveMediaLink}
          />
        </div>
        <div className="space-y-6">
          <PublishingPanel
            noun="investment"
            record={{ ...investment, name: investmentTitle(investorName, investeeName) }}
            setStatus={setInvestmentStatus.bind(null, investment.id)}
            remove={deleteInvestment.bind(null, investment.id)}
            deleteWarning="Its confidential details, gallery and document links are removed with it; the files stay in the media library."
            publishWarning={publishWarning}
          />
          <section className="border border-border bg-white px-5 py-4 text-sm">
            <h2 className="mb-2 font-sans text-sm font-semibold text-graphite">Companies</h2>
            <dl className="space-y-1 text-xs">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Investor</dt>
                <dd>
                  <Link href={`/admin/companies/${investment.investor_company_id}`} className="text-indigo hover:underline">
                    {investorName}
                  </Link>
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Invested in</dt>
                <dd>
                  <Link href={`/admin/companies/${investment.investee_company_id}`} className="text-indigo hover:underline">
                    {investeeName}
                  </Link>
                </dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </>
  );
}
