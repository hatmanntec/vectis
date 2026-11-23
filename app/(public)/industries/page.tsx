import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSiteMap, listBusinesses, listSectors } from "@/features/public/data";
import { pageMetadata } from "@/features/public/metadata";
import { clusterOf } from "@/features/public/clusters";
import { Container, PublicImage } from "@/features/public/components/bits";
import { PageHero } from "@/features/public/components/editorial";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "Industries",
    description: "The sectors in which VECTIS businesses operate, and the businesses in each.",
    path: "/industries",
  });
}

/**
 * Every published sector (CMS > Sectors), in the CMS's order, with its
 * description, picture and the VECTIS businesses in it. Each sector has its
 * own anchor (/industries#oil-and-gas), used by the home page.
 */
export default async function IndustriesPage() {
  const [sectors, businesses, site] = await Promise.all([listSectors(), listBusinesses(), getSiteMap()]);
  if (!sectors.length) notFound();
  const showBusinesses = site.core.has("businesses");

  return (
    <>
      <PageHero
        crumbs={[{ label: "VECTIS", href: "/" }, { label: "Industries" }]}
        title="Industries"
        lead="The sectors in which VECTIS businesses operate, and the businesses in each."
      />
      <Container className="py-14 lg:py-20">
        <nav aria-label="Sectors on this page" className="mb-16 border-y border-steel py-6 lg:grid lg:grid-cols-12 lg:gap-6">
          <p className="t-label mb-4 text-[var(--ink-muted)] lg:col-span-2 lg:mb-0 lg:pt-1">Jump to</p>
          <ol className="grid gap-x-6 gap-y-1 sm:grid-cols-2 lg:col-span-10 lg:grid-cols-3">
            {sectors.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.slug}`} className="flex min-h-10 items-baseline gap-3 text-[0.9375rem] text-graphite underline-offset-4 hover:text-indigo hover:underline">
                  <span className="t-label t-index">{String(i + 1).padStart(2, "0")}</span>
                  {s.name}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <ol className="border-t border-indigo">
          {sectors.map((s, i) => {
            const inSector = businesses.filter((b) => b.sectors.some((x) => x.slug === s.slug));
            return (
              <li key={s.id} id={s.slug} className="reveal scroll-mt-32 border-b border-steel py-10 lg:grid lg:grid-cols-12 lg:gap-6 lg:py-14">
                <p className="t-label t-index lg:col-span-1 lg:pt-2">{String(i + 1).padStart(2, "0")}</p>
                <div className="mt-3 lg:col-span-6 lg:mt-0">
                  <h2 className="t-h3 text-indigo lg:text-[2rem]">{s.name}</h2>
                  {s.description ? <p className="t-body mt-4 whitespace-pre-line text-[var(--ink-muted)]">{s.description}</p> : null}
                  {s.cover ? (
                    <div className="reveal-image mt-8">
                      <PublicImage img={s.cover} className="aspect-[16/9] w-full object-cover" />
                    </div>
                  ) : null}
                </div>
                <div className="mt-8 lg:col-span-4 lg:col-start-9 lg:mt-0 lg:pt-2">
                  <p className="t-label text-[var(--ink-muted)]">
                    {inSector.length ? `VECTIS businesses · ${inSector.length}` : "VECTIS businesses"}
                  </p>
                  {inSector.length ? (
                    <ul className="mt-3 border-t border-steel">
                      {inSector.map((b) => {
                        const cluster = clusterOf(b);
                        return (
                          <li key={b.id} className="border-b border-steel">
                            {showBusinesses ? (
                              <Link href={`/businesses/${b.slug}`} className="group flex min-h-12 flex-col justify-center py-2">
                                <span className="font-serif text-lg text-indigo group-hover:underline group-hover:underline-offset-4">{b.name}</span>
                                {cluster.key !== "other" ? <span className="t-label mt-0.5 text-[var(--ink-muted)]">{cluster.name}</span> : null}
                              </Link>
                            ) : (
                              <span className="flex min-h-12 items-center font-serif text-lg text-indigo">{b.name}</span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="mt-3 border-t border-steel pt-3 text-[0.9375rem] text-[var(--ink-muted)]">None listed yet.</p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </Container>
    </>
  );
}
