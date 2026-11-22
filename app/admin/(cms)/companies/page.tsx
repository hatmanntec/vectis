import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Building2, Plus, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListToolbar } from "@/components/cms/list-toolbar";
import { EmptyState, PageHeader, Pagination, SortHeader, TableSkeleton } from "@/components/cms/page-parts";
import { StatusBadge } from "@/components/cms/status-badge";
import { parseListParams } from "@/lib/cms/list";
import { formatDateTime } from "@/lib/cms/status";
import { COMPANY_LIST, listCompanies } from "@/features/companies/queries";
import { CLASSIFICATIONS, CLASSIFICATION_LABEL } from "@/features/companies/labels";

export const metadata: Metadata = { title: "Companies" };

const PATH = "/admin/companies";

export default function CompaniesPage({ searchParams }: PageProps<"/admin/companies">) {
  return (
    <>
      <PageHeader
        title="Companies"
        description="VECTIS itself, its businesses, subsidiaries, and outside companies it invests in or works with."
        actions={
          <Button asChild>
            <Link href={`${PATH}/new`}>
              <Plus aria-hidden />
              New company
            </Link>
          </Button>
        }
      />
      <Suspense>
        <ListToolbar
          searchPlaceholder="Search companies"
          filters={[
            { name: "classification", label: "Kind", options: CLASSIFICATIONS.map((c) => ({ value: c.value, label: c.label })) },
            {
              name: "status",
              label: "Status",
              options: [
                { value: "draft", label: "Draft" },
                { value: "published", label: "Published" },
                { value: "archived", label: "Archived" },
              ],
            },
          ]}
        />
      </Suspense>
      <Suspense fallback={<TableSkeleton />}>
        <CompaniesTable searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function CompaniesTable({ searchParams }: { searchParams: PageProps<"/admin/companies">["searchParams"] }) {
  const params = parseListParams(await searchParams, COMPANY_LIST);
  const { rows, total } = await listCompanies(params);

  if (rows.length === 0) {
    return params.q || params.status || Object.keys(params.filters).length ? (
      <EmptyState icon={SearchX} title="No companies match" description="Try a different search or filter." />
    ) : (
      <EmptyState
        icon={Building2}
        title="No companies yet"
        description="Start with VECTIS itself (as the parent organisation), then add its businesses. Everything stays a draft until you publish it."
        action={
          <Button asChild>
            <Link href={`${PATH}/new`}>
              <Plus aria-hidden />
              Add the first company
            </Link>
          </Button>
        }
      />
    );
  }

  return (
    <>
      <div className="overflow-x-auto border border-border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-ivory/40">
            <tr>
              <SortHeader pathname={PATH} params={params} column="name">Name</SortHeader>
              <SortHeader pathname={PATH} params={params} column="classification" className="hidden sm:table-cell">Kind</SortHeader>
              <th scope="col" className="hidden px-4 py-3 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase lg:table-cell">
                Sits under
              </th>
              <SortHeader pathname={PATH} params={params} column="status">Status</SortHeader>
              <SortHeader pathname={PATH} params={params} column="updated_at" className="hidden md:table-cell">Last changed</SortHeader>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0 hover:bg-ivory/40">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden border border-border bg-white">
                      {c.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.logoUrl} alt="" className="h-full w-full object-contain" />
                      ) : (
                        <Building2 className="size-4 text-steel" aria-hidden />
                      )}
                    </span>
                    <span className="min-w-0">
                      <Link href={`${PATH}/${c.id}`} className="font-medium text-indigo hover:underline">
                        {c.name}
                      </Link>
                      <span className="block font-mono text-xs text-muted-foreground">/businesses/{c.slug}</span>
                    </span>
                  </div>
                </td>
                <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">{CLASSIFICATION_LABEL[c.classification]}</td>
                <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">{c.parentName ?? "—"}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={c.status} publishedAt={c.published_at} />
                </td>
                <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{formatDateTime(c.updated_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination pathname={PATH} params={params} total={total} />
    </>
  );
}
