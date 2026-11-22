"use client";

import { useId, useState } from "react";
import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Item = { heading: string; text: string };

/** A repeatable list of { heading, text } entries: add, edit, reorder, remove. */
export function ItemsField({
  name,
  label,
  itemLabel,
  headingLabel,
  textLabel,
  maxItems,
  hint,
  initial,
  error,
}: {
  name: string;
  label: string;
  itemLabel: string;
  headingLabel: string;
  textLabel: string;
  maxItems: number;
  hint?: string;
  initial: Item[];
  error?: string;
}) {
  const base = useId();
  // Each entry keeps a stable key so typing isn't lost when entries move.
  const [items, setItems] = useState(() => initial.map((it, i) => ({ ...it, key: `${base}-${i}` })));
  const [next, setNext] = useState(initial.length);

  const move = (i: number, d: -1 | 1) =>
    setItems((list) => {
      const copy = [...list];
      [copy[i], copy[i + d]] = [copy[i + d], copy[i]];
      return copy;
    });
  const update = (i: number, field: "heading" | "text", value: string) =>
    setItems((list) => list.map((it, j) => (j === i ? { ...it, [field]: value } : it)));

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium">{label}</legend>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      {items.length === 0 ? <p className="text-sm text-muted-foreground">None yet.</p> : null}
      <ol className="space-y-3">
        {items.map((it, i) => (
          <li key={it.key} className="border border-border bg-ivory/30 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase">
                {itemLabel} {i + 1}
              </span>
              <span className="flex">
                <Button type="button" variant="ghost" size="icon" aria-label={`Move ${itemLabel} ${i + 1} up`} disabled={i === 0} onClick={() => move(i, -1)}>
                  <ArrowUp aria-hidden />
                </Button>
                <Button type="button" variant="ghost" size="icon" aria-label={`Move ${itemLabel} ${i + 1} down`} disabled={i === items.length - 1} onClick={() => move(i, 1)}>
                  <ArrowDown aria-hidden />
                </Button>
                <Button type="button" variant="ghost" size="icon" aria-label={`Remove ${itemLabel} ${i + 1}`} onClick={() => setItems((l) => l.filter((_, j) => j !== i))}>
                  <X aria-hidden />
                </Button>
              </span>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${it.key}-h`} className="text-xs">
                {headingLabel}
              </Label>
              <Input id={`${it.key}-h`} name={`${name}.heading`} value={it.heading} maxLength={160} onChange={(e) => update(i, "heading", e.target.value)} className="bg-white" />
              <Label htmlFor={`${it.key}-t`} className="text-xs">
                {textLabel}
              </Label>
              <Textarea id={`${it.key}-t`} name={`${name}.text`} value={it.text} maxLength={1000} rows={2} onChange={(e) => update(i, "text", e.target.value)} className="bg-white" />
            </div>
          </li>
        ))}
      </ol>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={items.length >= maxItems}
        onClick={() => {
          setItems((l) => [...l, { heading: "", text: "", key: `${base}-${next}` }]);
          setNext((n) => n + 1);
        }}
      >
        <Plus aria-hidden />
        Add {itemLabel}
      </Button>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </fieldset>
  );
}
