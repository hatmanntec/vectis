import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/cms/page-parts";
import { StatusBadge } from "@/components/cms/status-badge";
import { formatDate } from "@/lib/cms/status";
import { NEWS_TYPE_LABEL, type NewsType } from "../labels";

type Row = {
  id: string;
  title: string;
  news_type: string;
  status: "draft" | "published" | "archived";
  published_at: string | null;
};

/** News items tagged with a company, on the company's edit page (latest 20). */
export function CompanyNewsPanel({ companyId, rows }: { companyId: string; rows: Row[] }) {
  return (
    <Panel title="News" description="Items tagged with this company. Edit them under News & Media.">
      <div className="flex justify-end">
        <Button asChild variant="outline" size="sm">
          <Link href={`/admin/news/new?company=${companyId}`}>
            <Plus aria-hidden />
            New item
          </Link>
        </Button>
      </div>
      {rows.length ? (
        <ul className="divide-y divide-border border border-border">
          {rows.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
              <span className="min-w-0">
                <Link href={`/admin/news/${r.id}`} className="font-medium text-indigo hover:underline">
                  {r.title}
                </Link>
                <span className="block text-xs text-muted-foreground">
                  {NEWS_TYPE_LABEL[r.news_type as NewsType]}
                  {r.published_at ? ` · ${formatDate(r.published_at)}` : ""}
                </span>
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
