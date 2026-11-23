"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * The header's outer frame. It stays at the top of the screen and, once the
 * page has scrolled, hides the thin utility line so the header takes up
 * less room.
 */
export function HeaderShell({ utility, children }: { utility: ReactNode; children: ReactNode }) {
  const [condensed, setCondensed] = useState(false);
  useEffect(() => {
    const onScroll = () => setCondensed(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header
      data-condensed={condensed ? "" : undefined}
      className={`sticky top-0 z-30 bg-white transition-shadow duration-200 ${condensed ? "shadow-[0_1px_0_var(--vectis-steel),0_12px_24px_-20px_rgba(13,17,90,0.35)]" : "shadow-[0_1px_0_var(--vectis-steel)]"}`}
    >
      <div className={`grid transition-[grid-template-rows] duration-200 ${condensed ? "grid-rows-[0fr]" : "grid-rows-[1fr]"}`}>
        <div className="overflow-hidden" inert={condensed}>
          {utility}
        </div>
      </div>
      {children}
    </header>
  );
}
