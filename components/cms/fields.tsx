"use client";

import { useId, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { slugify } from "@/lib/cms/status";
import { cn } from "@/lib/utils";

/**
 * Form fields for CMS edit pages. Each shows its label, an optional hint,
 * and the error message for that field after a failed save.
 */

type Common = {
  name: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
};

function FieldShell({
  id,
  label,
  hint,
  error,
  required,
  counter,
  children,
}: Omit<Common, "name"> & { id: string; counter?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-4">
        <Label htmlFor={id}>
          {label}
          {required ? (
            <span className="text-copper" aria-hidden>
              {" "}
              *
            </span>
          ) : null}
        </Label>
        {counter}
      </div>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function Counter({ length, max }: { length: number; max: number }) {
  return (
    <span className={cn("text-xs tabular-nums", length > max ? "text-destructive" : "text-muted-foreground")}>
      {length}/{max}
    </span>
  );
}

export function TextField({
  name,
  label,
  hint,
  error,
  required,
  defaultValue,
  maxLength,
  type = "text",
}: Common & { defaultValue?: string | number | null; maxLength?: number; type?: "text" | "email" | "url" | "number" }) {
  const id = useId();
  const [value, setValue] = useState(String(defaultValue ?? ""));
  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      counter={maxLength && type === "text" ? <Counter length={value.length} max={maxLength} /> : undefined}
    >
      <Input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className="bg-white"
      />
    </FieldShell>
  );
}

export function TextAreaField({
  name,
  label,
  hint,
  error,
  required,
  defaultValue,
  maxLength,
  rows = 4,
}: Common & { defaultValue?: string | null; maxLength?: number; rows?: number }) {
  const id = useId();
  const [value, setValue] = useState(defaultValue ?? "");
  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      counter={maxLength ? <Counter length={value.length} max={maxLength} /> : undefined}
    >
      <Textarea
        id={id}
        name={name}
        rows={rows}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className="bg-white"
      />
    </FieldShell>
  );
}

/**
 * A name field paired with its web-address (slug) field. The slug follows
 * the name automatically until the administrator edits it by hand.
 */
export function NameAndSlugFields({
  nameLabel,
  defaultName,
  defaultSlug,
  nameError,
  slugError,
  urlPrefix,
  nameMax = 200,
}: {
  nameLabel: string;
  defaultName?: string;
  defaultSlug?: string;
  nameError?: string;
  slugError?: string;
  urlPrefix: string;
  nameMax?: number;
}) {
  const nameId = useId();
  const slugId = useId();
  const [name, setName] = useState(defaultName ?? "");
  const [slug, setSlug] = useState(defaultSlug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(defaultSlug));

  return (
    <>
      <FieldShell id={nameId} label={nameLabel} required error={nameError} counter={<Counter length={name.length} max={nameMax} />}>
        <Input
          id={nameId}
          name="name"
          value={name}
          required
          aria-invalid={Boolean(nameError)}
          onChange={(e) => {
            setName(e.target.value);
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
          className="bg-white"
        />
      </FieldShell>
      <FieldShell
        id={slugId}
        label="Web address"
        required
        error={slugError}
        hint="Lower-case letters, numbers and hyphens. Changing it later changes the page's address."
      >
        <div className="flex items-stretch">
          <span className="inline-flex items-center border border-r-0 border-input bg-muted px-3 text-xs text-muted-foreground">
            {urlPrefix}
          </span>
          <Input
            id={slugId}
            name="slug"
            value={slug}
            required
            aria-invalid={Boolean(slugError)}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value.toLowerCase());
            }}
            className="rounded-l-none bg-white font-mono text-sm"
          />
        </div>
      </FieldShell>
    </>
  );
}
