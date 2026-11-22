import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { History, SearchX } from "lucide-react";
import { ListToolbar } from "@/components/cms/list-toolbar";
import { EmptyState, PageHeader, Pagination, SortHeader, TableSkeleton } from "@/components/cms/page-parts";
import { parseListParams } from "@/lib/cms/list";
import { formatDateTime } from "@/lib/cms/status";
import type { Json } from "@/types/database";
import { AUDIT_LIST, AUDIT_TABLES, listAuditEntries } from "@/features/audit/queries";

export const metadata: Metadata = { title: "Audit log" };

const PATH = "/admin/audit-log";

/** Where each kind of record is edited, so an entry can link back to it. */
const RECORD_PAGE: Record<string, string> = {
  companies: "/admin/companies",
  investments: "/admin/investments",
  projects: "/admin/projects",
  news: "/admin/news",
  leadership: "/admin/leadership",
  pages: "/admin/pages",
  sectors: "/admin/sectors",
  media: "/admin/media",
  enquiries: "/admin/enquiries",
};

const ACTION_LABEL = { insert: "Created", update: "Changed", delete: "Deleted" } as const;
const ACTION_STYLE = {
  insert: "border-teal/30 bg-teal/10 text-teal",
  update: "border-indigo/20 bg-indigo/5 text-indigo",
  delete: "border-destructive/30 bg-destructive/5 text-destructive",
} as const;

// Housekeeping fields that would only clutter the change details.
const HIDDEN_FIELDS = new Set(["id", "created_at", "updated_at", "created_by", "updated_by"]);

export default function AuditLogPage({ searchParams }: PageProps<"/admin/audit-log">) {
  return (
    <>
      <PageHeader
        title="Audit log"
        description="Every change made in the CMS, recorded automatically by the database. Entries cannot be edited or deleted."
      />
      <Suspense>
        <ListToolbar
          searchPlaceholder="Search by record name or administrator email"
          filters={[
            {
              name: "table",
              label: "Type",
              options: Object.entries(AUDIT_TABLES).map(([value, label]) => ({ value, label })),
            },
            {
              name: "action",
              label: "Action",
              options: [
                { value: "insert", label: "Created" },
                { value: "update", label: "Changed" },
                { value: "delete", label: "Deleted" },
              ],
            },
          ]}
        />
      </Suspense>
      <Suspense fallback={<TableSkeleton />}>
        <AuditTable searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function AuditTable({ searchParams }: { searchParams: PageProps<"/admin/audit-log">["searchParams"] }) {
  const params = parseListParams(await searchParams, AUDIT_LIST);
  const { rows, total } = await listAuditEntries(params);

  if (rows.length === 0) {
    const filtered = Boolean(params.q || Object.keys(params.filters).length);
    return filtered ? (
      <EmptyState icon={SearchX} title="No entries match" description="Try a different search or filter." />
    ) : (
      <EmptyState icon={History} title="No activity yet" description="Changes made in the CMS will appear here." />
    );
  }

  return (
    <>
      <div className="overflow-x-auto border border-border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-ivory/40">
            <tr>
              <SortHeader pathname={PATH} params={params} column="occurred_at">When</SortHeader>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">Who</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">What happened</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((e) => (
              <tr key={e.id} className="border-b border-border align-top last:border-0">
                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{formatDateTime(e.occurred_at)}</td>
                <td className="px-4 py-3 text-graphite">{e.actor_email ?? <span className="text-muted-foreground">System</span>}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-sm border px-2 py-0.5 text-xs font-medium ${ACTION_STYLE[e.action]}`}>
                      {ACTION_LABEL[e.action]}
                    </span>
                    <span className="text-muted-foreground">{AUDIT_TABLES[e.table_name] ?? e.table_name}</span>
                    {e.record_label ? (
                      e.action !== "delete" && e.record_id && RECORD_PAGE[e.table_name] ? (
                        <Link href={`${RECORD_PAGE[e.table_name]}/${e.record_id}`} className="font-medium text-indigo hover:underline">
                          {e.record_label}
                        </Link>
                      ) : (
                        <span className="font-medium text-graphite">{e.record_label}</span>
                      )
                    ) : null}
                  </div>
                  <ChangeDetails action={e.action} changes={e.changes} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination pathname={PATH} params={params} total={total} />
    </>
  );
}

function show(value: Json | undefined): string {
  if (value === null || value === undefined || value === "") return "(empty)";
  if (typeof value === "object") return Array.isArray(value) ? `${value.length} item(s)` : "(formatted text)";
  const s = String(value);
  return s.length > 120 ? `${s.slice(0, 117)}…` : s;
}

function ChangeDetails({ action, changes }: { action: "insert" | "update" | "delete"; changes: Json | null }) {
  if (!changes || typeof changes !== "object" || Array.isArray(changes)) return null;
  const entries = Object.entries(changes).filter(([k]) => !HIDDEN_FIELDS.has(k));
  if (entries.length === 0) return null;

  return (
    <details className="mt-2 text-xs">
      <summary className="cursor-pointer text-indigo">
        {action === "update" ? `${entries.length} field${entries.length === 1 ? "" : "s"} changed` : "Show details"}
      </summary>
      <dl className="mt-2 space-y-1 border-l-2 border-border pl-3">
        {entries.map(([field, value]) => {
          const pair = action === "update" && value && typeof value === "object" && !Array.isArray(value) ? value : null;
          return (
            <div key={field} className="grid grid-cols-[9rem_minmax(0,1fr)] gap-2">
              <dt className="font-mono text-muted-foreground">{field}</dt>
              <dd className="break-words text-graphite">
                {pair ? (
                  <>
                    <span className="text-muted-foreground line-through">{show(pair.old)}</span> → {show(pair.new)}
                  </>
                ) : (
                  show(value)
                )}
              </dd>
            </div>
          );
        })}
      </dl>
    </details>
  );
}
