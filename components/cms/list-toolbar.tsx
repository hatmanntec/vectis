"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

type FilterDef = {
  name: string;
  label: string;
  options: { value: string; label: string }[];
};

/**
 * Search box and filter menus above a list. Changes are written into the
 * page address, which reloads the list on the server with the new settings.
 */
export function ListToolbar({
  searchPlaceholder,
  filters = [],
}: {
  searchPlaceholder: string;
  filters?: FilterDef[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const lastPushed = useRef(searchParams.get("q") ?? "");

  function update(changes: Record<string, string | null>) {
    const sp = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(changes)) {
      if (v) sp.set(k, v);
      else sp.delete(k);
    }
    sp.delete("page"); // any change starts again at page 1
    const s = sp.toString();
    startTransition(() => router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false }));
  }

  // Search as you type, after a short pause.
  useEffect(() => {
    if (q.trim() === lastPushed.current) return;
    const t = setTimeout(() => {
      lastPushed.current = q.trim();
      update({ q: q.trim() || null });
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          className="bg-white pr-9 pl-9"
        />
        {pending ? (
          <Loader2 className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground" aria-label="Loading" />
        ) : q ? (
          <button
            type="button"
            onClick={() => setQ("")}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-graphite"
            aria-label="Clear search"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>

      {filters.map((f) => (
        <label key={f.name} className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{f.label}</span>
          <select
            value={searchParams.get(f.name) ?? ""}
            onChange={(e) => update({ [f.name]: e.target.value || null })}
            className="h-9 border border-input bg-white px-3 text-sm text-graphite outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <option value="">All</option>
            {f.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      ))}
    </div>
  );
}
