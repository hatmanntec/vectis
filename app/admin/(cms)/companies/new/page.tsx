import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/cms/page-parts";
import { companyOptions, sectorOptions } from "@/features/companies/queries";
import { createCompany } from "@/features/companies/actions";
import { CompanyForm } from "@/features/companies/components/company-form";

export const metadata: Metadata = { title: "New company" };

export default function NewCompanyPage() {
  return (
    <>
      <PageHeader
        title="New company"
        description="New companies are saved as drafts. The gallery, documents and links to other companies can be added after creating it."
        breadcrumb={{ href: "/admin/companies", label: "Companies" }}
      />
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
        <Form />
      </Suspense>
    </>
  );
}

async function Form() {
  const [companies, sectors] = await Promise.all([companyOptions(), sectorOptions()]);
  return <CompanyForm action={createCompany} companies={companies} sectors={sectors} />;
}
