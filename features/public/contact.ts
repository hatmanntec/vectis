"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { createSupabasePublicClient } from "@/lib/supabase/public";

/**
 * The Contact page form. Messages are saved through the database function
 * submit_enquiry(), which checks every field again, limits each sender to 5
 * messages an hour, and stores only a one-way fingerprint of their address.
 * Only administrators can read enquiries.
 */

export type ContactState = { ok: boolean; message?: string; errors?: Record<string, string> } | null;

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(120, "Please use 120 characters or fewer."),
  email: z.string().trim().max(254, "Please check your email address.").email("Please enter a valid email address."),
  phone: z.string().trim().max(40, "Please use 40 characters or fewer."),
  organisation: z.string().trim().max(200, "Please use 200 characters or fewer."),
  subject: z.string().trim().max(200, "Please use 200 characters or fewer."),
  message: z.string().trim().min(1, "Please enter your message.").max(5000, "Please keep your message under 5,000 characters."),
});

const DB_ERRORS: Record<string, [string, string]> = {
  invalid_name: ["name", "Please enter your name (up to 120 characters)."],
  invalid_email: ["email", "Please enter a valid email address."],
  invalid_message: ["message", "Please enter your message (up to 5,000 characters)."],
};

export async function sendEnquiry(_prev: ContactState, formData: FormData): Promise<ContactState> {
  // A field hidden from people; automated spam tends to fill it in. Pretend it worked.
  if (String(formData.get("website") ?? "").trim() !== "") return { ok: true };

  const parsed = schema.safeParse({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    organisation: String(formData.get("organisation") ?? ""),
    subject: String(formData.get("subject") ?? ""),
    message: String(formData.get("message") ?? ""),
  });
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const i of parsed.error.issues) errors[String(i.path[0])] ??= i.message;
    return { ok: false, message: "Please check the highlighted fields.", errors };
  }

  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0]?.trim() || h.get("x-real-ip") || null;
  const v = parsed.data;
  const { error } = await createSupabasePublicClient().rpc("submit_enquiry", {
    p_name: v.name,
    p_email: v.email,
    p_message: v.message,
    p_phone: v.phone || undefined,
    p_organisation: v.organisation || undefined,
    p_subject: v.subject || undefined,
    p_client_ip: ip ?? undefined,
  });
  if (error) {
    if (error.hint === "rate_limited") return { ok: false, message: "Too many messages have been sent. Please try again later." };
    const known = error.hint ? DB_ERRORS[error.hint] : undefined;
    if (known) return { ok: false, message: "Please check the highlighted fields.", errors: { [known[0]]: known[1] } };
    return { ok: false, message: "Your message couldn't be sent just now. Please try again in a moment." };
  }
  return { ok: true };
}
