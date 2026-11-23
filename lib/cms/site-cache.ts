import { updateTag } from "next/cache";

/**
 * Tells the public website that content changed, so the next visitor sees
 * the change straight away instead of after the one-minute refresh.
 * Call it (from a server action) after any successful change.
 */
export function siteChanged() {
  updateTag("site");
}
