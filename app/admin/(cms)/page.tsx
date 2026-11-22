import type { Metadata } from "next";
import { Suspense } from "react";
import { ShieldCheck } from "lucide-react";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
      <Dashboard />
    </Suspense>
  );
}

async function Dashboard() {
  const admin = await requireAdmin();
  const firstName = admin.fullName.split(" ")[0];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl">Welcome, {firstName}</h1>
        <p className="mt-2 text-muted-foreground">You are signed in to the VECTIS content management system.</p>
      </div>

      <section className="border border-border bg-white p-6">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-teal" aria-hidden />
          <div className="space-y-1">
            <h2 className="font-sans text-base font-semibold text-graphite">You are signed in securely</h2>
            <p className="text-sm text-muted-foreground">
              Only active VECTIS administrators can use the CMS. Every change you make is recorded in the audit
              trail.
            </p>
          </div>
        </div>
      </section>

      <section className="border border-dashed border-steel p-6 text-sm text-muted-foreground">
        The dashboard overview, navigation and content modules (companies, investments, projects, news and more)
        are added in the next milestones.
      </section>
    </div>
  );
}
