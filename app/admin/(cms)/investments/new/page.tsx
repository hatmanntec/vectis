import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/cms/page-parts";
import { investmentCompanyOptions } from "@/features/investments/queries";
import { createInvestment } from "@/features/investments/actions";
import { InvestmentForm } from "@/features/investments/components/investment-form";

export const metadata: Metadata = { title: "New investment" };

export default function NewInvestmentPage({ searchParams }: PageProps<"/admin/investments/new">) {
  return (
    <>
      <PageHeader
        title="New investment"
        description="Saved as a draft. Confidential figures, the gallery and documents can be added after creating it."
        breadcrumb={{ href: "/admin/investments", label: "Investments" }}
      />
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
        <Form searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Form({ searchParams }: { searchParams: PageProps<"/admin/investments/new">["searchParams"] }) {
  const [{ investor }, { investors, investees }] = await Promise.all([searchParams, investmentCompanyOptions()]);
  const preset = typeof investor === "string" && investors.some((c) => c.id === investor) ? investor : undefined;
  return <InvestmentForm action={createInvestment} investors={investors} investees={investees} defaultInvestorId={preset} />;
}
