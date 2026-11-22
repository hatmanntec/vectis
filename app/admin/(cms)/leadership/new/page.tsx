import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { PageHeader } from "@/components/cms/page-parts";
import { createLeader } from "@/features/leadership/actions";
import { LeaderForm } from "@/features/leadership/components/leader-form";

export const metadata: Metadata = { title: "New leadership profile" };

export default function NewLeaderPage() {
  return (
    <>
      <PageHeader
        title="New leadership profile"
        description="Saved as a draft. Roles in companies can be added after creating it."
        breadcrumb={{ href: "/admin/leadership", label: "Leadership" }}
      />
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
        <Form />
      </Suspense>
    </>
  );
}

// Rendered per visit: the text editor can't be pre-built.
async function Form() {
  await connection();
  return <LeaderForm action={createLeader} />;
}
