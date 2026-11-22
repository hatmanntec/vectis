import { Suspense } from "react";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { DesktopSidebar, MobileMenu } from "@/components/cms/sidebar";
import { CmsToaster, NoticeFromUrl } from "@/components/cms/toaster";
import { requireAdmin } from "@/lib/auth/admin";
import { signOut } from "@/lib/auth/actions";

/**
 * The frame around every CMS page: sidebar (a slide-out menu on phones),
 * top bar with the administrator's name and Sign out, and notifications.
 *
 * The frame shows nothing private by itself; the name loads after the
 * server confirms the administrator. Each page also checks access itself.
 */
export default function CmsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-1">
      <DesktopSidebar logo={<Logo width={150} priority className="mx-auto block w-fit" />} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-border bg-white/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-8">
            <div className="flex items-center gap-3">
              <MobileMenu logo={<Logo width={130} className="mx-auto block w-fit" />} />
              <span className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
                Content Management
              </span>
            </div>
            <Suspense fallback={<span className="text-sm text-muted-foreground">…</span>}>
              <AdminBadge />
            </Suspense>
          </div>
        </header>

        <main className="w-full max-w-6xl flex-1 px-4 py-8 sm:px-8 sm:py-10">{children}</main>
      </div>

      <CmsToaster />
      <Suspense>
        <NoticeFromUrl />
      </Suspense>
    </div>
  );
}

async function AdminBadge() {
  const admin = await requireAdmin();
  return (
    <div className="flex items-center gap-3">
      <span className="hidden text-right text-sm leading-tight sm:block">
        <span className="block font-medium text-graphite">{admin.fullName}</span>
        <span className="block text-xs text-muted-foreground">{admin.email}</span>
      </span>
      <form action={signOut}>
        <Button type="submit" variant="outline" size="sm" aria-label="Sign out">
          <LogOut aria-hidden />
          <span className="hidden sm:inline">Sign out</span>
        </Button>
      </form>
    </div>
  );
}
