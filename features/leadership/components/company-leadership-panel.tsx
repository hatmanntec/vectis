import Link from "next/link";
import { Panel } from "@/components/cms/page-parts";
import { StatusBadge } from "@/components/cms/status-badge";

type Row = { id: string; full_name: string; role_title: string | null; status: "draft" | "published" | "archived"; published_at: string | null };

/** People with a role in this company, on the company's edit page. */
export function CompanyLeadershipPanel({ rows }: { rows: Row[] }) {
  return (
    <Panel title="People" description="Leadership profiles with a role in this company. Roles are added on each person's profile.">
      {rows.length ? (
        <ul className="divide-y divide-border border border-border">
          {rows.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
              <span className="min-w-0">
                <Link href={`/admin/leadership/${r.id}`} className="font-medium text-indigo hover:underline">
                  {r.full_name}
                </Link>
                {r.role_title ? <span className="block text-xs text-muted-foreground">{r.role_title}</span> : null}
              </span>
              <StatusBadge status={r.status} publishedAt={r.published_at} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">None.</p>
      )}
    </Panel>
  );
}
