import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCorePage, getSettings } from "@/features/public/data";
import { pageMetadata } from "@/features/public/metadata";
import { Container, PageHeading } from "@/features/public/components/bits";
import { ContactForm } from "@/features/public/components/contact-form";
import { text } from "@/features/public/components/page-blocks";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCorePage("contact");
  return page ? pageMetadata({ title: page.title, seoTitle: page.seoTitle, description: page.seoDescription, image: page.ogImage, path: "/contact" }) : {};
}

export default async function ContactPage() {
  const [page, s] = await Promise.all([getCorePage("contact"), getSettings()]);
  if (!page) notFound();
  const hours = text(page, "office_hours");
  const details = s.address || s.phone || s.email || hours;
  return (
    <>
      <PageHeading eyebrow="Contact" title={page.title} intro={text(page, "intro")} />
      <Container className={`grid gap-12 py-14 sm:py-16 ${details ? "lg:grid-cols-[20rem_minmax(0,1fr)]" : ""}`}>
        {details ? (
          <aside className="space-y-8 text-sm">
            {s.address ? (
              <div>
                <h2 className="mb-2 font-sans text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">Address</h2>
                <p className="leading-relaxed whitespace-pre-line text-graphite">{s.address}</p>
              </div>
            ) : null}
            {s.phone ? (
              <div>
                <h2 className="mb-2 font-sans text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">Telephone</h2>
                <a href={`tel:${s.phone.replace(/[^\d+]/g, "")}`} className="text-indigo underline">
                  {s.phone}
                </a>
              </div>
            ) : null}
            {s.email ? (
              <div>
                <h2 className="mb-2 font-sans text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">Email</h2>
                <a href={`mailto:${s.email}`} className="break-all text-indigo underline">
                  {s.email}
                </a>
              </div>
            ) : null}
            {hours ? (
              <div>
                <h2 className="mb-2 font-sans text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">Office hours</h2>
                <p className="leading-relaxed whitespace-pre-line text-graphite">{hours}</p>
              </div>
            ) : null}
          </aside>
        ) : null}
        <div>
          <h2 className="mb-6 text-2xl font-medium">Send us a message</h2>
          <ContactForm successMessage={text(page, "form_success_message")} />
        </div>
      </Container>
    </>
  );
}
