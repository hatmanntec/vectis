"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import { isActive, isGroup, groupLinks, type NavGroup, type NavItem } from "./nav";

/**
 * The menu on phones and tablets: a full-screen panel. Groups open as
 * accordions, every target is at least 48 px tall, focus stays inside the
 * open panel, Esc closes it, and the page behind doesn't scroll.
 */
export function MobileMenu({ items, logo, utility }: { items: NavItem[]; logo: ReactNode; utility?: string }) {
  const pathname = usePathname();
  // Remember which page the menu was opened on, so moving to another page
  // closes it without changing any state while the page is rendering.
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const open = openedOn === pathname;
  const setOpen = (wanted: boolean) => setOpenedOn(wanted ? pathname : null);
  const panel = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const closer = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const opened = opener.current;
    closer.current?.focus();
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenedOn(null);
        return;
      }
      if (e.key !== "Tab" || !panel.current) return;
      // Keep Tab and Shift+Tab inside the open menu.
      const focusable = Array.from(panel.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")).filter(
        (el) => el.offsetParent !== null,
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      opened?.focus();
    };
  }, [open]);

  if (!items.length) return null;
  return (
    <div className="lg:hidden">
      <button
        ref={opener}
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen(true)}
        className="-mr-2 inline-flex size-12 items-center justify-center text-indigo"
      >
        <Menu className="size-6" aria-hidden />
        <span className="sr-only">Open menu</span>
      </button>
      {open ? (
        <div
          ref={panel}
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-white animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex h-20 shrink-0 items-center justify-between border-b border-steel/70 px-5 sm:px-8">
            {logo}
            <button
              ref={closer}
              type="button"
              onClick={() => setOpen(false)}
              className="-mr-2 inline-flex size-12 items-center justify-center text-indigo"
            >
              <X className="size-6" aria-hidden />
              <span className="sr-only">Close menu</span>
            </button>
          </div>
          <nav aria-label="Main" className="flex-1 px-5 pt-4 pb-10 sm:px-8">
            <ul className="border-b border-steel/70">
              {items.map((item) =>
                isGroup(item) ? (
                  <Accordion key={item.label} group={item} pathname={pathname} />
                ) : (
                  <li key={item.href} className="border-t border-steel/70">
                    <Link
                      href={item.href}
                      aria-current={pathname === item.href ? "page" : undefined}
                      className={`flex min-h-14 items-center font-serif text-2xl ${isActive(item.href, pathname) ? "text-indigo" : "text-graphite"}`}
                    >
                      {item.label}
                    </Link>
                  </li>
                ),
              )}
            </ul>
            {utility ? <p className="mt-8 t-label text-[var(--ink-muted)]">{utility}</p> : null}
          </nav>
        </div>
      ) : null}
    </div>
  );
}

function Accordion({ group, pathname }: { group: NavGroup; pathname: string }) {
  const active = groupLinks(group).some((l) => isActive(l.href, pathname));
  const [open, setOpen] = useState(active);
  const id = useId();
  return (
    <li className="border-t border-steel/70">
      <div className="flex items-center justify-between gap-2">
        {group.href ? (
          // Tapping the name goes to its page; the arrow opens the list.
          <Link
            href={group.href}
            aria-current={pathname === group.href ? "page" : undefined}
            className={`flex min-h-14 flex-1 items-center font-serif text-2xl ${active ? "text-indigo" : "text-graphite"}`}
          >
            {group.label}
          </Link>
        ) : (
          <button
            type="button"
            aria-expanded={open}
            aria-controls={id}
            onClick={() => setOpen((o) => !o)}
            className={`flex min-h-14 flex-1 items-center text-left font-serif text-2xl ${active ? "text-indigo" : "text-graphite"}`}
          >
            {group.label}
          </button>
        )}
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          aria-label={`${group.label} pages`}
          onClick={() => setOpen((o) => !o)}
          className={`-mr-3 flex size-14 items-center justify-center ${active ? "text-indigo" : "text-graphite"}`}
        >
          <ChevronDown aria-hidden className={`size-5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </button>
      </div>
      <div id={id} hidden={!open} className="pb-4">
        {group.overview ? <MenuLink link={group.overview} pathname={pathname} strong /> : null}
        {group.columns.map((col, i) => (
          <div key={col.title ?? i} className={col.title ? "mt-3" : ""}>
            {col.title ? (
              <p className="flex gap-2 pt-2 pb-1 t-label text-[var(--ink-muted)]">
                {col.index ? <span className="t-index">{col.index}</span> : null}
                <span>{col.title}</span>
              </p>
            ) : null}
            <ul>
              {col.links.map((l) => (
                <li key={l.href}>
                  <MenuLink link={l} pathname={pathname} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </li>
  );
}

function MenuLink({ link, pathname, strong }: { link: { href: string; label: string }; pathname: string; strong?: boolean }) {
  const current = pathname === link.href;
  return (
    <Link
      href={link.href}
      aria-current={current ? "page" : undefined}
      className={`flex min-h-12 items-center pl-4 text-base ${current || strong ? "font-semibold text-indigo" : "text-graphite"} ${
        current ? "border-l-2 border-copper" : "border-l border-steel/70"
      }`}
    >
      {link.label}
    </Link>
  );
}
