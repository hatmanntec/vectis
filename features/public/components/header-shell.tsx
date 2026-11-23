"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * The header's outer frame. It stays at the top of the screen and, once the
 * page has scrolled, hides the thin utility line so the header takes up
 * less room.
 *
 * Scrolling sets an attribute on the element itself rather than React state,
 * so the header never re-renders while the page is still starting up. (A
 * React update arriving mid-start-up can make the browser throw away the
 * header and rebuild it, which shows as a flash or a missing menu.) The
 * styling all follows from the attribute.
 */
export function HeaderShell({ utility, children }: { utility: ReactNode; children: ReactNode }) {
  const header = useRef<HTMLElement>(null);
  const band = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = header.current;
    if (!el) return;
    const onScroll = () => {
      const condensed = window.scrollY > 32;
      el.toggleAttribute("data-condensed", condensed);
      // Keep the hidden line out of the keyboard's path.
      if (band.current) band.current.inert = condensed;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      ref={header}
      className="group/hdr sticky top-0 z-30 bg-white shadow-[0_1px_0_var(--vectis-steel)] transition-shadow duration-200 data-[condensed]:shadow-[0_1px_0_var(--vectis-steel),0_12px_24px_-20px_rgba(13,17,90,0.35)]"
    >
      <div className="grid grid-rows-[1fr] transition-[grid-template-rows] duration-200 group-data-[condensed]/hdr:grid-rows-[0fr]">
        <div ref={band} className="overflow-hidden">
          {utility}
        </div>
      </div>
      {children}
    </header>
  );
}
