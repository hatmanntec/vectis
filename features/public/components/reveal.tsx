"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Everything still waiting to be revealed. */
const WAITING = ".reveal:not([data-revealed]), .reveal-image:not([data-revealed])";
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
 * - It looks again after each page change and whenever content streams in.
 *   Nothing is marked as "already handled", because moving between pages can
 *   reuse the same elements for new content; every element still waiting is
 *   watched again on each pass (watching one twice does nothing).
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
      document.querySelectorAll(WAITING).forEach((el) => show(el));
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
      // On the very first pass nothing is hidden yet, so whatever is already
      // on screen is simply shown rather than animated in.
      const first = !document.documentElement.classList.contains("reveal-ready");
      const height = window.innerHeight;
      for (const el of document.querySelectorAll(WAITING)) {
        const r = el.getBoundingClientRect();
        if (first && r.top < height && r.bottom > 0) show(el);
        else io.observe(el);
      }
    };

    let cancelled = false;
    let queued = 0;
    // Content that streams in later (filtered lists, profiles) is picked up
    // too; several changes at once are handled in a single pass.
    const mo = new MutationObserver(() => {
      if (queued) return;
      queued = requestAnimationFrame(() => {
        queued = 0;
        if (!cancelled) watch();
      });
    });

    const start = () => {
      if (cancelled) return;
      watch();
      document.documentElement.classList.add("reveal-ready");
      mo.observe(document.body, { childList: true, subtree: true });
    };
    // Wait for the web fonts, so "already on screen" is judged on the final
    // layout; until then nothing is hidden.
    if (document.fonts?.status === "loaded") start();
    else document.fonts.ready.then(start, start);

    return () => {
      cancelled = true;
      if (queued) cancelAnimationFrame(queued);
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);
  return null;
}
