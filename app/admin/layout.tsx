import type { Metadata } from "next";

/** Everything under /admin: never indexed by search engines. */
export const metadata: Metadata = {
  title: { default: "VECTIS CMS", template: "%s · VECTIS CMS" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return children;
}
