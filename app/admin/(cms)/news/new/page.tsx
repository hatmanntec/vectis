import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/cms/page-parts";
import { newsCompanyOptions } from "@/features/news/queries";
import { createNews } from "@/features/news/actions";
import { NewsForm } from "@/features/news/components/news-form";

export const metadata: Metadata = { title: "New news item" };

export default function NewNewsPage({ searchParams }: PageProps<"/admin/news/new">) {
  return (
    <>
      <PageHeader
        title="New news item"
        description="Saved as a draft. After creating it you can publish it, schedule it, or add a gallery and documents."
        breadcrumb={{ href: "/admin/news", label: "News & Media" }}
      />
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
        <Form searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Form({ searchParams }: { searchParams: PageProps<"/admin/news/new">["searchParams"] }) {
  const [{ company }, companies] = await Promise.all([searchParams, newsCompanyOptions()]);
  const preset = typeof company === "string" && companies.some((c) => c.id === company && c.status !== "archived") ? company : undefined;
  return <NewsForm action={createNews} companies={companies} defaultCompanyId={preset} />;
}
