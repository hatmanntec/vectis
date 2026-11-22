import { Archive, ArchiveRestore, EyeOff, Send, Trash2 } from "lucide-react";
import { ConfirmAction } from "@/components/cms/confirm-action";
import { ScheduleForm } from "@/components/cms/schedule-form";
import { displayStatus, formatDateTime, type ContentStatus } from "@/lib/cms/status";
import type { ActionResult } from "@/lib/cms/results";

/**
 * The "Publishing" box on every edit page: Publish / Unpublish / Archive /
 * Restore / Delete permanently, plus the record's dates. Delete is only
 * offered for archived records (the database enforces the same rule).
 */
export function PublishingPanel({
  noun,
  record,
  setStatus,
  remove,
  deleteWarning,
  publishWarning,
  schedule,
}: {
  /** e.g. "company", used in messages. */
  noun: string;
  record: {
    status: ContentStatus;
    published_at: string | null;
    created_at: string;
    updated_at: string;
    archived_at: string | null;
    name: string;
  };
  setStatus: (status: "published" | "draft" | "archived") => Promise<ActionResult>;
  remove: () => Promise<ActionResult>;
  /** Extra sentence for the delete dialog, e.g. what still uses the record. */
  deleteWarning?: string;
  /** Shown above the Publish button, e.g. a reminder that the parent is unpublished. */
  publishWarning?: string;
  /** Offer "publish at a chosen time" (scheduling and back-dating). `initial` is in Nigeria time. */
  schedule?: { action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>; initial: string };
}) {
  const s = record.status;
  const scheduled = displayStatus(s, record.published_at) === "Scheduled";
  return (
    <aside className="space-y-6">
      <section className="border border-border bg-white">
        <h2 className="border-b border-border px-5 py-4 font-sans text-sm font-semibold text-graphite">Publishing</h2>
        <div className="flex flex-col gap-2 px-5 py-5 [&_button]:w-full [&_button]:justify-start">
          {s === "draft" ? (
            <>
              {publishWarning ? <p className="mb-1 text-xs text-muted-foreground">{publishWarning}</p> : null}
              <ConfirmAction
                action={setStatus.bind(null, "published")}
                label="Publish"
                icon={<Send aria-hidden />}
                variant="default"
                successMessage="Published."
              />
            </>
          ) : null}
          {scheduled ? (
            <>
              <p className="mb-1 text-xs text-muted-foreground">
                Scheduled: appears on the website on {formatDateTime(record.published_at)} (Nigeria time).
              </p>
              <ConfirmAction
                action={setStatus.bind(null, "published")}
                label="Publish now"
                icon={<Send aria-hidden />}
                variant="default"
                successMessage="Published."
              />
              <ConfirmAction
                action={setStatus.bind(null, "draft")}
                label="Cancel schedule"
                icon={<EyeOff aria-hidden />}
                successMessage="Schedule cancelled; moved back to draft."
                confirm={{
                  title: `Cancel this ${noun}'s schedule?`,
                  description: "It goes back to being a draft and won't appear on the website until you publish it.",
                  confirmLabel: "Cancel schedule",
                }}
              />
            </>
          ) : null}
          {s === "published" && !scheduled ? (
            <ConfirmAction
              action={setStatus.bind(null, "draft")}
              label="Unpublish"
              icon={<EyeOff aria-hidden />}
              successMessage="Moved back to draft."
              confirm={{
                title: `Unpublish this ${noun}?`,
                description: "It will disappear from the website until you publish it again.",
                confirmLabel: "Unpublish",
              }}
            />
          ) : null}
          {schedule && s !== "archived" ? (
            <ScheduleForm
              action={schedule.action}
              initial={schedule.initial}
              label={s === "draft" ? "Schedule or back-date…" : "Change publication date…"}
            />
          ) : null}
          {s !== "archived" ? (
            <ConfirmAction
              action={setStatus.bind(null, "archived")}
              label="Archive"
              icon={<Archive aria-hidden />}
              successMessage="Archived."
              confirm={{
                title: `Archive this ${noun}?`,
                description: "It will be hidden everywhere. You can restore it later from the Archived filter.",
                confirmLabel: "Archive",
              }}
            />
          ) : (
            <>
              <ConfirmAction
                action={setStatus.bind(null, "draft")}
                label="Restore as draft"
                icon={<ArchiveRestore aria-hidden />}
                successMessage="Restored as a draft."
              />
              <ConfirmAction
                action={remove}
                label="Delete permanently"
                icon={<Trash2 aria-hidden />}
                variant="destructive"
                successMessage="Deleted."
                confirm={{
                  title: `Delete "${record.name}" permanently?`,
                  description: `This cannot be undone.${deleteWarning ? ` ${deleteWarning}` : ""}`,
                  confirmLabel: "Delete permanently",
                  destructive: true,
                }}
              />
            </>
          )}
        </div>
      </section>

      <section className="border border-border bg-white px-5 py-4 text-xs text-muted-foreground">
        <dl className="space-y-2">
          <div className="flex justify-between gap-2"><dt>Created</dt><dd>{formatDateTime(record.created_at)}</dd></div>
          <div className="flex justify-between gap-2"><dt>Last changed</dt><dd>{formatDateTime(record.updated_at)}</dd></div>
          <div className="flex justify-between gap-2"><dt>Published</dt><dd>{formatDateTime(record.published_at)}</dd></div>
          {record.archived_at ? (
            <div className="flex justify-between gap-2"><dt>Archived</dt><dd>{formatDateTime(record.archived_at)}</dd></div>
          ) : null}
        </dl>
      </section>
    </aside>
  );
}
