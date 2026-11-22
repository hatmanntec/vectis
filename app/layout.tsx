import type { Metadata } from "next";
import "@fontsource-variable/ibm-plex-sans";
import "@fontsource-variable/source-serif-4";
import "./globals.css";

// Fonts are self-hosted from npm packages (no request to Google at build or run time).

export const metadata: Metadata = {
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
