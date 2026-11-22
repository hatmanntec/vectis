import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Mail, MailOpen, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/cms/page-parts";
import { ConfirmAction } from "@/components/cms/confirm-action";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/cms/status";
import { getEnquiry } from "@/features/enquiries/queries";
import { deleteEnquiry, setEnquiryRead } from "@/features/enquiries/actions";
import { MarkReadOnOpen } from "@/features/enquiries/components/mark-read-on-open";

export const metadata: Metadata = { title: "Enquiry" };

export default function EnquiryPage({ params }: PageProps<"/admin/enquiries/[id]">) {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
      <Detail params={params} />
    </Suspense>
  );
}

async function Detail({ params }: { params: PageProps<"/admin/enquiries/[id]">["params"] }) {
  const { id } = await params;
  const e = await getEnquiry(id);
  if (!e) notFound();

  const replySubject = `Re: ${e.subject ?? "Your enquiry to VECTIS"}`;
  const mailto = `mailto:${encodeURIComponent(e.email)}?subject=${encodeURIComponent(replySubject)}`;

  return (
    <>
      <MarkReadOnOpen key={e.id} unread={!e.is_read} markRead={setEnquiryRead.bind(null, e.id, true)} />
      <PageHeader
        title={e.subject ?? "(No subject)"}
        description={`From ${e.name} · ${formatDateTime(e.created_at)}`}
        breadcrumb={{ href: "/admin/enquiries", label: "Enquiries" }}
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <section className="border border-border bg-white" aria-label="Message">
          <dl className="grid gap-x-6 gap-y-2 border-b border-border px-5 py-4 text-sm sm:grid-cols-[8rem_minmax(0,1fr)]">
            <dt className="text-muted-foreground">Name</dt>
            <dd>{e.name}</dd>
            <dt className="text-muted-foreground">Email</dt>
            <dd>
              <a href={`mailto:${e.email}`} className="text-indigo hover:underline">
                {e.email}
              </a>
            </dd>
            {e.phone ? (
              <>
                <dt className="text-muted-foreground">Phone</dt>
                <dd>
                  <a href={`tel:${e.phone.replace(/[^\d+]/g, "")}`} className="text-indigo hover:underline">
                    {e.phone}
                  </a>
                </dd>
              </>
            ) : null}
            {e.organisation ? (
              <>
                <dt className="text-muted-foreground">Organisation</dt>
                <dd>{e.organisation}</dd>
              </>
            ) : null}
          </dl>
          <p className="px-5 py-5 text-sm leading-relaxed whitespace-pre-line text-graphite">{e.message}</p>
        </section>
        <aside className="space-y-3 border border-border bg-white px-5 py-5 [&_a]:w-full [&_a]:justify-start [&_button]:w-full [&_button]:justify-start">
          <Button asChild>
            <a href={mailto}>
              <Mail aria-hidden />
              Reply by email
            </a>
          </Button>
          <ConfirmAction
            action={setEnquiryRead.bind(null, e.id, false)}
            label="Mark as unread"
            icon={<MailOpen aria-hidden />}
            successMessage="Marked as unread."
          />
          <ConfirmAction
            action={deleteEnquiry.bind(null, e.id)}
            label="Delete"
            icon={<Trash2 aria-hidden />}
            variant="destructive"
            successMessage="Deleted."
            confirm={{
              title: "Delete this enquiry?",
              description: "The message is removed permanently. This cannot be undone.",
              confirmLabel: "Delete",
              destructive: true,
            }}
          />
          <p className="text-xs text-muted-foreground">Replies open in your email program; they are not stored here.</p>
        </aside>
      </div>
    </>
  );
}
