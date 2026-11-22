import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/cms/page-parts";
import { StatusBadge } from "@/components/cms/status-badge";
import { PublishingPanel } from "@/components/cms/publishing-panel";
import { getPage } from "@/features/pages/queries";
import { deletePage, setPageStatus, updatePage } from "@/features/pages/actions";
import { PageForm } from "@/features/pages/components/page-form";
import { allFields, templateFor } from "@/features/pages/templates";
import { getMediaByIds, toPicked } from "@/features/media/queries";

export const metadata: Metadata = { title: "Edit page" };

export default function EditPagePage({ params }: PageProps<"/admin/pages/[id]">) {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
      <Editor params={params} />
    </Suspense>
  );
}

async function Editor({ params }: { params: PageProps<"/admin/pages/[id]">["params"] }) {
  const { id } = await params;
  const page = await getPage(id);
  if (!page) notFound();

  const template = templateFor(page.template);
  const content = (page.content ?? {}) as Record<string, unknown>;
  const imageFields = allFields(template).filter((f) => f.kind === "image");
  const imageId = (k: string) => (typeof content[k] === "string" ? (content[k] as string) : null);
  const media = await getMediaByIds([...imageFields.map((f) => imageId(f.key)), page.og_image_media_id]);
  const images = Object.fromEntries([
    ...imageFields.map((f) => [f.key, toPicked(media, imageId(f.key))] as const),
    ["og_image", toPicked(media, page.og_image_media_id)] as const,
  ]);

  return (
    <>
      <PageHeader
        title={page.title}
        description={page.is_system ? `Core page · /${page.page_key === "home" ? "" : page.page_key}` : `Extra page · /${page.slug}`}
        breadcrumb={{ href: "/admin/pages", label: "Website Pages" }}
        actions={<StatusBadge status={page.status} publishedAt={page.published_at} />}
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <PageForm
          action={updatePage.bind(null, page.id)}
          template={template}
          page={{ ...page, content }}
          images={images}
        />
        <PublishingPanel
          noun="page"
          record={{ ...page, name: page.title }}
          setStatus={setPageStatus.bind(null, page.id)}
          remove={deletePage.bind(null, page.id)}
          allowArchive={!page.is_system}
        />
      </div>
    </>
  );
}
