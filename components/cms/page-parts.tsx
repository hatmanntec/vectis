import Link from "next/link";
import { ChevronDown, ChevronUp, ChevronsUpDown, type LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { listHref, PAGE_SIZE, type ListParams } from "@/lib/cms/list";
import { cn } from "@/lib/utils";

/** Title row at the top of every CMS page. */
export function PageHeader({
  title,
  description,
  actions,
  breadcrumb,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumb?: { href: string; label: string };
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {breadcrumb ? (
          <Link
            href={breadcrumb.href}
            className="mb-2 inline-block text-xs font-medium tracking-wide text-muted-foreground uppercase hover:text-indigo"
          >
            ← {breadcrumb.label}
          </Link>
        ) : null}
        <h1 className="text-3xl">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

/** Shown when a list has no records (or none match the search). */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center border border-dashed border-steel bg-white px-6 py-14 text-center">
      <Icon className="size-8 text-steel" aria-hidden />
      <h2 className="mt-4 font-sans text-base font-semibold text-graphite">{title}</h2>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

/** Grey placeholder rows while a table loads. */
export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="border border-border bg-white" aria-busy="true" aria-label="Loading">
      <div className="border-b border-border px-4 py-3">
        <Skeleton className="h-4 w-48" />
      </div>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex gap-6 border-b border-border px-4 py-4 last:border-0">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/6" />
          <Skeleton className="h-4 w-1/6" />
        </div>
      ))}
    </div>
  );
}

/** A clickable column heading that sorts the list by that column. */
export function SortHeader({
  pathname,
  params,
  column,
  children,
  className,
}: {
  pathname: string;
  params: ListParams;
  column: string;
  children: React.ReactNode;
  className?: string;
}) {
  const active = params.sort === column;
  const nextDir = active && params.dir === "asc" ? "desc" : "asc";
  const Icon = !active ? ChevronsUpDown : params.dir === "asc" ? ChevronUp : ChevronDown;
  return (
    <th
      scope="col"
      aria-sort={active ? (params.dir === "asc" ? "ascending" : "descending") : "none"}
      className={cn("px-4 py-3 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase", className)}
    >
      <Link
        href={listHref(pathname, params, { sort: column, dir: nextDir, page: 1 })}
        className={cn("inline-flex items-center gap-1 hover:text-indigo", active && "text-indigo")}
      >
        {children}
        <Icon className="size-3.5" aria-hidden />
      </Link>
    </th>
  );
}

/** "Showing 21–40 of 57" with Previous / Next. */
export function Pagination({
  pathname,
  params,
  total,
}: {
  pathname: string;
  params: ListParams;
  total: number;
}) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (total === 0) return null;
  const from = (params.page - 1) * PAGE_SIZE + 1;
  const to = Math.min(params.page * PAGE_SIZE, total);
  const linkClass =
    "inline-flex h-8 items-center border border-border bg-white px-3 text-sm hover:border-indigo hover:text-indigo";
  const disabledClass = "inline-flex h-8 items-center border border-border px-3 text-sm text-muted-foreground opacity-50";

  return (
    <nav aria-label="Pages" className="mt-4 flex items-center justify-between gap-4 text-sm text-muted-foreground">
      <p>
        Showing {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-2">
        {params.page > 1 ? (
          <Link className={linkClass} href={listHref(pathname, params, { page: params.page - 1 })}>
            Previous
          </Link>
        ) : (
          <span className={disabledClass}>Previous</span>
        )}
        <span className="px-1">
          Page {params.page} of {pages}
        </span>
        {params.page < pages ? (
          <Link className={linkClass} href={listHref(pathname, params, { page: params.page + 1 })}>
            Next
          </Link>
        ) : (
          <span className={disabledClass}>Next</span>
        )}
      </div>
    </nav>
  );
}

/** A labelled section box used on edit pages. */
export function Panel({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="border border-border bg-white">
      <div className="border-b border-border px-5 py-4">
        <h2 className="font-sans text-sm font-semibold text-graphite">{title}</h2>
        {description ? <p className="mt-1 text-xs text-muted-foreground">{description}</p> : null}
      </div>
      <div className="space-y-5 px-5 py-5">{children}</div>
    </section>
  );
}
