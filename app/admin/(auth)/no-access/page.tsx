import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth/actions";

export const metadata: Metadata = { title: "No access" };

export default function NoAccessPage() {
  return (
    <>
      <h1 className="text-2xl">No access to the CMS</h1>
      <p className="mt-2 mb-6 text-sm leading-relaxed text-muted-foreground">
        You&apos;re signed in, but this account isn&apos;t an active VECTIS administrator. If you think this is
        a mistake, contact the person who manages the VECTIS website.
      </p>
      <form action={signOut}>
        <Button type="submit" variant="outline" className="w-full">
          Sign out
        </Button>
      </form>
    </>
  );
}
