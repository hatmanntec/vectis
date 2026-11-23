"use client";

import { useEffect, useRef } from "react";
import { Container } from "@/features/public/components/bits";

/**
 * What a visitor sees if a public page fails to appear.
 *
 * Almost always this is a timing problem rather than a broken page: the
 * visitor loaded the website, an administrator published or changed something
 * in the CMS, and then the visitor clicked a menu link. The copy of the page
 * their browser had put aside in advance no longer matches what the website
 * now serves, so React gives up on that page.
 *
 * Reloading always fixes it, so we do that for them instead of showing an
 * error. The first attempt asks Next.js to fetch the page again, which keeps
 * the website feeling instant. If that still fails we load the address from
 * scratch, which cannot fail for this reason. A marker in the tab's own
 * storage makes sure we never loop: after one full reload we show the message
 * below and let the visitor decide.
 */
export default function PublicError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const tried = useRef(false);

  useEffect(() => {
    if (tried.current) return;
    tried.current = true;

    const key = "vectis:recovered";
    let already = false;
    try {
      already = sessionStorage.getItem(key) === window.location.pathname;
    } catch {
      // Private browsing can refuse storage; treat that as "not tried yet".
    }
    if (already) return;

    try {
      sessionStorage.setItem(key, window.location.pathname);
    } catch {
      // Nothing to do: we simply lose the loop guard.
    }

    reset();
    const hard = setTimeout(() => window.location.reload(), 1200);
    return () => clearTimeout(hard);
  }, [reset]);

  return (
    <Container className="flex min-h-[60svh] flex-col justify-center py-20">
      <p className="t-label text-[var(--ink-muted)]">Loading</p>
      <h1 className="t-h2 mt-3 text-indigo">One moment</h1>
      <p className="t-body mt-4 max-w-[34rem] text-[var(--ink-muted)]">
        This page is being fetched again. If nothing happens, reload the page or return to the home page.
      </p>
      <div className="mt-8 flex flex-wrap gap-4">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex min-h-11 items-center border border-indigo bg-indigo px-5 text-sm text-white transition-colors duration-200 hover:bg-[#0a0d47]"
        >
          Reload
        </button>
        <a
          href="/"
          className="inline-flex min-h-11 items-center border border-steel px-5 text-sm text-graphite transition-colors duration-200 hover:border-indigo hover:text-indigo"
        >
          Home
        </a>
      </div>
    </Container>
  );
}
