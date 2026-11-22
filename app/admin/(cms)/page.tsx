import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, History, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/cms/page-parts";
import { StatusBadge } from "@/components/cms/status-badge";
import { requireAdmin } from "@/lib/auth/admin";
import { formatDateTime } from "@/lib/cms/status";
import { NAV } from "@/lib/cms/nav";
import { AUDIT_TABLES } from "@/features/audit/queries";
import { getDashboardData, TABLE_LABEL } from "@/features/dashboard/queries";

export const metadata: Metadata = { title: "Dashboard" };

/** Module links switch on automatically as each module is built. */
const ready = new Set(NAV.flatMap((g) => g.items).filter((i) => i.ready).map((i) => i.href));
const hrefIfReady = (href: string) => (ready.has(href) ? href : null);
const recordHref: Record<string, string> = {
  sectors: "/admin/sectors",
  companies: "/admin/companies",
  investments: "/admin/investments",
  projects: "/admin/projects",
  news: "/admin/news",
  leadership: "/admin/leadership",
  pages: "/admin/pages",
};

export default function DashboardPage() {
  return (
    <>
      <Suspense fallback={<div className="mb-8 h-20" />}>
        <Greeting />
      </Suspense>
      <Suspense fallback={<DashboardSkeleton />}>
        <Dashboard />
      </Suspense>
    </>
  );
}

async function Greeting() {
  const admin = await requireAdmin();
  return (
    <PageHeader
      title={`Welcome, ${admin.fullName.split(" ")[0]}`}
      description="An overview of the VECTIS content in the CMS."
      actions={
        <>
          <Button asChild variant="outline">
            <Link href="/admin/audit-log">
              <History aria-hidden />
              Audit log
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/sectors/new">
              <Plus aria-hidden />
              New sector
            </Link>
          </Button>
        </>
      }
    />
  );
}

async function Dashboard() {
  const { counts, recentRecords, activity } = await getDashboardData();

  const stats = [
    { label: "Companies", value: counts.companies, href: hrefIfReady("/admin/companies"), note: "Excluding archived" },
    { label: "Investments", value: counts.investments, href: hrefIfReady("/admin/investments"), note: "Excluding archived" },
    { label: "Projects", value: counts.projects, href: hrefIfReady("/admin/projects"), note: "Excluding archived" },
    { label: "Published news", value: counts.publishedNews, href: hrefIfReady("/admin/news"), note: "Live on the website" },
    { label: "Drafts", value: counts.drafts, href: null, note: "Across all content, waiting to be published" },
    { label: "Unread enquiries", value: counts.unreadEnquiries, href: hrefIfReady("/admin/enquiries"), note: "From the Contact page" },
  ];

  return (
    <div className="space-y-8">
      <section aria-label="Totals" className="grid grid-cols-2 gap-px border border-border bg-border lg:grid-cols-3">
        {stats.map((s) => {
          const body = (
            <>
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{s.label}</p>
              <p className="mt-2 font-serif text-4xl text-indigo tabular-nums">{s.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.note}</p>
            </>
          );
          return s.href ? (
            <Link key={s.label} href={s.href} className="bg-white p-5 hover:bg-ivory/50">
              {body}
            </Link>
          ) : (
            <div key={s.label} className="bg-white p-5">
              {body}
            </div>
          );
        })}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="border border-border bg-white">
          <h2 className="border-b border-border px-5 py-4 font-sans text-sm font-semibold text-graphite">
            Recently changed
          </h2>
          {recentRecords.length === 0 ? (
            <p className="px-5 py-8 text-sm text-muted-foreground">Nothing yet. Records appear here as you add and edit them.</p>
          ) : (
            <ul className="divide-y divide-border">
              {recentRecords.map((r) => {
                const base = hrefIfReady(recordHref[r.table]);
                const title = base ? (
                  <Link href={`${base}/${r.id}`} className="font-medium text-indigo hover:underline">
                    {r.title}
                  </Link>
                ) : (
                  <span className="font-medium text-graphite">{r.title}</span>
                );
                return (
                  <li key={`${r.table}-${r.id}`} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
                    <div className="min-w-0">
                      <div className="truncate">{title}</div>
                      <div className="text-xs text-muted-foreground">
                        {TABLE_LABEL[r.table]} · {formatDateTime(r.updatedAt)}
                      </div>
                    </div>
                    <StatusBadge status={r.status} publishedAt={r.publishedAt} />
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="border border-border bg-white">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-sans text-sm font-semibold text-graphite">Recent activity</h2>
            <Link href="/admin/audit-log" className="inline-flex items-center gap-1 text-xs text-indigo hover:underline">
              Full audit log <ArrowRight className="size-3" aria-hidden />
            </Link>
          </div>
          {activity.length === 0 ? (
            <p className="px-5 py-8 text-sm text-muted-foreground">No activity recorded yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {activity.map((a) => (
                <li key={a.id} className="px-5 py-3 text-sm">
                  <span className="font-medium text-graphite">
                    {a.action === "insert" ? "Created" : a.action === "update" ? "Changed" : "Deleted"}
                  </span>{" "}
                  <span className="text-muted-foreground">{(AUDIT_TABLES[a.table_name] ?? a.table_name).toLowerCase()}</span>
                  {a.record_label ? <span className="text-graphite"> “{a.record_label}”</span> : null}
                  <div className="text-xs text-muted-foreground">
                    {a.actor_email ?? "System"} · {formatDateTime(a.occurred_at)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}
