"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

/** A read-only address with a Copy button. */
export function CopyField({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-stretch">
      <input
        readOnly
        value={value}
        aria-label={label}
        onFocus={(e) => e.currentTarget.select()}
        className="min-w-0 flex-1 border border-r-0 border-input bg-muted px-3 py-2 font-mono text-xs text-graphite"
      />
      <Button
        type="button"
        variant="outline"
        className="rounded-l-none"
        onClick={async () => {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
      >
        {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
        {copied ? "Copied" : "Copy"}
      </Button>
    </div>
  );
}
