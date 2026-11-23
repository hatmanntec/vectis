import type { Metadata } from "next";
import "@fontsource-variable/ibm-plex-sans";
import "@fontsource-variable/source-serif-4";
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
  // Browser tab icon: the master logo file itself, unaltered. A purpose-made
  // icon can replace it once the brand owner supplies one.
  icons: { icon: [{ url: "/brand/vectis-logo.jpg", type: "image/jpeg" }] },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-GB" className="h-full">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
