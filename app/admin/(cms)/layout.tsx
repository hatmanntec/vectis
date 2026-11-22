import { Suspense } from "react";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/admin";
import { signOut } from "@/lib/auth/actions";

/**
 * The frame around every CMS page (the full sidebar arrives in M4).
 * The frame itself shows nothing private; the signed-in name loads inside a
 * boundary after the server has confirmed the administrator. Each page checks
 * access again for itself.
 */
export default function CmsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <div className="h-1.5 bg-indigo" aria-hidden />
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/admin" className="flex items-center gap-3" aria-label="VECTIS CMS home">
            <Logo width={104} priority />
            <span className="hidden border-l border-border pl-3 text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase sm:inline">
              Content Management
            </span>
          </Link>
          <Suspense fallback={<span className="text-sm text-muted-foreground">…</span>}>
            <AdminBadge />
          </Suspense>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">{children}</main>
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
        <Button type="submit" variant="outline" size="sm">
          <LogOut aria-hidden />
          Sign out
        </Button>
      </form>
    </div>
  );
}
