import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Plus, SearchX, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListToolbar } from "@/components/cms/list-toolbar";
import { EmptyState, PageHeader, Pagination, SortHeader, TableSkeleton } from "@/components/cms/page-parts";
import { StatusBadge } from "@/components/cms/status-badge";
import { parseListParams } from "@/lib/cms/list";
import { formatDate, formatDateTime } from "@/lib/cms/status";
import { INVESTMENT_LIST, listInvestments } from "@/features/investments/queries";
import { INVESTMENT_STATUS_LABEL, NATURE_LABEL, type InvestmentStatus, type Nature } from "@/features/investments/labels";

export const metadata: Metadata = { title: "Investments" };

const PATH = "/admin/investments";

export default function InvestmentsPage({ searchParams }: PageProps<"/admin/investments">) {
  return (
    <>
      <PageHeader
        title="Investments"
        description="Investments made by VECTIS and its businesses. Confidential figures are kept separately and never reach the website."
        actions={
          <Button asChild>
            <Link href={`${PATH}/new`}>
              <Plus aria-hidden />
              New investment
            </Link>
          </Button>
        }
      />
      <Suspense>
        <ListToolbar
          searchPlaceholder="Search by company"
          filters={[
            { name: "nature", label: "Nature", options: Object.entries(NATURE_LABEL).map(([value, label]) => ({ value, label })) },
            {
              name: "investment_status",
              label: "Investment status",
              options: Object.entries(INVESTMENT_STATUS_LABEL).map(([value, label]) => ({ value, label })),
            },
            {
              name: "status",
              label: "Website status",
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
        <InvestmentsTable searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function InvestmentsTable({ searchParams }: { searchParams: PageProps<"/admin/investments">["searchParams"] }) {
  const params = parseListParams(await searchParams, INVESTMENT_LIST);
  const { rows, total } = await listInvestments(params);

  if (rows.length === 0) {
    return params.q || params.status || Object.keys(params.filters).length ? (
      <EmptyState icon={SearchX} title="No investments match" description="Try a different search or filter." />
    ) : (
      <EmptyState
        icon={TrendingUp}
        title="No investments yet"
        description="Both companies need to exist under Companies first. New investments are saved as drafts."
        action={
          <Button asChild>
            <Link href={`${PATH}/new`}>
              <Plus aria-hidden />
              Add the first investment
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
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Investment
              </th>
              <th scope="col" className="hidden px-4 py-3 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase sm:table-cell">
                Nature
              </th>
              <SortHeader pathname={PATH} params={params} column="investment_status" className="hidden lg:table-cell">State</SortHeader>
              <SortHeader pathname={PATH} params={params} column="investment_date" className="hidden lg:table-cell">Date</SortHeader>
              <SortHeader pathname={PATH} params={params} column="status">Status</SortHeader>
              <SortHeader pathname={PATH} params={params} column="updated_at" className="hidden md:table-cell">Last changed</SortHeader>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-0 hover:bg-ivory/40">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden border border-border bg-white">
                      {r.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.logoUrl} alt="" className="h-full w-full object-contain" />
                      ) : (
                        <TrendingUp className="size-4 text-steel" aria-hidden />
                      )}
                    </span>
                    <span className="min-w-0">
                      <Link href={`${PATH}/${r.id}`} className="font-medium text-indigo hover:underline">
                        {r.investee}
                      </Link>
                      <span className="block text-xs text-muted-foreground">by {r.investor}</span>
                    </span>
                  </div>
                </td>
                <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">{NATURE_LABEL[r.nature as Nature]}</td>
                <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                  {INVESTMENT_STATUS_LABEL[r.investment_status as InvestmentStatus]}
                </td>
                <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                  {r.investment_date ? formatDate(r.investment_date) : "—"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={r.status} publishedAt={r.published_at} />
                </td>
                <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{formatDateTime(r.updated_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination pathname={PATH} params={params} total={total} />
    </>
  );
}
