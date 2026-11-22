import { cacheLife } from "next/cache";
import { Logo } from "@/components/brand/logo";

/** The current year, cached for a day so the page can still be served statically. */
async function currentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

/**
 * Temporary public holding page.
 * Replaced by the database-driven homepage in Phase 4.
 * It deliberately says nothing about the organisation beyond the logo:
 * no content is published until it comes from the CMS.
 */
export default async function HoldingPage() {
  const year = await currentYear();

  return (
    <main className="flex flex-1 flex-col">
      <div className="h-1.5 bg-indigo" aria-hidden />

      <section className="flex flex-1 items-center justify-center px-6 py-20">
        <div className="w-full max-w-xl border border-border bg-white px-8 py-14 text-center sm:px-14">
          <Logo width={260} priority className="mx-auto" />

          <div className="mx-auto my-10 h-px w-16 bg-copper" aria-hidden />

          <h1 className="text-2xl font-medium sm:text-3xl">
            Our new website is being prepared
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Please check back soon.
          </p>
        </div>
      </section>

      <footer className="border-t border-border px-6 py-6 text-center text-sm text-muted-foreground">
        © {year} VECTIS · Est. 1956 · Nigeria
      </footer>
    </main>
  );
}
