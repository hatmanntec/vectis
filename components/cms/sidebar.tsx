"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { NAV } from "@/lib/cms/nav";
import { cn } from "@/lib/utils";

/**
 * The navigation list, shared by the desktop sidebar and the phone menu.
 * Reading the current address must sit inside a loading boundary, so the
 * list first renders without a highlighted item, then highlights it.
 */
function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Suspense fallback={<NavItems pathname="" onNavigate={onNavigate} />}>
      <NavListWithPath onNavigate={onNavigate} />
    </Suspense>
  );
}

function NavListWithPath({ onNavigate }: { onNavigate?: () => void }) {
  return <NavItems pathname={usePathname()} onNavigate={onNavigate} />;
}

function NavItems({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  return (
    <nav aria-label="CMS" className="space-y-6 px-3 py-6">
      {NAV.map((group) => (
        <div key={group.label}>
          <p className="mb-2 px-3 text-[11px] font-medium tracking-[0.18em] text-ivory/50 uppercase">{group.label}</p>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const Icon = item.icon;
              if (!item.ready) {
                return (
                  <li key={item.href}>
                    <span
                      className="flex cursor-not-allowed items-center gap-3 px-3 py-2 text-sm text-ivory/35"
                      title={`Added in milestone ${item.milestone}`}
                    >
                      <Icon className="size-4" aria-hidden />
                      <span className="flex-1">{item.label}</span>
                      <span className="text-[10px] tracking-wide">{item.milestone}</span>
                    </span>
                  </li>
                );
              }
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 border-l-2 px-3 py-2 text-sm transition-colors",
                      active
                        ? "border-copper bg-sidebar-accent text-white"
                        : "border-transparent text-ivory/80 hover:bg-sidebar-accent/60 hover:text-white",
                    )}
                  >
                    <Icon className="size-4" aria-hidden />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function DesktopSidebar({ logo }: { logo: React.ReactNode }) {
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col overflow-y-auto bg-sidebar lg:flex">
      <Link href="/admin" className="block bg-white px-6 py-4" aria-label="VECTIS CMS home">
        {logo}
      </Link>
      <NavList />
    </aside>
  );
}

export function MobileMenu({ logo }: { logo: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open menu">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 gap-0 overflow-y-auto border-0 bg-sidebar p-0">
        <SheetTitle className="sr-only">CMS menu</SheetTitle>
        <div className="bg-white px-6 py-4">{logo}</div>
        <NavList onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
