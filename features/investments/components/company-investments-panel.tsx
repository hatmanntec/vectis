import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/cms/page-parts";
import { StatusBadge } from "@/components/cms/status-badge";
import { NATURE_LABEL, type Nature } from "../labels";

type Row = {
  id: string;
  nature: string;
  status: "draft" | "published" | "archived";
  published_at: string | null;
  made: boolean;
  otherName: string;
};

/** Lists investments a company has made and received, on the company's edit page. */
export function CompanyInvestmentsPanel({
  companyId,
  canInvest,
  rows,
}: {
  companyId: string;
  canInvest: boolean;
  rows: Row[];
}) {
  const made = rows.filter((r) => r.made);
  const received = rows.filter((r) => !r.made);
  const list = (items: Row[], prefix: string) =>
    items.length ? (
      <ul className="divide-y divide-border border border-border">
        {items.map((r) => (
          <li key={r.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
            <span className="min-w-0">
              <Link href={`/admin/investments/${r.id}`} className="font-medium text-indigo hover:underline">
                {prefix} {r.otherName}
              </Link>
              <span className="block text-xs text-muted-foreground">{NATURE_LABEL[r.nature as Nature]}</span>
            </span>
            <StatusBadge status={r.status} publishedAt={r.published_at} />
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-sm text-muted-foreground">None.</p>
    );

  return (
    <Panel title="Investments" description="Investments this company has made or received. Edit them under Investments.">
      {canInvest ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Made</h3>
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/investments/new?investor=${companyId}`}>
                <Plus aria-hidden />
                New investment
              </Link>
            </Button>
          </div>
          {list(made, "In")}
        </div>
      ) : null}
      <div className="space-y-2">
        <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Received</h3>
        {list(received, "From")}
      </div>
    </Panel>
  );
}
