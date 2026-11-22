import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/cms/page-parts";
import { StatusBadge } from "@/components/cms/status-badge";
import { PublishingPanel } from "@/components/cms/publishing-panel";
import { getLeader, leadershipCompanyOptions, listRoles } from "@/features/leadership/queries";
import {
  addRole,
  deleteLeader,
  moveRole,
  removeRole,
  setLeaderStatus,
  updateLeader,
  updateRoleTitle,
} from "@/features/leadership/actions";
import { LeaderForm } from "@/features/leadership/components/leader-form";
import { RolesPanel } from "@/features/leadership/components/roles-panel";
import { CATEGORY_LABEL, type LeadershipCategory } from "@/features/leadership/labels";
import { getMediaByIds, toPicked } from "@/features/media/queries";

export const metadata: Metadata = { title: "Edit leadership profile" };

export default function EditLeaderPage({ params }: PageProps<"/admin/leadership/[id]">) {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
      <Editor params={params} />
    </Suspense>
  );
}

async function Editor({ params }: { params: PageProps<"/admin/leadership/[id]">["params"] }) {
  const { id } = await params;
  const leader = await getLeader(id);
  if (!leader) notFound();

  const [media, roles, companies] = await Promise.all([
    getMediaByIds([leader.photo_media_id]),
    listRoles(leader.id),
    leadershipCompanyOptions(),
  ]);

  return (
    <>
      <PageHeader
        title={leader.full_name}
        description={[leader.job_title, CATEGORY_LABEL[leader.category as LeadershipCategory]].filter(Boolean).join(" · ")}
        breadcrumb={{ href: "/admin/leadership", label: "Leadership" }}
        actions={<StatusBadge status={leader.status} publishedAt={leader.published_at} />}
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="space-y-6">
          <LeaderForm action={updateLeader.bind(null, leader.id)} leader={leader} photo={toPicked(media, leader.photo_media_id)} />
          <RolesPanel
            roles={roles}
            companies={companies}
            add={addRole.bind(null, leader.id)}
            save={updateRoleTitle.bind(null, leader.id)}
            remove={removeRole.bind(null, leader.id)}
            move={moveRole.bind(null, leader.id)}
          />
        </div>
        <PublishingPanel
          noun="profile"
          record={{ ...leader, name: leader.full_name }}
          setStatus={setLeaderStatus.bind(null, leader.id)}
          remove={deleteLeader.bind(null, leader.id)}
          deleteWarning="Their company roles are removed with the profile; the photo stays in the media library."
        />
      </div>
    </>
  );
}
