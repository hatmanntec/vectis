"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Toaster as Sonner, toast } from "sonner";

/** Where success and error notifications appear (bottom-right). */
export function CmsToaster() {
  return (
    <Sonner
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast: "!rounded-sm !border-border !bg-white !text-graphite !font-sans",
          description: "!text-muted-foreground",
          success: "!border-l-4 !border-l-teal",
          error: "!border-l-4 !border-l-destructive",
        },
      }}
    />
  );
}

const NOTICES: Record<string, string> = {
  created: "Created. You can keep editing below.",
  deleted: "Deleted permanently.",
  saved: "Saved.",
  created_sectors_failed: "Created, but the sectors couldn't be saved. Please tick them again below and save.",
};

/**
 * Shows a notification passed in the address after a redirect
 * (e.g. ?notice=created), then removes it from the address.
 */
export function NoticeFromUrl() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const notice = searchParams.get("notice");

  useEffect(() => {
    if (!notice) return;
    const text = NOTICES[notice];
    if (text) toast.success(text);
    const sp = new URLSearchParams(searchParams.toString());
    sp.delete("notice");
    const s = sp.toString();
    router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false });
  }, [notice, pathname, router, searchParams]);

  return null;
}
