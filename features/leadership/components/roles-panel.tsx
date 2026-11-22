"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Check, X } from "lucide-react";
import { ActionForm } from "@/components/cms/action-form";
import { TextField } from "@/components/cms/fields";
import { SelectField } from "@/components/cms/select-field";
import { SubmitButton } from "@/components/cms/form-bits";
import { StatusBadge } from "@/components/cms/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ActionResult } from "@/lib/cms/results";

type Role = { company_id: string; role_title: string | null; companyName: string; companyStatus: string };

function RoleRow({
  role,
  first,
  last,
  pending,
  run,
  save,
  remove,
  move,
}: {
  role: Role;
  first: boolean;
  last: boolean;
  pending: boolean;
  run: (fn: () => Promise<ActionResult>) => void;
  save: (title: string) => Promise<ActionResult>;
  remove: () => Promise<ActionResult>;
  move: (d: "up" | "down") => Promise<ActionResult>;
}) {
  const [title, setTitle] = useState(role.role_title ?? "");
  const changed = title.trim() !== (role.role_title ?? "");
  return (
    <li className="flex flex-wrap items-center gap-3 px-3 py-2">
      <div className="min-w-40 flex-1">
        <Link href={`/admin/companies/${role.company_id}`} className="text-sm font-medium text-indigo hover:underline">
          {role.companyName}
        </Link>
        {role.companyStatus !== "published" ? (
          <span className="ml-2 align-middle">
            <StatusBadge status={role.companyStatus as "draft"} publishedAt={null} />
          </span>
        ) : null}
      </div>
      <Input
        aria-label={`Role title at ${role.companyName}`}
        value={title}
        maxLength={160}
        placeholder="Role (e.g. Director)"
        onChange={(e) => setTitle(e.target.value)}
        className="h-8 w-56 bg-white text-sm"
      />
      <div className="flex items-center">
        {changed ? (
          <Button type="button" variant="ghost" size="icon" aria-label={`Save role at ${role.companyName}`} disabled={pending} onClick={() => run(() => save(title))}>
            <Check aria-hidden />
          </Button>
        ) : null}
        <Button type="button" variant="ghost" size="icon" aria-label={`Move ${role.companyName} up`} disabled={pending || first} onClick={() => run(() => move("up"))}>
          <ArrowUp aria-hidden />
        </Button>
        <Button type="button" variant="ghost" size="icon" aria-label={`Move ${role.companyName} down`} disabled={pending || last} onClick={() => run(() => move("down"))}>
          <ArrowDown aria-hidden />
        </Button>
        <Button type="button" variant="ghost" size="icon" aria-label={`Remove role at ${role.companyName}`} disabled={pending} onClick={() => run(remove)}>
          <X aria-hidden />
        </Button>
      </div>
    </li>
  );
}

/** The companies a person holds roles in: add, rename the role, reorder, remove. */
export function RolesPanel({
  roles,
  companies,
  add,
  save,
  remove,
  move,
}: {
  roles: Role[];
  companies: { id: string; name: string }[];
  add: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
  save: (companyId: string, title: string) => Promise<ActionResult>;
  remove: (companyId: string) => Promise<ActionResult>;
  move: (companyId: string, direction: "up" | "down") => Promise<ActionResult>;
}) {
  // `added` counts successful adds; the add form is re-created (cleared) after each one,
  // but keeps what was typed when there is an error.
  const [state, formAction] = useActionState(
    async (prev: { result: ActionResult | null; added: number }, fd: FormData) => {
      const result = await add(prev.result, fd);
      return { result, added: prev.added + (result.ok ? 1 : 0) };
    },
    { result: null as ActionResult | null, added: 0 },
  );
  const result = state.result;
  const [pending, start] = useTransition();
  const router = useRouter();
  const errors = result && !result.ok ? (result.fieldErrors ?? {}) : {};

  useEffect(() => {
    if (!result) return;
    if (result.ok) {
      toast.success(result.message ?? "Saved.");
      router.refresh();
    } else toast.error(result.error);
  }, [result, router]);

  const run = (fn: () => Promise<ActionResult>) =>
    start(async () => {
      const r = await fn();
      if (!r.ok) toast.error(r.error);
      else if (r.message) toast.success(r.message);
      router.refresh();
    });

  const available = companies.filter((c) => !roles.some((r) => r.company_id === c.id));

  return (
    <section className="border border-border bg-white" aria-label="Roles in companies">
      <div className="border-b border-border px-5 py-4">
        <h2 className="font-sans text-sm font-semibold text-graphite">Roles in companies</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          The boards or companies this person serves, and their role in each. Shown on the website only for published
          companies.
        </p>
      </div>
      <div className="space-y-4 px-5 py-5">
        {roles.length ? (
          <ul className="divide-y divide-border border border-border">
            {roles.map((r, i) => (
              <RoleRow
                key={`${r.company_id}:${r.role_title ?? ""}`}
                role={r}
                first={i === 0}
                last={i === roles.length - 1}
                pending={pending}
                run={run}
                save={(t) => save(r.company_id, t)}
                remove={() => remove(r.company_id)}
                move={(d) => move(r.company_id, d)}
              />
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No roles yet.</p>
        )}
        <ActionForm
          key={state.added}
          action={formAction}
          className="grid items-end gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
          noValidate
        >
          <SelectField
            name="company_id"
            label="Company"
            placeholder="Choose…"
            options={available.map((c) => ({ value: c.id, label: c.name }))}
            error={errors.company_id}
          />
          <TextField name="role_title" label="Role (optional)" maxLength={160} error={errors.role_title} />
          <SubmitButton pendingText="Adding…" className="w-auto px-5">
            Add role
          </SubmitButton>
        </ActionForm>
      </div>
    </section>
  );
}
