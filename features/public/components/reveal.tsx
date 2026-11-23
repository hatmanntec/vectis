"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const SELECTOR = ".reveal:not([data-revealed]), .reveal-image:not([data-revealed])";
/** Gap between items that come into view together (cards in a row, a heading and its text). */
const STEP_MS = 90;
/** The longest any item waits, so long lists never feel slow. */
const MAX_DELAY_MS = 450;

/**
 * Runs the scroll reveals: elements marked `reveal` (text and blocks) or
 * `reveal-image` (pictures) animate once as they come into view.
 *
 * - Items that enter the screen together are staggered in reading order
 *   (top to bottom, left to right), 90 ms apart and never more than 450 ms,
 *   so a row of cards or a heading followed by its text unfolds in sequence.
 * - Each item animates once; scrolling back up doesn't replay it.
 * - Nothing is hidden until this has started, and anything already on screen
 *   is shown straight away, so content never flickers or goes missing
 *   without JavaScript. Search engines receive the full page as normal.
 * - With "reduce motion" switched on, CSS shows everything immediately.
 * - It looks again after each page change and when new content streams in.
 */
export function RevealObserver() {
  const pathname = usePathname();
  useEffect(() => {
    const show = (el: Element, delay = 0) => {
      const h = el as HTMLElement;
      if (delay) {
        h.style.setProperty("--reveal-delay", `${delay}ms`);
        // Clear the delay afterwards so later hover effects respond at once.
        window.setTimeout(() => h.style.removeProperty("--reveal-delay"), delay + 900);
      }
      h.setAttribute("data-revealed", "");
    };

    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll(SELECTOR).forEach((el) => show(el));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        const entering = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left);
        entering.forEach((e, i) => {
          show(e.target, Math.min(i * STEP_MS, MAX_DELAY_MS));
          io.unobserve(e.target);
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 },
    );

    const watch = () => {
      const height = window.innerHeight;
      document.querySelectorAll(SELECTOR).forEach((el) => {
        if (el.hasAttribute("data-watched")) return;
        el.setAttribute("data-watched", "");
        const r = el.getBoundingClientRect();
        // Already on screen before the reveals switched on: show it as it is.
        if (!document.documentElement.classList.contains("reveal-ready") && r.top < height && r.bottom > 0) show(el);
        else io.observe(el);
      });
    };

    watch();
    document.documentElement.classList.add("reveal-ready");
    // Content that streams in later (filtered lists, profiles) is picked up too.
    const mo = new MutationObserver(() => watch());
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);
  return null;
}
