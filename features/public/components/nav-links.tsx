"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "./nav";

/** Menu links, with the current section highlighted. */
export function NavLinks({ items, variant }: { items: NavItem[]; variant: "desktop" | "mobile" }) {
  return <Links items={items} variant={variant} pathname={usePathname()} />;
}

/** The same links without highlighting (shown for an instant while the page address is read). */
export function PlainNavLinks({ items, variant }: { items: NavItem[]; variant: "desktop" | "mobile" }) {
  return <Links items={items} variant={variant} pathname="" />;
}

function Links({ items, variant, pathname }: { items: NavItem[]; variant: "desktop" | "mobile"; pathname: string }) {
  const active = (href: string) => pathname === href || pathname.startsWith(`${href}/`) || (href === "/investment-philosophy" && pathname.startsWith("/investments"));
  if (variant === "desktop") {
    return (
      <ul className="flex items-center gap-1">
        {items.map((i) => (
          <li key={i.href}>
            <Link
              href={i.href}
              aria-current={active(i.href) ? "page" : undefined}
              className={`relative block px-3 py-2 text-sm font-medium transition-colors after:absolute after:inset-x-3 after:-bottom-px after:h-0.5 after:transition-colors ${
                active(i.href) ? "text-indigo after:bg-copper" : "text-graphite after:bg-transparent hover:text-indigo"
              }`}
            >
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <ul className="divide-y divide-border">
      {items.map((i) => (
        <li key={i.href}>
          <Link
            href={i.href}
            aria-current={active(i.href) ? "page" : undefined}
            className={`block py-3 text-base ${active(i.href) ? "font-semibold text-indigo" : "text-graphite"}`}
          >
            {i.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
