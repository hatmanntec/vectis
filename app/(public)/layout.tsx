import { Suspense } from "react";
import { SiteHeader } from "@/features/public/components/site-header";
import { SiteFooter } from "@/features/public/components/site-footer";
import { RevealObserver } from "@/features/public/components/reveal";

// "site" switches on the public design system (Fraunces headings, square
// corners, copper focus rings); the CMS doesn't use it.
export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="site flex flex-1 flex-col">
      <a href="#main" className="sr-only z-50 bg-indigo px-4 py-3 text-white focus:not-sr-only focus:fixed focus:top-2 focus:left-2">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="flex flex-1 flex-col">
        {children}
      </main>
      <SiteFooter />
      <Suspense fallback={null}>
        <RevealObserver />
      </Suspense>
    </div>
  );
}
