import type { NextConfig } from "next";

/**
 * Content-Security-Policy: tells browsers which sources a page may load
 * scripts, images, styles and connections from. Anything else is blocked,
 * which limits the damage if malicious content ever got onto a page.
 *
 * Note: the stricter "nonce" form of this policy can't be used with the
 * caching mode this site uses (Next.js documents the two as incompatible),
 * so inline scripts from Next.js itself are allowed. React escapes all
 * content and the site never inserts raw HTML, which is the main defence.
 */
const isDev = process.env.NODE_ENV === "development";
const supabaseOrigin = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").origin;
  } catch {
    return "";
  }
})();

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' blob: data: ${supabaseOrigin}`.trim(),
  "font-src 'self'",
  `connect-src 'self' ${supabaseOrigin}`.trim(),
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

/** Security headers, sent with every response. */
const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
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
  // Public website data is kept for up to a minute, then refreshed in the background.
  // So CMS changes (and scheduled news) reach the website within about a minute.
  cacheLife: {
    // SITE_CACHE_SECONDS can shorten this (used by the automated tests).
    site: (() => {
      const seconds = Math.max(1, Number(process.env.SITE_CACHE_SECONDS) || 60);
      return { stale: 30, revalidate: seconds, expire: 86400 };
    })(),
  },
  partialPrefetching: true,
  poweredByHeader: false,
  images: {
    // Public files in Supabase Storage may be resized and optimised by Next.js.
    remotePatterns: supabaseOrigin ? [new URL(`${supabaseOrigin}/storage/v1/object/public/**`)] : [],
  },
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
