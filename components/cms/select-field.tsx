"use client";

import { useId } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type SelectOption = { value: string; label: string; disabled?: boolean };

/** A labelled drop-down list with an optional hint and error message. */
export function SelectField({
  name,
  label,
  options,
  defaultValue,
  value,
  onChange,
  placeholder,
  hint,
  error,
  required,
}: {
  name: string;
  label: string;
  options: SelectOption[];
  defaultValue?: string | null;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  required?: boolean;
}) {
  const id = useId();
  const controlled = value !== undefined;
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required ? (
          <span className="text-copper" aria-hidden>
            {" "}
            *
          </span>
        ) : null}
      </Label>
      <select
        id={id}
        name={name}
        {...(controlled ? { value } : { defaultValue: defaultValue ?? "" })}
        onChange={(e) => onChange?.(e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error || hint ? `${id}-note` : undefined}
        className={cn(
          "h-9 w-full border bg-white px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
          error ? "border-destructive" : "border-input",
        )}
      >
        {placeholder !== undefined ? <option value="">{placeholder}</option> : null}
        {options.map((o) => (
          <option key={o.value} value={o.value} disabled={o.disabled}>
            {o.label}
          </option>
        ))}
      </select>
      {error || hint ? (
        <p id={`${id}-note`} className={error ? "text-xs text-destructive" : "text-xs text-muted-foreground"}>
          {error ?? hint}
        </p>
      ) : null}
    </div>
  );
}
