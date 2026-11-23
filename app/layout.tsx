import type { Metadata } from "next";
import "@fontsource-variable/ibm-plex-sans";
import "@fontsource-variable/source-serif-4";
import "@fontsource-variable/fraunces/opsz.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "./globals.css";

// Fonts are self-hosted from npm packages (no request to Google at build or run time).

export const metadata: Metadata = {
  // The site's public address (set in Vercel), used to build full links for sharing and search engines.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "VECTIS",
    template: "%s · VECTIS",
  },
  description: "VECTIS — a diversified Nigerian business organisation. Est. 1956.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-GB" className="h-full">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
