"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Turns on the gentle scroll reveal for elements marked className="reveal".
 *
 * - Without JavaScript nothing is hidden: the "reveal-ready" class that hides
 *   content until it scrolls into view is only added here.
 * - Anything already on screen is marked as shown first, so it never flickers.
 * - With "reduce motion" switched on, CSS shows everything immediately.
 * - It re-scans after each page change.
 */
export function RevealObserver() {
  const pathname = usePathname();
  useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>(".reveal:not([data-revealed])"));
    const show = (el: Element) => el.setAttribute("data-revealed", "");
    if (!("IntersectionObserver" in window)) {
      items.forEach(show);
      return;
    }
    const height = window.innerHeight;
    for (const el of items) {
      const r = el.getBoundingClientRect();
      if (r.top < height && r.bottom > 0) show(el);
    }
    document.documentElement.classList.add("reveal-ready");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            show(e.target);
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    items.filter((el) => !el.hasAttribute("data-revealed")).forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);
  return null;
}
