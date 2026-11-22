import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Layers, Plus, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListToolbar } from "@/components/cms/list-toolbar";
import { EmptyState, PageHeader, Pagination, SortHeader, TableSkeleton } from "@/components/cms/page-parts";
import { StatusBadge } from "@/components/cms/status-badge";
import { parseListParams } from "@/lib/cms/list";
import { formatDateTime } from "@/lib/cms/status";
import { listSectors, SECTOR_LIST } from "@/features/sectors/queries";

export const metadata: Metadata = { title: "Sectors" };

const PATH = "/admin/sectors";

export default function SectorsPage({ searchParams }: PageProps<"/admin/sectors">) {
  return (
    <>
      <PageHeader
        title="Sectors"
        description="The industries VECTIS works in. They group companies and projects, and drive the website's Industries section."
        actions={
          <Button asChild>
            <Link href={`${PATH}/new`}>
              <Plus aria-hidden />
              New sector
            </Link>
          </Button>
        }
      />
      <Suspense>
        <ListToolbar
          searchPlaceholder="Search sectors by name"
          filters={[
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
        <SectorsTable searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function SectorsTable({ searchParams }: { searchParams: PageProps<"/admin/sectors">["searchParams"] }) {
  const params = parseListParams(await searchParams, SECTOR_LIST);
  const { rows, total } = await listSectors(params);
  const filtered = Boolean(params.q || params.status);

  if (rows.length === 0) {
    return filtered ? (
      <EmptyState icon={SearchX} title="No sectors match" description="Try a different search or filter." />
    ) : (
      <EmptyState
        icon={Layers}
        title="No sectors yet"
        description="Add the industries VECTIS operates in, such as those of its businesses. They stay as drafts until you publish them."
        action={
          <Button asChild>
            <Link href={`${PATH}/new`}>
              <Plus aria-hidden />
              Add the first sector
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
              <SortHeader pathname={PATH} params={params} column="status">Status</SortHeader>
              <SortHeader pathname={PATH} params={params} column="sort_order" className="hidden sm:table-cell">Order</SortHeader>
              <SortHeader pathname={PATH} params={params} column="updated_at" className="hidden md:table-cell">Last changed</SortHeader>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id} className="border-b border-border last:border-0 hover:bg-ivory/40">
                <td className="px-4 py-3">
                  <Link href={`${PATH}/${s.id}`} className="font-medium text-indigo hover:underline">
                    {s.name}
                  </Link>
                  <span className="block font-mono text-xs text-muted-foreground">/industries/{s.slug}</span>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={s.status} publishedAt={s.published_at} />
                </td>
                <td className="hidden px-4 py-3 tabular-nums sm:table-cell">{s.sort_order}</td>
                <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{formatDateTime(s.updated_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination pathname={PATH} params={params} total={total} />
    </>
  );
}
