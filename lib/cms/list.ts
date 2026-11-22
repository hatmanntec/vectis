/**
 * Shared logic for CMS list pages (tables of records).
 *
 * Search, filter, sort order and page number live in the page address
 * (e.g. /admin/sectors?q=oil&status=draft&sort=name&dir=asc&page=2), so
 * a filtered list can be bookmarked, shared or refreshed without losing its
 * place. Everything read from the address is checked against an allow-list
 * before it reaches the database.
 */

export const PAGE_SIZE = 20;

export type SortDir = "asc" | "desc";

export type ListParams = {
  q: string;
  status: string | null;
  sort: string;
  dir: SortDir;
  page: number;
  /** Any extra filters a module defines (e.g. table, action). */
  filters: Record<string, string>;
};

export type ListConfig = {
  /** Columns the user may sort by. The first is the default. */
  sortable: readonly string[];
  defaultDir?: SortDir;
  /** Allowed values for the status filter (omit if the list has none). */
  statuses?: readonly string[];
  /** Extra filters: name → allowed values. */
  filters?: Record<string, readonly string[]>;
};

type RawParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export function parseListParams(raw: RawParams, config: ListConfig): ListParams {
  const q = first(raw.q).trim().slice(0, 100);

  const statusRaw = first(raw.status);
  const status = config.statuses?.includes(statusRaw) ? statusRaw : null;

  const sortRaw = first(raw.sort);
  const sort = config.sortable.includes(sortRaw) ? sortRaw : config.sortable[0];

  const dirRaw = first(raw.dir);
  const dir: SortDir = dirRaw === "asc" || dirRaw === "desc" ? dirRaw : (config.defaultDir ?? "asc");

  const pageNum = Number.parseInt(first(raw.page), 10);
  const page = Number.isFinite(pageNum) && pageNum > 0 && pageNum < 10_000 ? pageNum : 1;

  const filters: Record<string, string> = {};
  for (const [name, allowed] of Object.entries(config.filters ?? {})) {
    const v = first(raw[name]);
    if (allowed.includes(v)) filters[name] = v;
  }

  return { q, status, sort, dir, page, filters };
}

/** Row range for the current page, as the database API expects (inclusive). */
export function pageRange(page: number): [number, number] {
  const from = (page - 1) * PAGE_SIZE;
  return [from, from + PAGE_SIZE - 1];
}

/**
 * Makes a search term safe for a database "contains" search: removes the
 * characters that have a special meaning in the query syntax.
 */
export function searchPattern(q: string): string {
  return `%${q.replace(/[%_\\,()*."]/g, " ").trim()}%`;
}

/** The current list address with some settings changed (used by links). */
export function listHref(
  pathname: string,
  params: ListParams,
  changes: Partial<{ q: string; status: string | null; sort: string; dir: SortDir; page: number }> &
    Record<string, string | number | null | undefined> = {},
): string {
  const merged: Record<string, string | number | null | undefined> = {
    q: params.q,
    status: params.status,
    sort: params.sort,
    dir: params.dir,
    page: params.page,
    ...params.filters,
    ...changes,
  };
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) {
    if (v === null || v === undefined || v === "") continue;
    if (k === "page" && Number(v) === 1) continue;
    sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `${pathname}?${s}` : pathname;
}
