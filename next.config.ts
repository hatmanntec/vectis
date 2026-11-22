import type { NextConfig } from "next";

/**
 * Baseline security headers, sent with every response.
 * A full Content-Security-Policy is added in milestone M3, together with
 * authentication, once the Supabase domains it must allow are known.
 */
const securityHeaders = [
  // Stop other sites from showing VECTIS pages (including the CMS) inside a frame.
  { key: "X-Frame-Options", value: "DENY" },
  // Stop browsers from guessing file types (blocks some upload-based attacks).
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Send only the site's origin to other websites, never full CMS URLs.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Switch off browser features the site never uses.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  // Always use HTTPS once a visitor has been to the site.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
