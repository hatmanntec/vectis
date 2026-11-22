import type { Metadata } from "next";
import { PageHeader } from "@/components/cms/page-parts";
import { createPage } from "@/features/pages/actions";
import { NewPageForm } from "@/features/pages/components/new-page-form";

export const metadata: Metadata = { title: "New page" };

export default function NewPagePage() {
  return (
    <>
      <PageHeader
        title="New page"
        description="An extra page, e.g. a policy or a special announcement. Saved as a draft."
        breadcrumb={{ href: "/admin/pages", label: "Website Pages" }}
      />
      <NewPageForm action={createPage} />
    </>
  );
}
