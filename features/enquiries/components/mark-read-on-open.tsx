"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { ActionResult } from "@/lib/cms/results";

/**
 * Marks an unread enquiry as read when it is opened. It stays on the page
 * for the whole visit and acts only once, so "Mark as unread" (which
 * refreshes the page) isn't immediately undone.
 */
export function MarkReadOnOpen({ unread, markRead }: { unread: boolean; markRead: () => Promise<ActionResult> }) {
  const router = useRouter();
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    if (!unread) return;
    markRead().then((r) => {
      if (r.ok) router.refresh();
    });
  }, [unread, markRead, router]);
  return null;
}
