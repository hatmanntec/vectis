import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/cms/page-parts";
import { StatusBadge } from "@/components/cms/status-badge";
import { PublishingPanel } from "@/components/cms/publishing-panel";
import { AttachmentsPanel } from "@/components/cms/attachments-panel";
import { getNews, newsCompanyOptions } from "@/features/news/queries";
import { deleteNews, publishNewsAt, setNewsStatus, updateNews } from "@/features/news/actions";
import { NewsForm } from "@/features/news/components/news-form";
import { isoToNigeriaTime } from "@/features/news/schema";
import { NEWS_TYPE_LABEL, type NewsType } from "@/features/news/labels";
import { getMediaByIds, listAttachments, toPicked } from "@/features/media/queries";
import { addMediaLink, moveMediaLink, removeMediaLink } from "@/features/media/link-actions";

export const metadata: Metadata = { title: "Edit news item" };

export default function EditNewsPage({ params }: PageProps<"/admin/news/[id]">) {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
      <Editor params={params} />
    </Suspense>
  );
}

async function Editor({ params }: { params: PageProps<"/admin/news/[id]">["params"] }) {
  const { id } = await params;
  const item = await getNews(id);
  if (!item) notFound();

  const [companies, media, gallery, documents] = await Promise.all([
    newsCompanyOptions(),
    getMediaByIds([item.cover_media_id]),
    listAttachments("news", item.id, "gallery"),
    listAttachments("news", item.id, "document"),
  ]);

  return (
    <>
      <PageHeader
        title={item.title}
        description={NEWS_TYPE_LABEL[item.news_type as NewsType]}
        breadcrumb={{ href: "/admin/news", label: "News & Media" }}
        actions={<StatusBadge status={item.status} publishedAt={item.published_at} />}
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="space-y-6">
          <NewsForm action={updateNews.bind(null, item.id)} item={item} companies={companies} cover={toPicked(media, item.cover_media_id)} />
          <AttachmentsPanel
            title="Gallery"
            description="Public photographs shown with the item, in this order."
            kind="image"
            items={gallery}
            add={addMediaLink.bind(null, "news", item.id, "gallery")}
            remove={removeMediaLink}
            move={moveMediaLink}
          />
          <AttachmentsPanel
            title="Supporting documents"
            description="e.g. the press release as a PDF. Public files can be downloaded from the website; private ones are for administrators only."
            kind="document"
            items={documents}
            add={addMediaLink.bind(null, "news", item.id, "document")}
            remove={removeMediaLink}
            move={moveMediaLink}
          />
        </div>
        <PublishingPanel
          noun="item"
          record={{ ...item, name: item.title }}
          setStatus={setNewsStatus.bind(null, item.id)}
          remove={deleteNews.bind(null, item.id)}
          deleteWarning="Its company tags, gallery and document links are removed with it; the files stay in the media library."
          schedule={{ action: publishNewsAt.bind(null, item.id), initial: isoToNigeriaTime(item.published_at) }}
        />
      </div>
    </>
  );
}
