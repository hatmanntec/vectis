import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Newspaper, Plus, SearchX, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListToolbar } from "@/components/cms/list-toolbar";
import { EmptyState, PageHeader, Pagination, SortHeader, TableSkeleton } from "@/components/cms/page-parts";
import { StatusBadge } from "@/components/cms/status-badge";
import { parseListParams } from "@/lib/cms/list";
import { formatDateTime } from "@/lib/cms/status";
import { NEWS_LIST, listNews } from "@/features/news/queries";
import { NEWS_TYPE_LABEL, type NewsType } from "@/features/news/labels";

export const metadata: Metadata = { title: "News & Media" };

const PATH = "/admin/news";

export default function NewsPage({ searchParams }: PageProps<"/admin/news">) {
  return (
    <>
      <PageHeader
        title="News & Media"
        description="Articles, press releases, announcements and updates. Items can be scheduled to appear at a set time."
        actions={
          <Button asChild>
            <Link href={`${PATH}/new`}>
              <Plus aria-hidden />
              New item
            </Link>
          </Button>
        }
      />
      <Suspense>
        <ListToolbar
          searchPlaceholder="Search headlines, text or author"
          filters={[
            { name: "news_type", label: "Kind", options: Object.entries(NEWS_TYPE_LABEL).map(([value, label]) => ({ value, label })) },
            {
              name: "status",
              label: "Status",
              options: [
                { value: "draft", label: "Draft" },
                { value: "scheduled", label: "Scheduled" },
                { value: "published", label: "Published" },
                { value: "archived", label: "Archived" },
              ],
            },
            { name: "featured", label: "Featured", options: [{ value: "yes", label: "Featured only" }] },
          ]}
        />
      </Suspense>
      <Suspense fallback={<TableSkeleton />}>
        <NewsTable searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function NewsTable({ searchParams }: { searchParams: PageProps<"/admin/news">["searchParams"] }) {
  const params = parseListParams(await searchParams, NEWS_LIST);
  const { rows, total } = await listNews(params);

  if (rows.length === 0) {
    return params.q || params.status || Object.keys(params.filters).length ? (
      <EmptyState icon={SearchX} title="No items match" description="Try a different search or filter." />
    ) : (
      <EmptyState
        icon={Newspaper}
        title="No news yet"
        description="New items are saved as drafts. Publish them straight away, or schedule them for later."
        action={
          <Button asChild>
            <Link href={`${PATH}/new`}>
              <Plus aria-hidden />
              Write the first item
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
              <SortHeader pathname={PATH} params={params} column="title">Headline</SortHeader>
              <th scope="col" className="hidden px-4 py-3 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase sm:table-cell">
                Kind
              </th>
              <SortHeader pathname={PATH} params={params} column="status">Status</SortHeader>
              <SortHeader pathname={PATH} params={params} column="published_at" className="hidden md:table-cell">Publication date</SortHeader>
              <SortHeader pathname={PATH} params={params} column="updated_at" className="hidden lg:table-cell">Last changed</SortHeader>
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
                        <Newspaper className="size-4 text-steel" aria-hidden />
                      )}
                    </span>
                    <span className="min-w-0">
                      <Link href={`${PATH}/${r.id}`} className="font-medium text-indigo hover:underline">
                        {r.title}
                      </Link>
                      {r.is_featured ? (
                        <span className="ml-2 inline-flex items-center gap-1 text-xs text-copper">
                          <Star className="size-3" aria-hidden />
                          Featured
                        </span>
                      ) : null}
                      <span className="block font-mono text-xs text-muted-foreground">/news/{r.slug}</span>
                    </span>
                  </div>
                </td>
                <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">{NEWS_TYPE_LABEL[r.news_type as NewsType]}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={r.status} publishedAt={r.published_at} />
                </td>
                <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{r.published_at ? formatDateTime(r.published_at) : "—"}</td>
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
