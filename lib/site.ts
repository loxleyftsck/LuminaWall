/**
 * Canonical origin used by metadata, robots.txt and the sitemap.
 *
 * Vercel sets VERCEL_PROJECT_PRODUCTION_URL at build time to the
 * project's own production domain (host only, no protocol), so this
 * tracks the real deployment instead of a hardcoded guess that can
 * silently point at somebody else's site. NEXT_PUBLIC_SITE_URL takes
 * precedence once a custom domain is in play.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");
