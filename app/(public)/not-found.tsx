import { Container } from "@/features/public/components/bits";
import { ButtonLink } from "@/features/public/components/editorial";

export default function NotFound() {
  return (
    <section className="flex min-h-[100svh] flex-1 items-center bg-ivory">
      <Container className="enter py-24 lg:py-32">
        <p className="t-label text-[var(--ink-muted)]">Page not found</p>
        <h1 className="t-h1 mt-6 max-w-3xl text-indigo">We couldn&apos;t find that page</h1>
        <p className="t-lead mt-6 max-w-xl text-[var(--ink-muted)]">It may have moved, or it isn&apos;t available yet.</p>
        <div className="mt-10">
          <ButtonLink href="/">Go to the home page</ButtonLink>
        </div>
      </Container>
    </section>
  );
}
