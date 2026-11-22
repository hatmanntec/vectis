import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Plus, SearchX, UserRound, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListToolbar } from "@/components/cms/list-toolbar";
import { EmptyState, PageHeader, Pagination, SortHeader, TableSkeleton } from "@/components/cms/page-parts";
import { StatusBadge } from "@/components/cms/status-badge";
import { parseListParams } from "@/lib/cms/list";
import { formatDateTime } from "@/lib/cms/status";
import { LEADERSHIP_LIST, listLeadership } from "@/features/leadership/queries";
import { CATEGORY_LABEL, type LeadershipCategory } from "@/features/leadership/labels";

export const metadata: Metadata = { title: "Leadership" };

const PATH = "/admin/leadership";

export default function LeadershipPage({ searchParams }: PageProps<"/admin/leadership">) {
  return (
    <>
      <PageHeader
        title="Leadership"
        description="Directors, executives and management, with their roles across VECTIS companies."
        actions={
          <Button asChild>
            <Link href={`${PATH}/new`}>
              <Plus aria-hidden />
              New profile
            </Link>
          </Button>
        }
      />
      <Suspense>
        <ListToolbar
          searchPlaceholder="Search by name or position"
          filters={[
            { name: "category", label: "Group", options: Object.entries(CATEGORY_LABEL).map(([value, label]) => ({ value, label })) },
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
        <LeadershipTable searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function LeadershipTable({ searchParams }: { searchParams: PageProps<"/admin/leadership">["searchParams"] }) {
  const params = parseListParams(await searchParams, LEADERSHIP_LIST);
  const { rows, total } = await listLeadership(params);

  if (rows.length === 0) {
    return params.q || params.status || Object.keys(params.filters).length ? (
      <EmptyState icon={SearchX} title="No profiles match" description="Try a different search or filter." />
    ) : (
      <EmptyState
        icon={Users}
        title="No leadership profiles yet"
        description="Add each person with their confirmed name, position and an approved portrait. Profiles stay drafts until published."
        action={
          <Button asChild>
            <Link href={`${PATH}/new`}>
              <Plus aria-hidden />
              Add the first profile
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
              <SortHeader pathname={PATH} params={params} column="full_name">Name</SortHeader>
              <SortHeader pathname={PATH} params={params} column="category" className="hidden sm:table-cell">Group</SortHeader>
              <SortHeader pathname={PATH} params={params} column="display_order" className="hidden md:table-cell">Order</SortHeader>
              <SortHeader pathname={PATH} params={params} column="status">Status</SortHeader>
              <SortHeader pathname={PATH} params={params} column="updated_at" className="hidden lg:table-cell">Last changed</SortHeader>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-0 hover:bg-ivory/40">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-white">
                      {r.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.photoUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <UserRound className="size-4 text-steel" aria-hidden />
                      )}
                    </span>
                    <span className="min-w-0">
                      <Link href={`${PATH}/${r.id}`} className="font-medium text-indigo hover:underline">
                        {r.full_name}
                      </Link>
                      {r.job_title ? <span className="block text-xs text-muted-foreground">{r.job_title}</span> : null}
                    </span>
                  </div>
                </td>
                <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">{CATEGORY_LABEL[r.category as LeadershipCategory]}</td>
                <td className="hidden px-4 py-3 text-muted-foreground tabular-nums md:table-cell">{r.display_order}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={r.status} publishedAt={r.published_at} />
                </td>
                <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">{formatDateTime(r.updated_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination pathname={PATH} params={params} total={total} />
    </>
  );
}
