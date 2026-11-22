import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Plus, SearchX, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListToolbar } from "@/components/cms/list-toolbar";
import { EmptyState, PageHeader, Pagination, SortHeader, TableSkeleton } from "@/components/cms/page-parts";
import { StatusBadge } from "@/components/cms/status-badge";
import { parseListParams } from "@/lib/cms/list";
import { formatDate, formatDateTime } from "@/lib/cms/status";
import { PROJECT_LIST, listProjects } from "@/features/projects/queries";
import { PROJECT_STATUS_LABEL, type ProjectStatus } from "@/features/projects/labels";

export const metadata: Metadata = { title: "Projects" };

const PATH = "/admin/projects";

export default function ProjectsPage({ searchParams }: PageProps<"/admin/projects">) {
  return (
    <>
      <PageHeader
        title="Projects"
        description="Projects run by VECTIS and its businesses, with their stage, location and timeline."
        actions={
          <Button asChild>
            <Link href={`${PATH}/new`}>
              <Plus aria-hidden />
              New project
            </Link>
          </Button>
        }
      />
      <Suspense>
        <ListToolbar
          searchPlaceholder="Search by name, place or company"
          filters={[
            { name: "project_status", label: "Stage", options: Object.entries(PROJECT_STATUS_LABEL).map(([value, label]) => ({ value, label })) },
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
        <ProjectsTable searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function ProjectsTable({ searchParams }: { searchParams: PageProps<"/admin/projects">["searchParams"] }) {
  const params = parseListParams(await searchParams, PROJECT_LIST);
  const { rows, total } = await listProjects(params);

  if (rows.length === 0) {
    return params.q || params.status || Object.keys(params.filters).length ? (
      <EmptyState icon={SearchX} title="No projects match" description="Try a different search or filter." />
    ) : (
      <EmptyState
        icon={Wrench}
        title="No projects yet"
        description="Each project belongs to a business under Companies. New projects are saved as drafts."
        action={
          <Button asChild>
            <Link href={`${PATH}/new`}>
              <Plus aria-hidden />
              Add the first project
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
              <SortHeader pathname={PATH} params={params} column="title">Project</SortHeader>
              <th scope="col" className="hidden px-4 py-3 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase lg:table-cell">
                Location
              </th>
              <SortHeader pathname={PATH} params={params} column="project_status" className="hidden sm:table-cell">Stage</SortHeader>
              <SortHeader pathname={PATH} params={params} column="start_date" className="hidden lg:table-cell">Start</SortHeader>
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
                      {r.coverUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.coverUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <Wrench className="size-4 text-steel" aria-hidden />
                      )}
                    </span>
                    <span className="min-w-0">
                      <Link href={`${PATH}/${r.id}`} className="font-medium text-indigo hover:underline">
                        {r.title}
                      </Link>
                      <span className="block text-xs text-muted-foreground">{r.companyName}</span>
                    </span>
                  </div>
                </td>
                <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                  {[r.location_name, r.state].filter(Boolean).join(", ") || "—"}
                </td>
                <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">{PROJECT_STATUS_LABEL[r.project_status as ProjectStatus]}</td>
                <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">{r.start_date ? formatDate(r.start_date) : "—"}</td>
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
