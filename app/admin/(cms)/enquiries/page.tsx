import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Inbox, SearchX } from "lucide-react";
import { ListToolbar } from "@/components/cms/list-toolbar";
import { EmptyState, PageHeader, Pagination, SortHeader, TableSkeleton } from "@/components/cms/page-parts";
import { parseListParams } from "@/lib/cms/list";
import { formatDateTime } from "@/lib/cms/status";
import { ENQUIRY_LIST, listEnquiries } from "@/features/enquiries/queries";

export const metadata: Metadata = { title: "Enquiries" };

const PATH = "/admin/enquiries";

export default function EnquiriesPage({ searchParams }: PageProps<"/admin/enquiries">) {
  return (
    <>
      <PageHeader
        title="Enquiries"
        description="Messages sent through the website's Contact page. Only administrators can see them."
      />
      <Suspense>
        <ListToolbar
          searchPlaceholder="Search name, email, organisation or message"
          filters={[{ name: "read", label: "Show", options: [{ value: "unread", label: "Unread" }, { value: "read", label: "Read" }] }]}
        />
      </Suspense>
      <Suspense fallback={<TableSkeleton />}>
        <EnquiriesTable searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function EnquiriesTable({ searchParams }: { searchParams: PageProps<"/admin/enquiries">["searchParams"] }) {
  const params = parseListParams(await searchParams, ENQUIRY_LIST);
  const { rows, total } = await listEnquiries(params);

  if (rows.length === 0) {
    return params.q || Object.keys(params.filters).length ? (
      <EmptyState icon={SearchX} title="No enquiries match" description="Try a different search or filter." />
    ) : (
      <EmptyState icon={Inbox} title="No enquiries yet" description="Messages from the Contact page will appear here once the website is live." />
    );
  }

  return (
    <>
      <div className="overflow-x-auto border border-border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-ivory/40">
            <tr>
              <SortHeader pathname={PATH} params={params} column="name">From</SortHeader>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Message
              </th>
              <SortHeader pathname={PATH} params={params} column="created_at" className="hidden md:table-cell">Received</SortHeader>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className={`border-b border-border last:border-0 hover:bg-ivory/40 ${r.is_read ? "" : "bg-copper/5"}`}>
                <td className="px-4 py-3 align-top">
                  <span className="flex items-start gap-2">
                    {r.is_read ? (
                      <span className="mt-1.5 size-2 shrink-0" aria-hidden />
                    ) : (
                      <span className="mt-1.5 size-2 shrink-0 rounded-full bg-copper" role="img" aria-label="Unread" />
                    )}
                    <span className="min-w-0">
                      <Link href={`${PATH}/${r.id}`} className={`text-indigo hover:underline ${r.is_read ? "" : "font-semibold"}`}>
                        {r.name}
                      </Link>
                      <span className="block text-xs text-muted-foreground">{r.organisation ?? r.email}</span>
                    </span>
                  </span>
                </td>
                <td className="max-w-md px-4 py-3 align-top">
                  <span className={r.is_read ? "text-graphite" : "font-semibold text-graphite"}>{r.subject ?? "(No subject)"}</span>
                  <span className="block truncate text-xs text-muted-foreground">{r.message}</span>
                </td>
                <td className="hidden px-4 py-3 align-top whitespace-nowrap text-muted-foreground md:table-cell">{formatDateTime(r.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination pathname={PATH} params={params} total={total} />
    </>
  );
}
