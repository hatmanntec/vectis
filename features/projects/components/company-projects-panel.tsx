import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/cms/page-parts";
import { StatusBadge } from "@/components/cms/status-badge";
import { PROJECT_STATUS_LABEL, type ProjectStatus } from "../labels";

type Row = {
  id: string;
  title: string;
  project_status: string;
  status: "draft" | "published" | "archived";
  published_at: string | null;
};

/** Projects run by a company, on the company's edit page. */
export function CompanyProjectsPanel({ companyId, rows }: { companyId: string; rows: Row[] }) {
  return (
    <Panel title="Projects" description="Projects this company runs. Edit them under Projects.">
      <div className="flex justify-end">
        <Button asChild variant="outline" size="sm">
          <Link href={`/admin/projects/new?company=${companyId}`}>
            <Plus aria-hidden />
            New project
          </Link>
        </Button>
      </div>
      {rows.length ? (
        <ul className="divide-y divide-border border border-border">
          {rows.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
              <span className="min-w-0">
                <Link href={`/admin/projects/${r.id}`} className="font-medium text-indigo hover:underline">
                  {r.title}
                </Link>
                <span className="block text-xs text-muted-foreground">{PROJECT_STATUS_LABEL[r.project_status as ProjectStatus]}</span>
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
