import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCorePage, getSettings } from "@/features/public/data";
import { pageMetadata } from "@/features/public/metadata";
import { Container, Facts, PageHeading } from "@/features/public/components/bits";
import { ContactForm } from "@/features/public/components/contact-form";
import { text } from "@/features/public/components/page-blocks";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCorePage("contact");
  return page ? pageMetadata({ title: page.title, seoTitle: page.seoTitle, description: page.seoDescription, image: page.ogImage, path: "/contact" }) : {};
}

/** Contact details (from Settings) and office hours beside the enquiry form, which is unchanged. */
export default async function ContactPage() {
  const [page, s] = await Promise.all([getCorePage("contact"), getSettings()]);
  if (!page) notFound();
  const hours = text(page, "office_hours");
  const details = s.address || s.phone || s.email || hours;
  const link = "text-indigo underline underline-offset-4 hover:no-underline";
  return (
    <>
      <PageHeading title={page.title} intro={text(page, "intro")} />
      <Container className="grid gap-12 py-14 lg:grid-cols-12 lg:gap-6 lg:py-20">
        {details ? (
          <aside aria-labelledby="contact-details" className="reveal lg:col-span-4">
            <h2 id="contact-details" className="t-h3 mb-6 text-indigo">
              Contact details
            </h2>
            <Facts
              items={[
                { label: "Address", value: s.address ? <span className="whitespace-pre-line">{s.address}</span> : null },
                { label: "Telephone", value: s.phone ? <a href={`tel:${s.phone.replace(/[^\d+]/g, "")}`} className={link}>{s.phone}</a> : null },
                { label: "Email", value: s.email ? <a href={`mailto:${s.email}`} className={`break-all ${link}`}>{s.email}</a> : null },
                { label: "Office hours", value: hours ? <span className="whitespace-pre-line">{hours}</span> : null },
              ]}
            />
          </aside>
        ) : null}
        <div className={`reveal ${details ? "lg:col-span-7 lg:col-start-6" : "lg:col-span-8"}`}>
          <h2 className="t-h3 mb-6 text-indigo">Send us a message</h2>
          <ContactForm successMessage={text(page, "form_success_message")} />
        </div>
      </Container>
    </>
  );
}
