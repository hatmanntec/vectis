"use client";

import { useActionState, useId } from "react";
import { CheckCircle2 } from "lucide-react";
import { sendEnquiry, type ContactState } from "../contact";

function Field({
  name,
  label,
  type = "text",
  required,
  autoComplete,
  error,
  textarea,
  maxLength,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  error?: string;
  textarea?: boolean;
  maxLength: number;
}) {
  const id = useId();
  const cls = `min-h-12 w-full border bg-white px-4 py-3 text-base transition-colors duration-200 hover:border-indigo focus-visible:border-indigo ${error ? "border-destructive" : "border-steel"}`;
  return (
    <div className={textarea ? "sm:col-span-2" : ""}>
      <label htmlFor={id} className="t-label mb-2 block text-graphite">
        {label}
        {required ? <span className="text-indigo"> *</span> : <span className="text-[var(--ink-muted)] normal-case tracking-normal"> (optional)</span>}
      </label>
      {textarea ? (
        <textarea id={id} name={name} rows={6} required={required} maxLength={maxLength} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-e` : undefined} className={cls} />
      ) : (
        <input id={id} name={name} type={type} required={required} maxLength={maxLength} autoComplete={autoComplete} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-e` : undefined} className={cls} />
      )}
      {error ? (
        <p id={`${id}-e`} className="mt-1.5 text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function ContactForm({ successMessage }: { successMessage: string | null }) {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendEnquiry, null);
  if (state?.ok) {
    return (
      <div role="status" className="flex items-start gap-4 border border-teal/30 bg-white p-8">
        <CheckCircle2 className="size-6 shrink-0 text-teal" aria-hidden />
        <p className="text-lg leading-relaxed whitespace-pre-line text-graphite">
          {successMessage ?? "Thank you. Your message has been sent, and we will reply as soon as we can."}
        </p>
      </div>
    );
  }
  const e = state?.errors ?? {};
  return (
    <form action={action} className="grid gap-6 border-t border-indigo pt-8 sm:grid-cols-2" noValidate>
      {state && !state.ok && state.message ? (
        <p role="alert" className="border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive sm:col-span-2">
          {state.message}
        </p>
      ) : null}
      <Field name="name" label="Name" required autoComplete="name" maxLength={120} error={e.name} />
      <Field name="email" label="Email" type="email" required autoComplete="email" maxLength={254} error={e.email} />
      <Field name="phone" label="Telephone" type="tel" autoComplete="tel" maxLength={40} error={e.phone} />
      <Field name="organisation" label="Organisation" autoComplete="organization" maxLength={200} error={e.organisation} />
      <div className="sm:col-span-2">
        <Field name="subject" label="Subject" maxLength={200} error={e.subject} />
      </div>
      <Field name="message" label="Message" required textarea maxLength={5000} error={e.message} />
      {/* Hidden from people (and screen readers); see contact.ts. */}
      <div className="hidden" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className="flex flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[var(--ink-muted)]">Your details are used only to reply to your message.</p>
        <button type="submit" disabled={pending} className="inline-flex min-h-12 items-center justify-center bg-indigo px-8 text-[0.9375rem] font-medium text-white transition-colors duration-200 hover:bg-[#1b2070] disabled:opacity-70">
          {pending ? "Sending…" : "Send message"}
        </button>
      </div>
    </form>
  );
}
