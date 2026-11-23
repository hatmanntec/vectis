import { Suspense } from "react";
import { preload } from "react-dom";
import { SiteHeader } from "@/features/public/components/site-header";
import { SiteFooter } from "@/features/public/components/site-footer";
import { RevealObserver } from "@/features/public/components/reveal";

// "site" switches on the public design system (Fraunces headings, square
// corners, copper focus rings); the CMS doesn't use it.
export default function PublicLayout({ children }: LayoutProps<"/">) {
  // Fetch the heading font straight away rather than after the styles are read,
  // so headings appear in Fraunces sooner.
  preload("/fonts/fraunces-latin-opsz-normal.woff2", { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
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
