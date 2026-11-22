import { cn } from "@/lib/utils";
import { displayStatus, type ContentStatus } from "@/lib/cms/status";

const styles = {
  Draft: "border-steel bg-white text-graphite",
  Published: "border-teal/30 bg-teal/10 text-teal",
  Scheduled: "border-indigo/30 bg-indigo/5 text-indigo",
  Archived: "border-border bg-muted text-muted-foreground",
} as const;

/** Draft / Published / Scheduled / Archived, with a consistent look everywhere. */
export function StatusBadge({ status, publishedAt }: { status: ContentStatus; publishedAt: string | null }) {
  const label = displayStatus(status, publishedAt);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        styles[label],
      )}
    >
      {label}
    </span>
  );
}
