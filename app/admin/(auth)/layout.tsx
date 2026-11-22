import { Logo } from "@/components/brand/logo";

/** The frame shared by the login and password screens. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-1 flex-col">
      <div className="h-1.5 bg-indigo" aria-hidden />
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md border border-border bg-white">
          <div className="flex flex-col items-center border-b border-border px-8 pt-8 pb-6">
            <Logo width={150} priority />
            <p className="mt-3 text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
              Content Management
            </p>
          </div>
          <div className="px-8 py-8">{children}</div>
        </div>
      </div>
      <p className="pb-8 text-center text-xs text-muted-foreground">
        Authorised VECTIS administrators only. Activity is recorded.
      </p>
    </main>
  );
}
