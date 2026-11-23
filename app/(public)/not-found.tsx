import Link from "next/link";
import { Container } from "@/features/public/components/bits";

export default function NotFound() {
  return (
    <Container className="flex flex-1 flex-col items-start justify-center py-24">
      <p className="mb-4 text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">Page not found</p>
      <h1 className="text-4xl font-medium sm:text-5xl">We couldn&apos;t find that page</h1>
      <div className="mt-6 h-px w-16 bg-copper" aria-hidden />
      <p className="mt-6 max-w-xl text-lg text-muted-foreground">It may have moved, or it isn&apos;t available yet.</p>
      <Link href="/" className="mt-8 inline-flex h-12 items-center bg-indigo px-6 text-sm font-medium text-white hover:bg-[#1b2070]">
        Go to the home page
      </Link>
    </Container>
  );
}
