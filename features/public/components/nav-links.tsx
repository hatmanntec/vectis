"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { groupLinks, isActive, isGroup, type NavGroup, type NavItem } from "./nav";

/** The desktop menu, with the current section highlighted. */
export function NavLinks({ items }: { items: NavItem[] }) {
  return <DesktopNav items={items} pathname={usePathname()} />;
}

/** The same menu without highlighting (shown for an instant while the page address is read). */
export function PlainNavLinks({ items }: { items: NavItem[] }) {
  return <DesktopNav items={items} pathname="" />;
}

const itemClass = (active: boolean) =>
  `relative flex h-11 items-center gap-1 px-3 text-[0.9375rem] font-medium transition-colors duration-200 after:absolute after:inset-x-3 after:bottom-1 after:h-0.5 after:transition-colors after:duration-200 ${
    active ? "text-indigo after:bg-copper" : "text-graphite after:bg-transparent hover:text-indigo hover:after:bg-steel"
  }`;

function DesktopNav({ items, pathname }: { items: NavItem[]; pathname: string }) {
  const [open, setOpen] = useState<string | null>(null);
  const [lastPath, setLastPath] = useState(pathname);
  // Close any open panel after navigating.
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(null);
  }
  return (
    <ul className="flex items-center">
      {items.map((item) =>
        isGroup(item) ? (
          <Dropdown
            key={item.label}
            group={item}
            pathname={pathname}
            open={open === item.label}
            onOpenChange={(o) => setOpen((cur) => (o ? item.label : cur === item.label ? null : cur))}
          />
        ) : (
          <li key={item.href}>
            <Link href={item.href} aria-current={pathname === item.href ? "page" : undefined} className={itemClass(isActive(item.href, pathname))}>
              {item.label}
            </Link>
          </li>
        ),
      )}
    </ul>
  );
}

/**
 * A menu entry that opens a full-width panel. Built as a "disclosure" (a
 * button that shows and hides a list of links), the pattern recommended for
 * website menus: it opens on hover with a mouse, on click or tap, and with
 * Enter, Space or the down arrow; arrows move between links; Esc closes it
 * and returns to the button; moving focus or the pointer away closes it.
 */
function Dropdown({
  group,
  pathname,
  open,
  onOpenChange: setOpen,
}: {
  group: NavGroup;
  pathname: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const id = useId();
  const li = useRef<HTMLLIElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const active = groupLinks(group).some((l) => isActive(l.href, pathname));

  const later = (fn: () => void, ms: number) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(fn, ms);
  };
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  // Close when clicking anywhere else.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (li.current && !li.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open, setOpen]);

  const links = () => Array.from(li.current?.querySelectorAll<HTMLAnchorElement>("[data-panel] a") ?? []);
  const focusLink = (i: number) => {
    const all = links();
    all[(i + all.length) % all.length]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && open) {
      e.preventDefault();
      setOpen(false);
      button.current?.focus();
      return;
    }
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp" && e.key !== "Home" && e.key !== "End") return;
    const all = links();
    const at = all.indexOf(document.activeElement as HTMLAnchorElement);
    if (document.activeElement === button.current) {
      if (e.key !== "ArrowDown") return;
      e.preventDefault();
      setOpen(true);
      requestAnimationFrame(() => focusLink(0));
      return;
    }
    if (at < 0) return;
    e.preventDefault();
    if (e.key === "ArrowDown") focusLink(at + 1);
    if (e.key === "ArrowUp") focusLink(at - 1);
    if (e.key === "Home") focusLink(0);
    if (e.key === "End") focusLink(all.length - 1);
  };

  return (
    <li
      ref={li}
      onKeyDown={onKeyDown}
      onBlur={(e) => {
        if (!li.current?.contains(e.relatedTarget as Node)) setOpen(false);
      }}
      onPointerEnter={(e) => e.pointerType === "mouse" && later(() => setOpen(true), 80)}
      onPointerLeave={(e) => e.pointerType === "mouse" && later(() => setOpen(false), 180)}
    >
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
        className={itemClass(active || open)}
      >
        {group.label}
        <ChevronDown aria-hidden className={`size-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      <div
        id={id}
        data-panel
        hidden={!open}
        className="absolute inset-x-0 top-full border-y border-steel/70 bg-white shadow-[0_24px_48px_-32px_rgba(13,17,90,0.35)] animate-in fade-in slide-in-from-top-1 duration-200"
      >
        <div className="mx-auto grid w-full max-w-[79rem] grid-cols-12 gap-6 px-8 py-10">
          <div className="col-span-3 border-r border-steel/60 pr-6">
            <p className="t-label text-copper" aria-hidden>
              Menu
            </p>
            <p className="mt-3 font-serif text-3xl text-indigo">{group.label}</p>
            <p className="mt-3 text-sm leading-relaxed text-[var(--ink-muted)]">{group.blurb}</p>
            {group.overview ? (
              <Link
                href={group.overview.href}
                aria-current={pathname === group.overview.href ? "page" : undefined}
                className="link-arrow mt-6 min-h-10 text-[0.9375rem] text-indigo"
              >
                {group.overview.label}
                <ArrowRight aria-hidden className="size-4" />
              </Link>
            ) : null}
          </div>
          <div className={`col-span-9 grid gap-x-8 gap-y-8 ${group.columns.length > 1 ? "grid-cols-3" : "grid-cols-2"}`}>
            {group.columns.map((col, i) => (
              <div key={col.title ?? i}>
                {col.title ? (
                  <p className="mb-3 flex gap-2 border-b border-steel/60 pb-2 t-label text-[var(--ink-muted)]">
                    {col.index ? <span className="text-copper">{col.index}</span> : null}
                    <span>{col.title}</span>
                  </p>
                ) : null}
                <ul>
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        aria-current={pathname === l.href ? "page" : undefined}
                        className={`group flex min-h-10 items-center justify-between gap-3 py-1.5 text-[0.9375rem] transition-colors duration-200 hover:text-indigo ${
                          pathname === l.href ? "font-semibold text-indigo" : "text-graphite"
                        }`}
                      >
                        <span className="border-b border-transparent group-hover:border-copper">{l.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </li>
  );
}
