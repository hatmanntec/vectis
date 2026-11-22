import "server-only";
import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { pageRange, searchPattern, type ListConfig, type ListParams } from "@/lib/cms/list";
import { isImage, type Bucket } from "@/lib/media/rules";
import { OWNER_COLUMN, type LinkOwner } from "./link-owners";

type Supabase = Awaited<ReturnType<typeof createSupabaseServerClient>>;

export const MEDIA_LIST: ListConfig = {
  sortable: ["created_at", "file_name", "size_bytes"],
  defaultDir: "desc",
  filters: {
    category: ["logo", "photo", "document", "other"],
    bucket: ["public-media", "private-files"],
  },
};

export type MediaRow = {
  id: string;
  bucket: Bucket;
  path: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  caption: string | null;
  category: "logo" | "photo" | "document" | "other";
  created_at: string;
};

export type MediaWithUrl = MediaRow & { previewUrl: string | null };

const COLUMNS = "id, bucket, path, file_name, mime_type, size_bytes, width, height, alt_text, caption, category, created_at";

/**
 * Adds a viewable address to each file:
 *  - public files: their permanent public address
 *  - private images: a link that works for 1 hour only
 *  - private documents: none (opened on demand from the file's page)
 */
export async function withPreviewUrls(supabase: Supabase, rows: MediaRow[]): Promise<MediaWithUrl[]> {
  const privateImagePaths = rows.filter((r) => r.bucket === "private-files" && isImage(r.mime_type)).map((r) => r.path);
  const signed = new Map<string, string>();
  if (privateImagePaths.length) {
    const { data } = await supabase.storage.from("private-files").createSignedUrls(privateImagePaths, 3600);
    for (const s of data ?? []) if (s.path && s.signedUrl) signed.set(s.path, s.signedUrl);
  }
  return rows.map((r) => ({
    ...r,
    previewUrl:
      r.bucket === "public-media"
        ? supabase.storage.from("public-media").getPublicUrl(r.path).data.publicUrl
        : (signed.get(r.path) ?? null),
  }));
}

export async function listMedia(params: ListParams) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  let query = supabase.from("media").select(COLUMNS, { count: "exact" });
  if (params.q) {
    const p = searchPattern(params.q);
    query = query.or(`file_name.ilike.${p},alt_text.ilike.${p},caption.ilike.${p}`);
  }
  if (params.filters.category) query = query.eq("category", params.filters.category as "photo");
  if (params.filters.bucket) query = query.eq("bucket", params.filters.bucket);

  const [from, to] = pageRange(params.page);
  const { data, count, error } = await query
    .order(params.sort, { ascending: params.dir === "asc" })
    .order("id")
    .range(from, to);
  if (error) throw new Error(`Could not load the media library: ${error.message}`);
  return { rows: await withPreviewUrls(supabase, (data ?? []) as MediaRow[]), total: count ?? 0 };
}

export async function getMedia(id: string): Promise<MediaWithUrl | null> {
  await requireAdmin();
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("media").select(COLUMNS).eq("id", id).maybeSingle();
  if (!data) return null;
  return (await withPreviewUrls(supabase, [data as MediaRow]))[0];
}

/** Look up several files at once (used to show the images chosen in a form). */
export async function getMediaByIds(ids: (string | null | undefined)[]): Promise<Map<string, MediaWithUrl>> {
  const wanted = [...new Set(ids.filter((x): x is string => Boolean(x)))];
  if (!wanted.length) return new Map();
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("media").select(COLUMNS).in("id", wanted);
  const rows = await withPreviewUrls(supabase, (data ?? []) as MediaRow[]);
  return new Map(rows.map((r) => [r.id, r]));
}

export type MediaUse = { where: string; name: string; href: string | null };

/**
 * Everything that uses a file. A file in use cannot be deleted (the database
 * refuses), so the CMS shows this list instead of a delete that would fail.
 */
export async function mediaUsage(id: string): Promise<MediaUse[]> {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const uses: MediaUse[] = [];

  const checks = await Promise.all([
    supabase.from("companies").select("id, name").or(`logo_media_id.eq.${id},cover_media_id.eq.${id}`),
    supabase.from("investments").select("id, slug").eq("logo_media_id", id),
    supabase.from("projects").select("id, title").eq("cover_media_id", id),
    supabase.from("news").select("id, title").eq("cover_media_id", id),
    supabase.from("leadership").select("id, full_name").eq("photo_media_id", id),
    supabase.from("sectors").select("id, name").eq("cover_media_id", id),
    supabase.from("pages").select("id, title").eq("og_image_media_id", id),
    supabase.from("website_settings").select("id").or(`logo_media_id.eq.${id},og_image_media_id.eq.${id}`),
    supabase.from("media_links").select("id, role, company_id, investment_id, project_id, news_id, leadership_id").eq("media_id", id),
  ]);

  const [companies, investments, projects, news, leadership, sectors, pages, settings, links] = checks;
  for (const r of companies.data ?? []) uses.push({ where: "Company logo or cover", name: r.name, href: `/admin/companies/${r.id}` });
  for (const r of investments.data ?? []) uses.push({ where: "Investment logo", name: r.slug, href: `/admin/investments/${r.id}` });
  for (const r of projects.data ?? []) uses.push({ where: "Project cover image", name: r.title, href: `/admin/projects/${r.id}` });
  for (const r of news.data ?? []) uses.push({ where: "News cover image", name: r.title, href: `/admin/news/${r.id}` });
  for (const r of leadership.data ?? []) uses.push({ where: "Leadership", name: r.full_name, href: null });
  for (const r of sectors.data ?? []) uses.push({ where: "Sector cover image", name: r.name, href: `/admin/sectors/${r.id}` });
  for (const r of pages.data ?? []) uses.push({ where: "Website page", name: r.title, href: null });
  if ((settings.data ?? []).length) uses.push({ where: "Website settings", name: "Logo or sharing image", href: "/admin/settings" });
  const linkedCompanyIds = (links.data ?? []).map((l) => l.company_id).filter((x): x is string => Boolean(x));
  const { data: linkedCompanies } = linkedCompanyIds.length
    ? await supabase.from("companies").select("id, name").in("id", linkedCompanyIds)
    : { data: [] as { id: string; name: string }[] };
  const companyName = new Map((linkedCompanies ?? []).map((c) => [c.id, c.name]));
  for (const r of links.data ?? []) {
    const where = r.role === "gallery" ? "Gallery image" : "Supporting document";
    if (r.company_id) {
      uses.push({ where: `${where} (company)`, name: companyName.get(r.company_id) ?? "A company", href: `/admin/companies/${r.company_id}` });
    } else if (r.news_id) {
      uses.push({ where: `${where} (news)`, name: "A news item", href: `/admin/news/${r.news_id}` });
    } else if (r.project_id) {
      uses.push({ where: `${where} (project)`, name: "A project", href: `/admin/projects/${r.project_id}` });
    } else if (r.investment_id) {
      uses.push({ where: `${where} (investment)`, name: "An investment", href: `/admin/investments/${r.investment_id}` });
    } else {
      uses.push({ where, name: "Attached to a record", href: null });
    }
  }
  return uses;
}

/**
 * Files for the picker dialog, newest first.
 *  image:    public images only (they appear on the website)
 *  document: PDF, Word and Excel files, public or private
 */
export async function searchMediaForPicker(q: string, page: number, kind: "image" | "document") {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  let query = supabase.from("media").select(COLUMNS, { count: "exact" });
  if (kind === "image") {
    query = query.eq("bucket", "public-media").in("mime_type", ["image/jpeg", "image/png", "image/webp"]);
  } else {
    query = query.in("mime_type", [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ]);
  }
  if (q) {
    const p = searchPattern(q);
    query = query.or(`file_name.ilike.${p},alt_text.ilike.${p}`);
  }
  const from = (page - 1) * 12;
  const { data, count } = await query.order("created_at", { ascending: false }).order("id").range(from, from + 11);
  return { items: await withPreviewUrls(supabase, (data ?? []) as MediaRow[]), total: count ?? 0 };
}

/** The shape the "Choose image" field expects, for one chosen file (or none). */
export function toPicked(map: Map<string, MediaWithUrl>, id: string | null | undefined) {
  const m = id ? map.get(id) : undefined;
  return m ? { id: m.id, file_name: m.file_name, alt_text: m.alt_text, previewUrl: m.previewUrl } : null;
}

export type AttachedFile = {
  linkId: string;
  mediaId: string;
  file_name: string;
  mime_type: string;
  bucket: Bucket;
  alt_text: string | null;
  previewUrl: string | null;
};

/** A record's gallery or documents, in display order. */
export async function listAttachments(
  owner: LinkOwner,
  ownerId: string,
  role: "gallery" | "document",
): Promise<AttachedFile[]> {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { data: links } = await supabase
    .from("media_links")
    .select("id, media_id, sort_order, created_at")
    .eq(OWNER_COLUMN[owner], ownerId)
    .eq("role", role)
    .order("sort_order")
    .order("created_at");
  if (!links?.length) return [];
  const media = await getMediaByIds(links.map((l) => l.media_id));
  return links
    .map((l) => {
      const m = media.get(l.media_id);
      return m
        ? {
            linkId: l.id,
            mediaId: m.id,
            file_name: m.file_name,
            mime_type: m.mime_type,
            bucket: m.bucket,
            alt_text: m.alt_text,
            previewUrl: m.previewUrl,
          }
        : null;
    })
    .filter((x): x is AttachedFile => x !== null);
}
