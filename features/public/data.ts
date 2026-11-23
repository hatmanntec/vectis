import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import type { RichDoc } from "@/lib/cms/rich-text";

/**
 * Everything the public website reads. Every query runs as an anonymous
 * visitor, so the database itself only ever returns PUBLISHED content (and
 * never confidential investment figures, private files or enquiries).
 *
 * Results are kept for up to a minute ("site" cache profile in
 * next.config.ts), so the website stays fast and CMS changes, including
 * scheduled news, appear within about a minute.
 */

type Client = ReturnType<typeof createSupabasePublicClient>;

const db = () => createSupabasePublicClient();

export type Img = { url: string; alt: string; width: number | null; height: number | null } | null;
export type Doc = { url: string; name: string; size: number };

/** Public URLs (and alt text) for library files, by id. Private files are never returned. */
async function images(client: Client, ids: (string | null | undefined)[]) {
  const unique = [...new Set(ids.filter((x): x is string => Boolean(x)))];
  const out = new Map<string, NonNullable<Img> & { mime: string; size: number; name: string }>();
  if (!unique.length) return out;
  const { data } = await client
    .from("media")
    .select("id, path, alt_text, width, height, mime_type, size_bytes, file_name")
    .in("id", unique);
  for (const m of data ?? []) {
    out.set(m.id, {
      url: client.storage.from("public-media").getPublicUrl(m.path).data.publicUrl,
      alt: m.alt_text ?? "",
      width: m.width,
      height: m.height,
      mime: m.mime_type,
      size: m.size_bytes,
      name: m.file_name,
    });
  }
  return out;
}

const pick = (map: Awaited<ReturnType<typeof images>>, id: string | null | undefined): Img => {
  const m = id ? map.get(id) : undefined;
  return m ? { url: m.url, alt: m.alt, width: m.width, height: m.height } : null;
};

type Owner = "company_id" | "investment_id" | "project_id" | "news_id";

/** A record's public gallery images and public documents, in order. */
async function attachments(client: Client, owner: Owner, id: string) {
  const { data: links } = await client
    .from("media_links")
    .select("media_id, role, sort_order")
    .eq(owner, id)
    .order("sort_order");
  const files = await images(client, (links ?? []).map((l) => l.media_id));
  const gallery: NonNullable<Img>[] = [];
  const documents: Doc[] = [];
  for (const l of links ?? []) {
    const f = files.get(l.media_id);
    if (!f) continue;
    if (l.role === "gallery" && f.mime.startsWith("image/")) gallery.push({ url: f.url, alt: f.alt, width: f.width, height: f.height });
    if (l.role === "document") documents.push({ url: f.url, name: f.name, size: f.size });
  }
  return { gallery, documents };
}

// ---------------------------------------------------------------------
// Settings and pages
// ---------------------------------------------------------------------

export type Settings = {
  siteName: string;
  tagline: string | null;
  logo: Img;
  email: string | null;
  phone: string | null;
  address: string | null;
  social: { key: string; url: string }[];
  seoTitle: string | null;
  seoDescription: string | null;
  ogImage: Img;
};

export async function getSettings(): Promise<Settings> {
  "use cache";
  cacheLife("site");
  cacheTag("site");
  const client = db();
  const { data } = await client.from("website_settings").select("*").maybeSingle();
  const files = await images(client, [data?.logo_media_id, data?.og_image_media_id]);
  const social = Object.entries((data?.social_links ?? {}) as Record<string, string>)
    .filter(([, url]) => typeof url === "string" && /^https:\/\//.test(url))
    .map(([key, url]) => ({ key, url }));
  return {
    siteName: data?.site_name ?? "VECTIS",
    tagline: data?.tagline ?? null,
    logo: pick(files, data?.logo_media_id),
    email: data?.contact_email ?? null,
    phone: data?.contact_phone ?? null,
    address: data?.contact_address ?? null,
    social,
    seoTitle: data?.seo_default_title ?? null,
    seoDescription: data?.seo_default_description ?? null,
    ogImage: pick(files, data?.og_image_media_id),
  };
}

export type PageData = {
  key: string;
  title: string;
  slug: string | null;
  content: Record<string, unknown>;
  images: Record<string, Img>;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImage: Img;
  updatedAt: string;
};

async function loadPage(column: "page_key" | "slug", value: string, system: boolean): Promise<PageData | null> {
  const client = db();
  const { data } = await client
    .from("pages")
    .select("page_key, title, slug, content, og_image_media_id, seo_title, seo_description, updated_at, is_system")
    .eq(column, value)
    .eq("is_system", system)
    .maybeSingle();
  if (!data) return null;
  const content = (data.content ?? {}) as Record<string, unknown>;
  const imageKeys = Object.entries(content).filter(([, v]) => typeof v === "string" && /^[0-9a-f-]{36}$/i.test(v as string));
  const files = await images(client, [...imageKeys.map(([, v]) => v as string), data.og_image_media_id]);
  return {
    key: data.page_key,
    title: data.title,
    slug: data.slug,
    content,
    images: Object.fromEntries(imageKeys.map(([k, v]) => [k, pick(files, v as string)])),
    seoTitle: data.seo_title,
    seoDescription: data.seo_description,
    ogImage: pick(files, data.og_image_media_id),
    updatedAt: data.updated_at,
  };
}

/** A published core page (home, about, history…), or null. */
export async function getCorePage(key: string) {
  "use cache";
  cacheLife("site");
  cacheTag("site");
  return loadPage("page_key", key, true);
}

/** A published extra page by its address, or null. */
export async function getExtraPage(slug: string) {
  "use cache";
  cacheLife("site");
  cacheTag("site");
  return loadPage("slug", slug, false);
}

/** What exists on the website right now: drives the menu, footer and sitemap. */
export async function getSiteMap() {
  "use cache";
  cacheLife("site");
  cacheTag("site");
  const client = db();
  const count = async (table: "projects" | "news" | "investments" | "leadership" | "sectors") =>
    (await client.from(table).select("id", { count: "exact", head: true })).count ?? 0;
  const [{ data: pages }, projects, news, investments, leadership, sectors] = await Promise.all([
    client.from("pages").select("page_key, slug, title, is_system, updated_at"),
    count("projects"),
    count("news"),
    count("investments"),
    count("leadership"),
    count("sectors"),
  ]);
  const core = new Set((pages ?? []).filter((p) => p.is_system).map((p) => p.page_key));
  return {
    core,
    extra: (pages ?? []).filter((p) => !p.is_system && p.slug).map((p) => ({ slug: p.slug!, title: p.title })),
    counts: { projects, news, investments, leadership, sectors },
  };
}

// ---------------------------------------------------------------------
// Sectors and companies
// ---------------------------------------------------------------------

export async function listSectors() {
  "use cache";
  cacheLife("site");
  cacheTag("site");
  const client = db();
  const { data } = await client.from("sectors").select("id, name, slug, description, cover_media_id").order("sort_order").order("name");
  const files = await images(client, (data ?? []).map((s) => s.cover_media_id));
  return (data ?? []).map((s) => ({ ...s, cover: pick(files, s.cover_media_id) }));
}

export type CompanyCard = {
  id: string;
  name: string;
  slug: string;
  classification: string;
  shortDescription: string | null;
  logo: Img;
  sectors: { name: string; slug: string; primary: boolean }[];
};

async function companySectors(client: Client, ids: string[]) {
  if (!ids.length) return new Map<string, CompanyCard["sectors"]>();
  const { data } = await client.from("company_sectors").select("company_id, is_primary, sector_id").in("company_id", ids);
  const sectorIds = [...new Set((data ?? []).map((r) => r.sector_id))];
  const { data: sectors } = sectorIds.length
    ? await client.from("sectors").select("id, name, slug").in("id", sectorIds)
    : { data: [] as { id: string; name: string; slug: string }[] };
  const byId = new Map((sectors ?? []).map((s) => [s.id, s]));
  const out = new Map<string, CompanyCard["sectors"]>();
  for (const r of data ?? []) {
    const s = byId.get(r.sector_id);
    if (!s) continue; // unpublished sector
    const list = out.get(r.company_id) ?? [];
    list.push({ name: s.name, slug: s.slug, primary: r.is_primary });
    out.set(r.company_id, list.sort((a, b) => Number(b.primary) - Number(a.primary) || a.name.localeCompare(b.name)));
  }
  return out;
}

/** VECTIS's own businesses and subsidiaries. Outside companies are never listed as businesses. */
export async function listBusinesses(): Promise<CompanyCard[]> {
  "use cache";
  cacheLife("site");
  cacheTag("site");
  const client = db();
  const { data } = await client
    .from("companies")
    .select("id, name, slug, classification, short_description, logo_media_id, parent_company_id")
    // VECTIS itself (the parent organisation) has its own page; the lists show its businesses.
    .in("classification", ["business", "subsidiary"])
    .order("sort_order")
    .order("name");
  const rows = data ?? [];
  const [files, sectors] = await Promise.all([
    images(client, rows.map((c) => c.logo_media_id)),
    companySectors(client, rows.map((c) => c.id)),
  ]);
  return rows.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    classification: c.classification,
    shortDescription: c.short_description,
    logo: pick(files, c.logo_media_id),
    sectors: sectors.get(c.id) ?? [],
  }));
}

async function companyNames(client: Client, ids: string[]) {
  const unique = [...new Set(ids)];
  if (!unique.length) return new Map<string, { name: string; slug: string; classification: string; website: string | null; logo_media_id: string | null }>();
  const { data } = await client.from("companies").select("id, name, slug, classification, website, logo_media_id").in("id", unique);
  return new Map((data ?? []).map((c) => [c.id, c]));
}

/** A VECTIS business page with everything related to it that is published. */
export async function getBusiness(slug: string) {
  "use cache";
  cacheLife("site");
  cacheTag("site");
  const client = db();
  const { data: c } = await client.from("companies").select("*").eq("slug", slug).neq("classification", "external").maybeSingle();
  if (!c) return null;

  const [sectors, rels, invMade, invReceived, projects, newsTags, roles, children, att] = await Promise.all([
    companySectors(client, [c.id]),
    client
      .from("company_relationships")
      .select("from_company_id, to_company_id, relationship_type, description, start_date, end_date, sort_order")
      .or(`from_company_id.eq.${c.id},to_company_id.eq.${c.id}`)
      .order("sort_order"),
    client.from("investments").select("id, slug, nature, nature_note, investee_company_id").eq("investor_company_id", c.id).order("sort_order"),
    client.from("investments").select("id, slug, nature, nature_note, investor_company_id").eq("investee_company_id", c.id).order("sort_order"),
    client.from("projects").select("id, title, slug, summary, project_status, location_name, state, cover_media_id").eq("company_id", c.id).order("sort_order").order("title"),
    client.from("news_companies").select("news_id").eq("company_id", c.id),
    client.from("leadership_affiliations").select("leadership_id, role_title, sort_order").eq("company_id", c.id),
    client.from("companies").select("id, name, slug, classification, short_description").eq("parent_company_id", c.id).neq("classification", "external").order("sort_order").order("name"),
    attachments(client, "company_id", c.id),
  ]);

  const otherIds = [
    ...(rels.data ?? []).map((r) => (r.from_company_id === c.id ? r.to_company_id : r.from_company_id)),
    ...(invMade.data ?? []).map((i) => i.investee_company_id),
    ...(invReceived.data ?? []).map((i) => i.investor_company_id),
    ...(c.parent_company_id ? [c.parent_company_id] : []),
  ];
  const names = await companyNames(client, otherIds);

  const newsIds = (newsTags.data ?? []).map((t) => t.news_id);
  const { data: news } = newsIds.length
    ? await client.from("news").select("id, title, slug, news_type, published_at").in("id", newsIds).order("published_at", { ascending: false }).limit(6)
    : { data: [] as { id: string; title: string; slug: string; news_type: string; published_at: string | null }[] };

  const leaderIds = (roles.data ?? []).map((r) => r.leadership_id);
  const { data: people } = leaderIds.length
    ? await client.from("leadership").select("id, full_name, slug, job_title, photo_media_id, category, display_order").in("id", leaderIds)
    : { data: [] as { id: string; full_name: string; slug: string; job_title: string | null; photo_media_id: string | null; category: string; display_order: number }[] };
  const role = new Map((roles.data ?? []).map((r) => [r.leadership_id, r]));

  const files = await images(client, [
    c.logo_media_id,
    c.cover_media_id,
    ...(projects.data ?? []).map((p) => p.cover_media_id),
    ...(people ?? []).map((p) => p.photo_media_id),
  ]);

  const parent = c.parent_company_id ? names.get(c.parent_company_id) : undefined;
  const linkFor = (co: { slug: string; classification: string } | undefined) =>
    co && co.classification !== "external" ? `/businesses/${co.slug}` : null;

  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    classification: c.classification,
    shortDescription: c.short_description,
    description: c.full_description as RichDoc | null,
    establishedYear: c.established_year,
    website: c.website,
    email: c.email,
    phone: c.phone,
    address: c.address,
    logo: pick(files, c.logo_media_id),
    cover: pick(files, c.cover_media_id),
    seoTitle: c.seo_title,
    seoDescription: c.seo_description,
    parent: parent ? { name: parent.name, href: linkFor(parent) } : null,
    children: children.data ?? [],
    sectors: sectors.get(c.id) ?? [],
    relationships: (rels.data ?? [])
      .map((r) => {
        const other = names.get(r.from_company_id === c.id ? r.to_company_id : r.from_company_id);
        return other ? { ...r, otherName: other.name, otherHref: linkFor(other) } : null;
      })
      .filter((r): r is NonNullable<typeof r> => r !== null),
    investmentsMade: (invMade.data ?? [])
      .map((i) => ({ ...i, otherName: names.get(i.investee_company_id)?.name }))
      .filter((i) => i.otherName),
    investmentsReceived: (invReceived.data ?? [])
      .map((i) => ({ ...i, otherName: names.get(i.investor_company_id)?.name }))
      .filter((i) => i.otherName),
    projects: (projects.data ?? []).map((p) => ({ ...p, cover: pick(files, p.cover_media_id) })),
    news: news ?? [],
    people: (people ?? [])
      .map((p) => ({ ...p, role: role.get(p.id)?.role_title ?? null, order: role.get(p.id)?.sort_order ?? 0, photo: pick(files, p.photo_media_id) }))
      .sort((a, b) => a.order - b.order || a.full_name.localeCompare(b.full_name)),
    ...att,
  };
}

// ---------------------------------------------------------------------
// Investments
// ---------------------------------------------------------------------

export async function listInvestments() {
  "use cache";
  cacheLife("site");
  cacheTag("site");
  const client = db();
  const { data } = await client
    .from("investments")
    .select("id, slug, nature, nature_note, investment_status, investment_date, summary, logo_media_id, investor_company_id, investee_company_id")
    .order("sort_order")
    .order("investment_date", { ascending: false, nullsFirst: false });
  const rows = data ?? [];
  const names = await companyNames(client, rows.flatMap((r) => [r.investor_company_id, r.investee_company_id]));
  const files = await images(client, rows.map((r) => r.logo_media_id ?? names.get(r.investee_company_id)?.logo_media_id));
  return rows.map((r) => ({
    ...r,
    investor: names.get(r.investor_company_id)?.name ?? "",
    investee: names.get(r.investee_company_id)?.name ?? "",
    logo: pick(files, r.logo_media_id ?? names.get(r.investee_company_id)?.logo_media_id),
  }));
}

export async function getInvestment(slug: string) {
  "use cache";
  cacheLife("site");
  cacheTag("site");
  const client = db();
  const { data: i } = await client.from("investments").select("*").eq("slug", slug).maybeSingle();
  if (!i) return null;
  const names = await companyNames(client, [i.investor_company_id, i.investee_company_id]);
  const investor = names.get(i.investor_company_id);
  const investee = names.get(i.investee_company_id);
  if (!investor || !investee) return null;
  const [files, att] = await Promise.all([
    images(client, [i.logo_media_id ?? investee.logo_media_id]),
    attachments(client, "investment_id", i.id),
  ]);
  return {
    ...i,
    description: i.description as RichDoc | null,
    investor: { name: investor.name, href: investor.classification !== "external" ? `/businesses/${investor.slug}` : null },
    investee: {
      name: investee.name,
      href: investee.classification !== "external" ? `/businesses/${investee.slug}` : null,
      website: investee.website,
    },
    logo: pick(files, i.logo_media_id ?? investee.logo_media_id),
    ...att,
  };
}

// ---------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------

export async function listProjects() {
  "use cache";
  cacheLife("site");
  cacheTag("site");
  const client = db();
  const { data } = await client
    .from("projects")
    .select("id, title, slug, summary, project_status, location_name, state, country, start_date, end_date, cover_media_id, company_id, sector_id")
    .order("sort_order")
    .order("start_date", { ascending: false, nullsFirst: false });
  const rows = data ?? [];
  const [names, files, { data: sectors }] = await Promise.all([
    companyNames(client, rows.map((r) => r.company_id)),
    images(client, rows.map((r) => r.cover_media_id)),
    client.from("sectors").select("id, name, slug"),
  ]);
  const sector = new Map((sectors ?? []).map((s) => [s.id, s]));
  return rows.map((r) => ({
    ...r,
    company: names.get(r.company_id)?.name ?? "",
    sector: r.sector_id ? (sector.get(r.sector_id) ?? null) : null,
    cover: pick(files, r.cover_media_id),
  }));
}

export async function getProject(slug: string) {
  "use cache";
  cacheLife("site");
  cacheTag("site");
  const client = db();
  const { data: p } = await client.from("projects").select("*").eq("slug", slug).maybeSingle();
  if (!p) return null;
  const [names, { data: milestones }, { data: sector }, att] = await Promise.all([
    companyNames(client, [p.company_id]),
    client.from("project_milestones").select("id, title, description, milestone_date").eq("project_id", p.id).order("sort_order"),
    p.sector_id ? client.from("sectors").select("name, slug").eq("id", p.sector_id).maybeSingle() : Promise.resolve({ data: null }),
    attachments(client, "project_id", p.id),
  ]);
  const company = names.get(p.company_id);
  if (!company) return null;
  const files = await images(client, [p.cover_media_id]);
  return {
    ...p,
    description: p.description as RichDoc | null,
    company: { name: company.name, href: company.classification !== "external" ? `/businesses/${company.slug}` : null },
    sector,
    milestones: milestones ?? [],
    cover: pick(files, p.cover_media_id),
    latitude: p.latitude === null ? null : Number(p.latitude),
    longitude: p.longitude === null ? null : Number(p.longitude),
    ...att,
  };
}

// ---------------------------------------------------------------------
// News
// ---------------------------------------------------------------------

export const NEWS_PAGE_SIZE = 12;

export async function listNews(page: number, type: string | null) {
  "use cache";
  cacheLife("site");
  cacheTag("site");
  const client = db();
  let query = client
    .from("news")
    .select("id, title, slug, news_type, excerpt, is_featured, published_at, cover_media_id", { count: "exact" });
  if (type) query = query.eq("news_type", type as "article");
  const from = (page - 1) * NEWS_PAGE_SIZE;
  const { data, count } = await query
    .order("published_at", { ascending: false })
    .order("id")
    .range(from, from + NEWS_PAGE_SIZE - 1);
  const files = await images(client, (data ?? []).map((n) => n.cover_media_id));
  return {
    items: (data ?? []).map((n) => ({ ...n, cover: pick(files, n.cover_media_id) })),
    total: count ?? 0,
  };
}

/** The most recent items, featured ones first (for the home page). */
export async function latestNews(limit: number) {
  "use cache";
  cacheLife("site");
  cacheTag("site");
  const client = db();
  const { data } = await client
    .from("news")
    .select("id, title, slug, news_type, excerpt, is_featured, published_at, cover_media_id")
    .order("is_featured", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(limit);
  const files = await images(client, (data ?? []).map((n) => n.cover_media_id));
  return (data ?? []).map((n) => ({ ...n, cover: pick(files, n.cover_media_id) }));
}

export async function getNewsItem(slug: string) {
  "use cache";
  cacheLife("site");
  cacheTag("site");
  const client = db();
  const { data: n } = await client.from("news").select("*").eq("slug", slug).maybeSingle();
  if (!n) return null;
  const [{ data: tags }, att, files] = await Promise.all([
    client.from("news_companies").select("company_id").eq("news_id", n.id),
    attachments(client, "news_id", n.id),
    images(client, [n.cover_media_id]),
  ]);
  const names = await companyNames(client, (tags ?? []).map((t) => t.company_id));
  return {
    ...n,
    body: n.body as RichDoc | null,
    cover: pick(files, n.cover_media_id),
    companies: [...names.values()]
      .map((c) => ({ name: c.name, href: c.classification !== "external" ? `/businesses/${c.slug}` : null }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    ...att,
  };
}

// ---------------------------------------------------------------------
// Leadership
// ---------------------------------------------------------------------

export async function listLeadership() {
  "use cache";
  cacheLife("site");
  cacheTag("site");
  const client = db();
  const { data } = await client
    .from("leadership")
    .select("id, full_name, slug, job_title, category, photo_media_id, display_order")
    .order("display_order")
    .order("full_name");
  const files = await images(client, (data ?? []).map((p) => p.photo_media_id));
  return (data ?? []).map((p) => ({ ...p, photo: pick(files, p.photo_media_id) }));
}

export async function getLeader(slug: string) {
  "use cache";
  cacheLife("site");
  cacheTag("site");
  const client = db();
  const { data: p } = await client.from("leadership").select("*").eq("slug", slug).maybeSingle();
  if (!p) return null;
  const { data: roles } = await client
    .from("leadership_affiliations")
    .select("company_id, role_title, sort_order")
    .eq("leadership_id", p.id)
    .order("sort_order");
  const [names, files] = await Promise.all([
    companyNames(client, (roles ?? []).map((r) => r.company_id)),
    images(client, [p.photo_media_id]),
  ]);
  return {
    ...p,
    biography: p.biography as RichDoc | null,
    photo: pick(files, p.photo_media_id),
    roles: (roles ?? [])
      .map((r) => {
        const c = names.get(r.company_id);
        return c ? { company: c.name, href: c.classification !== "external" ? `/businesses/${c.slug}` : null, role: r.role_title } : null;
      })
      .filter((r): r is NonNullable<typeof r> => r !== null),
  };
}

/** Everything published, for sitemap.xml. */
export async function sitemapEntries() {
  "use cache";
  cacheLife("site");
  cacheTag("site");
  const client = db();
  const q = (table: "companies" | "investments" | "projects" | "news" | "leadership") =>
    client.from(table).select("slug, updated_at").limit(5000);
  const [companies, investments, projects, news, leadership] = await Promise.all([
    client.from("companies").select("slug, updated_at").neq("classification", "external").limit(5000),
    q("investments"),
    q("projects"),
    q("news"),
    q("leadership"),
  ]);
  return {
    businesses: companies.data ?? [],
    investments: investments.data ?? [],
    projects: projects.data ?? [],
    news: news.data ?? [],
    leadership: leadership.data ?? [],
  };
}

/**
 * For generateStaticParams: the build needs at least one entry per route,
 * so when nothing is published yet it gets a name that matches nothing
 * (that build-time page is simply "not found").
 */
export function withPlaceholder(params: { slug: string }[]) {
  return params.length ? params : [{ slug: "nothing-published-yet" }];
}
