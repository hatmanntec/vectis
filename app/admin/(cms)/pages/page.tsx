import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Archive, FileText, Lock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, TableSkeleton } from "@/components/cms/page-parts";
import { StatusBadge } from "@/components/cms/status-badge";
import { formatDateTime } from "@/lib/cms/status";
import { listPages } from "@/features/pages/queries";
import { templateFor } from "@/features/pages/templates";

export const metadata: Metadata = { title: "Website Pages" };

export default function PagesPage({ searchParams }: PageProps<"/admin/pages">) {
  return (
    <>
      <PageHeader
        title="Website Pages"
        description="The text of the website's main pages. Companies, projects, news and people are listed on their pages automatically."
        actions={
          <Button asChild>
            <Link href="/admin/pages/new">
              <Plus aria-hidden />
              New page
            </Link>
          </Button>
        }
      />
      <Suspense fallback={<TableSkeleton />}>
        <PagesTable searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function PagesTable({ searchParams }: { searchParams: PageProps<"/admin/pages">["searchParams"] }) {
  const { status } = await searchParams;
  const archived = status === "archived";
  const rows = await listPages(archived);
  return (
    <>
      <div className="mb-3 flex justify-end">
        <Button asChild variant="ghost" size="sm">
          <Link href={archived ? "/admin/pages" : "/admin/pages?status=archived"}>
            <Archive aria-hidden />
            {archived ? "Back to pages" : "Archived pages"}
          </Link>
        </Button>
      </div>
      {rows.length === 0 ? (
        <p className="border border-border bg-white px-5 py-8 text-center text-sm text-muted-foreground">
          {archived ? "No archived pages." : "No pages."}
        </p>
      ) : (
        <div className="overflow-x-auto border border-border bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-ivory/40">
              <tr>
                {["Page", "Type", "Status", "Last changed"].map((h, i) => (
                  <th
                    key={h}
                    scope="col"
                    className={`px-4 py-3 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase ${i === 1 ? "hidden sm:table-cell" : i === 3 ? "hidden md:table-cell" : ""}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0 hover:bg-ivory/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center border border-border bg-white">
                        {r.is_system ? <Lock className="size-4 text-steel" aria-label="Core page" /> : <FileText className="size-4 text-steel" aria-hidden />}
                      </span>
                      <span className="min-w-0">
                        <Link href={`/admin/pages/${r.id}`} className="font-medium text-indigo hover:underline">
                          {r.title}
                        </Link>
                        <span className="block font-mono text-xs text-muted-foreground">
                          /{r.is_system ? (r.page_key === "home" ? "" : r.page_key) : r.slug}
                        </span>
                      </span>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                    {r.is_system ? "Core page" : templateFor(r.template).label}
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
      )}
    </>
  );
}
