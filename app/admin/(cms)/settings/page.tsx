import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/cms/page-parts";
import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getMediaByIds } from "@/features/media/queries";
import { updateSettings } from "@/features/settings/actions";
import { SettingsForm } from "@/features/settings/components/settings-form";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="Site-wide details used across the public website." />
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
        <Settings />
      </Suspense>
    </>
  );
}

async function Settings() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { data: s, error } = await supabase.from("website_settings").select("*").eq("id", 1).single();
  if (error || !s) throw new Error("The website settings could not be loaded.");

  const media = await getMediaByIds([s.logo_media_id, s.og_image_media_id]);
  const pick = (id: string | null) => {
    const m = id ? media.get(id) : undefined;
    return m ? { id: m.id, file_name: m.file_name, alt_text: m.alt_text, previewUrl: m.previewUrl } : null;
  };
  const social =
    s.social_links && typeof s.social_links === "object" && !Array.isArray(s.social_links)
      ? (s.social_links as Record<string, string>)
      : {};

  return (
    <SettingsForm
      action={updateSettings}
      values={{
        site_name: s.site_name,
        tagline: s.tagline,
        contact_email: s.contact_email,
        contact_phone: s.contact_phone,
        contact_address: s.contact_address,
        seo_default_title: s.seo_default_title,
        seo_default_description: s.seo_default_description,
        social_links: social,
        logo: pick(s.logo_media_id),
        ogImage: pick(s.og_image_media_id),
      }}
    />
  );
}
